/**
 * ONE-TIME DATA WIPE SCRIPT
 * ---------------------------------------------------------------------------
 * Deletes every document from BuildConnect's Firestore collections (and,
 * optionally, every Firebase Authentication user) so the project can be
 * demoed / handed over with a genuinely empty database.
 *
 * This uses the Firebase ADMIN SDK, not the web app's client SDK, so it
 * bypasses firestore.rules entirely. Treat it as dangerous — it is
 * irreversible and is meant to be run exactly once, by hand, from your own
 * machine. It is never imported by the website itself.
 *
 * -----------------------------------------------------------------------
 * SETUP (one time)
 * -----------------------------------------------------------------------
 * 1. Firebase Console > Project Settings > Service Accounts > Generate new
 *    private key. This downloads a JSON file.
 * 2. Save it as  scripts/serviceAccountKey.json  (this exact path is already
 *    gitignored — see .gitignore — so it will never be committed).
 * 3. Install the one extra dependency this script needs:
 *      npm install --save-dev firebase-admin
 *
 * -----------------------------------------------------------------------
 * USAGE
 * -----------------------------------------------------------------------
 *   node scripts/wipe-data.js --yes
 *
 * Flags:
 *   --yes            Required. Without it the script only prints what it
 *                     WOULD delete (dry run) and exits.
 *   --include-auth   Also deletes every Firebase Authentication user
 *                     (i.e. removes test logins, not just their Firestore
 *                     profile docs). Off by default.
 *
 * Examples:
 *   node scripts/wipe-data.js                     # dry run, Firestore only
 *   node scripts/wipe-data.js --yes                # wipe Firestore data
 *   node scripts/wipe-data.js --yes --include-auth # wipe Firestore + Auth
 */

import { readFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'

const __dirname = dirname(fileURLToPath(import.meta.url))
const serviceAccountPath = join(__dirname, 'serviceAccountKey.json')

const args = process.argv.slice(2)
const confirmed = args.includes('--yes')
const includeAuth = args.includes('--include-auth')

if (!existsSync(serviceAccountPath)) {
  console.error(
    '\n✖ scripts/serviceAccountKey.json not found.\n' +
      '  Download it from Firebase Console > Project Settings > Service Accounts\n' +
      '  > Generate new private key, and save it at that exact path.\n'
  )
  process.exit(1)
}

const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'))

initializeApp({ credential: cert(serviceAccount) })
const db = getFirestore()
const auth = getAuth()

// Top-level collections used by BuildConnect. 'conversations' also has a
// 'messages' subcollection per document, which is handled separately below.
const TOP_LEVEL_COLLECTIONS = [
  'users',
  'projects',
  'quotations',
  'hires',
  'payments',
  'conversations',
  'reviews',
  'notifications',
  'disputes',
]

const BATCH_SIZE = 300

async function deleteCollection(collectionPath) {
  const collectionRef = db.collection(collectionPath)
  let total = 0

  while (true) {
    const snapshot = await collectionRef.limit(BATCH_SIZE).get()
    if (snapshot.empty) break

    const batch = db.batch()
    snapshot.docs.forEach((doc) => batch.delete(doc.ref))
    await batch.commit()

    total += snapshot.size
    if (snapshot.size < BATCH_SIZE) break
  }

  return total
}

async function deleteConversationMessages() {
  const conversationsSnap = await db.collection('conversations').get()
  let total = 0

  for (const convoDoc of conversationsSnap.docs) {
    const messagesRef = convoDoc.ref.collection('messages')
    while (true) {
      const snapshot = await messagesRef.limit(BATCH_SIZE).get()
      if (snapshot.empty) break

      const batch = db.batch()
      snapshot.docs.forEach((doc) => batch.delete(doc.ref))
      await batch.commit()

      total += snapshot.size
      if (snapshot.size < BATCH_SIZE) break
    }
  }

  return total
}

async function countCollection(collectionPath) {
  const snapshot = await db.collection(collectionPath).count().get()
  return snapshot.data().count
}

async function deleteAllAuthUsers() {
  let total = 0
  let pageToken = undefined

  while (true) {
    const result = await auth.listUsers(1000, pageToken)
    if (result.users.length === 0) break

    const uids = result.users.map((u) => u.uid)
    await auth.deleteUsers(uids)
    total += uids.length

    pageToken = result.pageToken
    if (!pageToken) break
  }

  return total
}

async function main() {
  console.log('BuildConnect — one-time data wipe')
  console.log('==================================\n')

  console.log('Scanning Firestore collections...')
  const counts = {}
  for (const name of TOP_LEVEL_COLLECTIONS) {
    counts[name] = await countCollection(name)
  }

  let authUserCount = null
  if (includeAuth) {
    const listResult = await auth.listUsers(1000)
    authUserCount = listResult.users.length
  }

  console.log('\nDocuments found:')
  for (const [name, count] of Object.entries(counts)) {
    console.log(`  ${name.padEnd(15)} ${count}`)
  }
  if (includeAuth) {
    console.log(`  ${'auth users'.padEnd(15)} ${authUserCount}+ (first page shown)`)
  }

  if (!confirmed) {
    console.log(
      '\nDry run only — nothing was deleted.\n' +
        'Re-run with --yes to actually delete this data' +
        (includeAuth ? ' (and Auth users, since --include-auth was passed).' : '.')
    )
    return
  }

  console.log('\n--yes passed. Deleting now...\n')

  console.log('Deleting conversation messages (subcollections)...')
  const messagesDeleted = await deleteConversationMessages()
  console.log(`  ✓ ${messagesDeleted} messages deleted`)

  for (const name of TOP_LEVEL_COLLECTIONS) {
    const deleted = await deleteCollection(name)
    console.log(`  ✓ ${name}: ${deleted} documents deleted`)
  }

  if (includeAuth) {
    console.log('\nDeleting Firebase Authentication users...')
    const deletedUsers = await deleteAllAuthUsers()
    console.log(`  ✓ ${deletedUsers} auth users deleted`)
  }

  console.log('\nDone. Firestore' + (includeAuth ? ' and Auth are' : ' is') + ' now empty.')
  if (!includeAuth) {
    console.log(
      'Note: Firebase Authentication accounts were left untouched.\n' +
        'Re-run with --include-auth if you also want test logins removed.'
    )
  }
}

main().catch((err) => {
  console.error('\n✖ Wipe failed:', err)
  process.exit(1)
})

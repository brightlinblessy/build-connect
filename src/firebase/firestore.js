// Firestore data access functions.
// Covers the Core Modules from the mockup: Project Management,
// Quotation System, Messaging System, Payment System, Review & Rating,
// Portfolio Management, Notification System, Dispute Management.
//
// Collections used:
//   users            - all roles (client, civilEngineer, architect,
//                       structuralEngineer, mepEngineer, contractor)
//   projects         - posted by clients
//   quotations       - submitted by engineers against a project
//   hires            - engineer<->project<->client hire records
//   payments         - milestone / full / escrow / advance payments
//   messages         - chat messages, grouped by conversationId
//   conversations    - one doc per client<->engineer thread
//   reviews          - ratings left after project completion
//   notifications    - per-user notification feed
//   disputes         - raised against a project or payment

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  getCountFromServer,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './config'
import { ENGINEER_ROLE_IDS } from '../utils/roles'

// ---------- Projects ----------

export function postProject(clientId, data) {
  return addDoc(collection(db, 'projects'), {
    clientId,
    status: 'Open', // Open | In Progress | In Review | Completed | Cancelled
    createdAt: serverTimestamp(),
    ...data,
  })
}

export async function getProjectsByClient(clientId) {
  const q = query(collection(db, 'projects'), where('clientId', '==', clientId), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function getOpenProjects() {
  const q = query(collection(db, 'projects'), where('status', '==', 'Open'), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

// Projects an engineer has been hired/assigned onto (i.e. no longer Open).
export async function getProjectsByEngineer(engineerId) {
  const q = query(collection(db, 'projects'), where('engineerId', '==', engineerId), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export function updateProjectStatus(projectId, status) {
  return updateDoc(doc(db, 'projects', projectId), { status })
}

// Full edit of a project's own fields (title, category, location, budget,
// deadline, description, visibility, attachments) — as opposed to
// updateProjectStatus above, which only touches the workflow status.
export function updateProject(projectId, data) {
  return updateDoc(doc(db, 'projects', projectId), { ...data, updatedAt: serverTimestamp() })
}

// ---------- Quotations ----------

export function submitQuotation(data) {
  // data: { projectId, engineerId, amount, durationDays, description, attachments }
  return addDoc(collection(db, 'quotations'), {
    status: 'Pending', // Pending | Accepted | Rejected
    createdAt: serverTimestamp(),
    ...data,
  })
}

export async function getQuotationsByProject(projectId) {
  const q = query(collection(db, 'quotations'), where('projectId', '==', projectId))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function getQuotationsByClient(clientId) {
  const q = query(collection(db, 'quotations'), where('clientId', '==', clientId), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function getQuotationsByEngineer(engineerId) {
  const q = query(collection(db, 'quotations'), where('engineerId', '==', engineerId), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export function respondToQuotation(quotationId, status) {
  return updateDoc(doc(db, 'quotations', quotationId), { status })
}

// Full "accept" workflow: marks the quotation Accepted, moves the project
// into progress and assigns the engineer, auto-rejects any other pending
// quotations on the same project, creates a hire record, and notifies the
// engineer. Keeping this in one place avoids the four collections drifting
// out of sync with each other.
export async function acceptQuotation(quotation) {
  const { id: quotationId, projectId, projectTitle, engineerId, engineerName, clientId, clientName, amount, durationDays } = quotation

  await updateDoc(doc(db, 'quotations', quotationId), { status: 'Accepted' })

  if (projectId) {
    await updateDoc(doc(db, 'projects', projectId), {
      status: 'In Progress',
      engineerId,
      engineerName: engineerName || '',
      acceptedAmount: amount,
      acceptedDurationDays: durationDays || null,
    })

    const others = await getQuotationsByProject(projectId)
    await Promise.all(
      others
        .filter((o) => o.id !== quotationId && o.status === 'Pending')
        .map((o) => updateDoc(doc(db, 'quotations', o.id), { status: 'Rejected' })),
    )
  }

  await addDoc(collection(db, 'hires'), {
    clientId,
    engineerId,
    engineerName: engineerName || '',
    clientName: clientName || '',
    projectId: projectId || null,
    projectTitle: projectTitle || '',
    status: 'Active',
    createdAt: serverTimestamp(),
  })

  await pushNotification(engineerId, {
    type: 'quotation',
    title: 'Quotation accepted!',
    message: `Your quotation for "${projectTitle || 'a project'}" was accepted.`,
  })
}

export async function rejectQuotation(quotation) {
  await updateDoc(doc(db, 'quotations', quotation.id), { status: 'Rejected' })
  if (quotation.engineerId) {
    await pushNotification(quotation.engineerId, {
      type: 'quotation',
      title: 'Quotation update',
      message: `Your quotation for "${quotation.projectTitle || 'a project'}" was not selected this time.`,
    })
  }
}

// ---------- Hires ----------

export function createHire(data) {
  // data: { projectId, clientId, engineerId }
  return addDoc(collection(db, 'hires'), { createdAt: serverTimestamp(), ...data })
}

export async function getHiredEngineers(clientId) {
  const q = query(collection(db, 'hires'), where('clientId', '==', clientId))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

// Hire records only store IDs, so join each one with the engineer's
// current profile (name/photo/role may have changed since the hire).
export async function getHiredEngineersWithProfiles(clientId) {
  const hires = await getHiredEngineers(clientId)
  return Promise.all(
    hires.map(async (hire) => ({
      ...hire,
      engineer: await getDocumentById('users', hire.engineerId),
    })),
  )
}

// ---------- Engineers (browse & hire) ----------

// All registered engineers (any of the 5 specialties), for the client's
// "Find Engineers" directory. Firestore's `in` operator supports up to
// 10 values, which comfortably covers ENGINEER_ROLE_IDS.
export async function getEngineers() {
  const q = query(collection(db, 'users'), where('role', 'in', ENGINEER_ROLE_IDS))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function getEngineerById(id) {
  return getDocumentById('users', id)
}

// ---------- Payments ----------

export function createPayment(data) {
  // data: { projectId, clientId, engineerId, amount, method, type }
  // method: card | upi | netbanking | bank_transfer
  // type: milestone | full | escrow | advance
  return addDoc(collection(db, 'payments'), {
    status: 'Pending',
    createdAt: serverTimestamp(),
    ...data,
  })
}

export async function getPaymentsByClient(clientId) {
  const q = query(collection(db, 'payments'), where('clientId', '==', clientId), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function getPaymentsByEngineer(engineerId) {
  const q = query(collection(db, 'payments'), where('engineerId', '==', engineerId), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

// ---------- Messaging ----------

export async function getConversationsForUser(userId) {
  const q = query(
    collection(db, 'conversations'),
    where('participants', 'array-contains', userId),
    orderBy('lastMessageAt', 'desc'),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function getOrCreateConversation(userIdA, userIdB) {
  const participants = [userIdA, userIdB].sort()
  const q = query(collection(db, 'conversations'), where('participants', '==', participants))
  const snap = await getDocs(q)
  if (!snap.empty) return snap.docs[0].id
  const ref = await addDoc(collection(db, 'conversations'), {
    participants,
    createdAt: serverTimestamp(),
    lastMessage: '',
    lastMessageAt: serverTimestamp(),
  })
  return ref.id
}

export function sendMessage(conversationId, senderId, text) {
  const messagesRef = collection(db, 'conversations', conversationId, 'messages')
  updateDoc(doc(db, 'conversations', conversationId), {
    lastMessage: text,
    lastMessageAt: serverTimestamp(),
  })
  return addDoc(messagesRef, { senderId, text, createdAt: serverTimestamp() })
}

export function listenToMessages(conversationId, callback) {
  const q = query(
    collection(db, 'conversations', conversationId, 'messages'),
    orderBy('createdAt', 'asc'),
    limit(200),
  )
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  })
}

// ---------- Reviews & Ratings ----------

export function submitReview(data) {
  // data: { projectId, clientId, engineerId, rating, comment }
  return addDoc(collection(db, 'reviews'), { createdAt: serverTimestamp(), ...data })
}

export async function getReviewsForEngineer(engineerId) {
  const q = query(collection(db, 'reviews'), where('engineerId', '==', engineerId), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

// Reviews a client has already left, so the "Write Review" UI can show
// what was submitted instead of re-prompting for the same hire.
export async function getReviewsGivenByClient(clientId) {
  const q = query(collection(db, 'reviews'), where('clientId', '==', clientId))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

// ---------- Notifications ----------

export function pushNotification(userId, data) {
  return addDoc(collection(db, 'notifications'), {
    userId,
    read: false,
    createdAt: serverTimestamp(),
    ...data,
  })
}

export function listenToNotifications(userId, callback) {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(50),
  )
  return onSnapshot(q, (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))))
}

export function markNotificationRead(notificationId) {
  return updateDoc(doc(db, 'notifications', notificationId), { read: true })
}

// ---------- Disputes ----------

export function raiseDispute(data) {
  // data: { projectId, raisedBy, reason, description }
  return addDoc(collection(db, 'disputes'), {
    status: 'Open',
    createdAt: serverTimestamp(),
    ...data,
  })
}

export async function getAllDisputes() {
  const q = query(collection(db, 'disputes'), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

// ---------- Public platform stats (Home page) ----------

// Lightweight aggregate counts for the marketing homepage — real numbers
// straight from Firestore instead of hardcoded placeholders. Uses
// getCountFromServer so it doesn't have to download every document.
export async function getPlatformStats() {
  const [projectsSnap, completedSnap, engineersSnap, clientsSnap] = await Promise.all([
    getCountFromServer(collection(db, 'projects')),
    getCountFromServer(query(collection(db, 'projects'), where('status', '==', 'Completed'))),
    getCountFromServer(query(collection(db, 'users'), where('role', 'in', ENGINEER_ROLE_IDS))),
    getCountFromServer(query(collection(db, 'users'), where('role', '==', 'client'))),
  ])
  const projects = projectsSnap.data().count
  const completed = completedSnap.data().count
  return {
    projects,
    engineers: engineersSnap.data().count,
    clients: clientsSnap.data().count,
    successRate: projects ? Math.round((completed / projects) * 100) : 0,
  }
}

// A handful of registered engineers to showcase on the homepage.
export async function getFeaturedEngineers(max = 4) {
  const q = query(collection(db, 'users'), where('role', 'in', ENGINEER_ROLE_IDS), limit(max))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

// A handful of open projects to showcase on the homepage.
export async function getRecentOpenProjects(max = 4) {
  const q = query(collection(db, 'projects'), where('status', '==', 'Open'), orderBy('createdAt', 'desc'), limit(max))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export function deleteDocument(collectionName, id) {
  return deleteDoc(doc(db, collectionName, id))
}

export async function getDocumentById(collectionName, id) {
  const snap = await getDoc(doc(db, collectionName, id))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

# BuildConnect — Civil Engineer Marketplace

A React + Firebase web app connecting clients with civil engineers, architects,
structural/MEP engineers, and contractors — matching the provided product
mockup: homepage, role-based dashboards (Client / Engineer), auth,
messaging, quotations, payments, and reviews.

---

## 1. Tech Stack

- **Frontend:** React 18 + Vite, React Router, Tailwind CSS, Recharts, lucide-react icons
- **Backend:** Firebase (Authentication, Firestore, Storage, Hosting)

## 2. Project Structure

```
build-connect/
├── src/
│   ├── firebase/
│   │   ├── config.js        # Firebase app initialization
│   │   ├── auth.js          # Auth functions (email, Google, Facebook, phone OTP)
│   │   └── firestore.js     # All Firestore reads/writes (projects, quotations, payments, chat, etc.)
│   ├── context/AuthContext.jsx   # Global auth/user-profile state
│   ├── components/
│   │   ├── layout/          # Navbar, Footer, Dashboard sidebar/topbar/layout
│   │   └── common/          # StatCard, StatusBadge, PageHeader, ProtectedRoute
│   ├── data/                # Platform constants (categories, avatar helper) + nav configs
│   └── pages/
│       ├── auth/            # Login, Register, CivilEngineerRegister, ForgotPassword
│       ├── client/          # Client dashboard + all sub-pages
│       ├── engineer/        # Engineer dashboard + all sub-pages
│       └── *.jsx            # Public site: Home, FindEngineers, Projects, Services, Pricing, Blog, About, Contact, HelpCenter, EngineerProfile
├── firestore.rules          # Firestore security rules
├── firestore.indexes.json   # Composite indexes required by the app's queries
├── storage.rules            # Storage security rules
├── firebase.json            # Firebase Hosting/Firestore/Storage config
└── .env.example             # Firebase web config template
```

## 3. Local Setup

> Sections are numbered to match the app's setup order: **3** local setup,
> **4** the Civil Engineer Registration Form, **5** the full Firebase
> backend setup (including how to enable OTP — see 5.3).

```bash
npm install
cp .env.example .env      # then fill in your Firebase values (see Section 5)
npm run dev               # starts Vite dev server at http://localhost:5173
```

Build for production:

```bash
npm run build
npm run preview
```

---

## 4. Civil Engineer Registration Form

Besides the quick `/register` flow (name/email/password), the app has a
dedicated, detailed registration form for civil engineers at
**`/register/civil-engineer`** (`src/pages/auth/CivilEngineerRegister.jsx`).
It's linked from `/register` whenever "Engineer → Civil Engineer" is
selected, and is built so a civil engineer can put together a complete,
client-ready profile in one sitting:

- Full Name, Profile Photo, Date of Birth, Gender, Languages Known
- Mobile Number with **OTP verification** (see Section 5.3 below to enable it)
- Email Address, Password / Confirm Password
- Current Address, State, City, PIN Code
- Qualification (Diploma / BE / B.Tech / ME / M.Tech)
- Civil Engineering Specialization, Years of Experience, Preferred Job Location
- Skills (AutoCAD, Revit, STAAD Pro, ETABS, Primavera, MS Project, Surveying)
- Resume/CV Upload, Degree Certificate Upload, Government ID (Aadhaar/PAN), Portfolio/Project Images
- Availability (Immediate / Notice Period), Agree to Terms & Privacy Policy

On submit it calls `registerCivilEngineer()` in `src/firebase/auth.js`,
which creates the Firebase Auth account, uploads every file to Storage
under `avatars/{userId}/...` (photo) and `engineers/{userId}/...` (resume,
degree certificate, government ID, portfolio images — rules already
included in `storage.rules`), and writes the full profile — including
`phoneVerified: true` — to the `users/{uid}` document in Firestore with
`role: 'civilEngineer'`.

After signup, everyone can edit their own details at any time:

- **Engineers** — `/engineer/profile` (`EngineerProfileEditor.jsx`) has a
  real "Edit Profile" mode: change your photo, About text, DOB, gender,
  address, qualification, specialization, experience, preferred location,
  skills, languages, availability, replace your resume/degree
  certificate/Government ID, add more portfolio images (and remove old
  ones) — all backed by `updateUserProfile()` / `uploadUserFile()` in
  `src/firebase/auth.js`. This works the same whether the profile was
  created via the quick `/register` flow (which starts with no documents
  uploaded) or the detailed Civil Engineer form.
- **Clients** — `/client/profile` (`Profile.jsx`) has a working "Save
  Changes" that persists name, photo, phone, location, and company.
- **Everyone** — `/client/settings` or `/engineer/settings` (shared
  `Settings.jsx`) has working toggles (two-factor, email/SMS/marketing
  notifications) that save immediately, and a **Delete Account** flow
  (with a confirmation step) that removes both the Firestore profile and
  the Firebase Auth account.

Uploaded profile photos now also show up in the sidebar and topbar
avatars across the dashboards, instead of only the generated placeholder.

Clients can also now discover and hire these engineers:

- **`/client/engineers`** (`FindEngineers.jsx`) — a searchable, filterable
  directory of every registered engineer (search by name/skill/location,
  filter by specialty and availability), reading live from the `users`
  collection via `getEngineers()`.
- **`/client/engineers/:id`** (`EngineerPublicProfile.jsx`) — the full
  public profile (about, skills, qualification, resume/degree links,
  portfolio images) with a working **Hire Engineer** button. Hiring
  writes a record to the `hires` collection (`createHire()`) and pushes a
  notification to the engineer (`pushNotification()`); the button then
  flips to "Hired" so it can't be hired twice from that screen.
- **`/client/hired-engineers`** (`HiredEngineers.jsx`) — now lists real
  hire records joined with each engineer's current profile
  (`getHiredEngineersWithProfiles()`), instead of placeholder data, with
  links back to their profile and to Messages.

Messaging is fully functional and real-time, on both sides:

- **`/client/messages`** and **`/engineer/messages`** both render the
  same `src/pages/client/Messages.jsx` component — one inbox that works
  for whichever role is logged in, since a Firestore `conversations` doc
  just stores two `participants` and doesn't care who's client vs
  engineer.
- Clicking **Message** on an Engineer Profile or in Hired Engineers opens
  `/client/messages?with=<engineerId>`; the page calls
  `getOrCreateConversation()` to reuse an existing thread or start a new
  one, then selects it automatically.
- Conversations list in real order (`getConversationsForUser()`, ordered
  by `lastMessageAt`), each joined with the other participant's live
  name/photo. Selecting one subscribes to `listenToMessages()` — a
  Firestore `onSnapshot` listener — so messages appear instantly on both
  ends without refreshing, and `sendMessage()` writes them.
- Responsive: on narrow screens the conversation list and the open
  thread are separate views with a back button, instead of the thread
  being hidden entirely like before.

---

## 5. Firebase Backend Setup (step by step)

### 5.1 Create a Firebase project

1. Go to https://console.firebase.google.com and click **Add project**.
2. Name it (e.g. `build-connect`), disable/enable Google Analytics as you prefer, and create the project.

### 5.2 Register a Web App

1. In the Firebase console, open **Project Settings** (gear icon) → **General**.
2. Under "Your apps," click the **Web (</>)** icon and register an app (e.g. `build-connect-web`).
3. Copy the `firebaseConfig` values shown — you'll need them for `.env`.
4. Paste them into your `.env` file:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### 5.3 How to enable OTP (Phone) authentication

OTP verification is used in three places, all fully wired to real
Firebase Phone Auth (no stubs left):

- **Civil Engineer Registration** (`/register/civil-engineer`) — verifies
  the "Mobile Number" field before the account is created.
- **Settings → Link Phone Number** (`/client/settings` or
  `/engineer/settings`) — lets anyone already logged in (any role) verify
  a phone number and **link** it to their existing account.
- **Login → Phone OTP tab** (`/login`) — lets you log in with a phone
  number, *provided that number was linked to an account first* via
  Settings (see why below).

To turn OTP on end-to-end:

1. In the Firebase console, go to **Build → Authentication → Sign-in method**.
2. Click **Phone** in the providers list → **Enable** → **Save**.
3. (Recommended for development) Scroll to **Phone numbers for testing**
   and add a few fake numbers with fixed OTP codes (e.g. `+91 99999 99999`
   → `123456`) so you can test the flow without burning real SMS quota or
   waiting on carrier delivery.
4. Authorize your domain: **Authentication → Settings → Authorized
   domains** — `localhost` is included by default for local dev; add your
   production domain before deploying (e.g. `build-connect.web.app`).
5. No extra billing setup is required for a handful of test/dev OTPs —
   Firebase's Spark (free) plan includes a small monthly SMS quota; move
   to the Blaze plan before you expect real production volume.
6. Nothing else to configure in code — the app already wires up the full
   flow for you. `src/firebase/auth.js` exports:
   - `initRecaptcha(containerId)`, `sendOtp(phoneNumber, recaptchaVerifier)`
     — built on Firebase's invisible reCAPTCHA + `signInWithPhoneNumber`.
   - `confirmOtp(confirmationResult, code)` — signs in with the phone
     credential. Used during **registration** (verify, then immediately
     sign back out so it doesn't collide with the email/password account
     being created) and on the **Login** page (verify, then sign in as
     that phone-auth user).
   - `linkPhoneToAccount(confirmationResult, code)` — links the phone
     credential to whoever is *currently* logged in, via Firebase's
     `linkWithCredential`. This is what Settings uses, and it's the
     step that makes Phone OTP login actually resolve to the right
     account afterwards.

   **Why linking matters:** signing in with a phone number that was
   never linked to anything just creates a brand-new, blank Firebase
   user with no Firestore profile — not your existing account. The Login
   page detects this case (no profile found after verifying), signs that
   blank user back out, and tells the person to log in with email first
   and link their number from Settings. Once linked, Phone OTP login on
   `/login` correctly signs in as their real account from then on.
7. Test it: run `npm run dev`, log in with email, go to **Settings →
   Link Phone Number**, verify a number (use a test number from step 3),
   then log out and log back in using **Login → Phone OTP** with that
   same number.

### 5.4 Enable other Authentication providers

Go to **Build → Authentication → Sign-in method** and enable:

- **Email/Password** — required (used by Login/Register/Civil Engineer Registration pages)
- **Google** — click Enable, set a support email
- **Facebook** — requires a Facebook App ID + App Secret from https://developers.facebook.com; paste them into the Firebase provider settings, and add the OAuth redirect URI Firebase gives you back into your Facebook app settings
- *(Optional)* **LinkedIn** — Firebase has no built-in LinkedIn provider. To support it, enable a generic **OpenID Connect** provider under "Add new provider," and configure it with your LinkedIn OAuth app's client ID/secret and endpoints.

**Troubleshooting Google/Facebook sign-in errors:** the two most common
causes, in order of likelihood:

1. **Popup blocked or closed unexpectedly** (`auth/popup-blocked`,
   `auth/popup-closed-by-user`, `auth/cancelled-popup-request`). This
   happens a lot in practice — strict popup blockers, mobile/in-app
   browsers, and browsers enforcing Cross-Origin-Opener-Policy can all
   break `signInWithPopup` even when Google/Facebook are configured
   correctly. **The app already handles this**: `loginWithGoogle()` /
   `loginWithFacebook()` in `src/firebase/auth.js` automatically fall
   back to a full-page redirect (`signInWithRedirect`) whenever the
   popup fails, and `completeRedirectSignIn()` (wired into
   `AuthContext`) finishes the sign-in once the person is redirected
   back. No configuration needed — just make sure step 4 in Section 5.3
   (Authorized domains) includes whatever domain you're testing on,
   since redirect sign-in checks that too.
2. **Provider not enabled, or misconfigured** (`auth/operation-not-allowed`)
   — double check the provider is actually toggled **on** in the Firebase
   console (step above), and for Facebook specifically, that the App ID
   secret and OAuth redirect URI match exactly between Firebase and your
   Facebook Developer app.

### 5.5 Create the Firestore database

1. Go to **Build → Firestore Database → Create database**.
2. Choose **Production mode** (the included `firestore.rules` will secure it) and pick a region close to your users.
3. Firestore is schemaless — collections (`users`, `projects`, `quotations`, `hires`, `payments`, `conversations`, `reviews`, `notifications`, `disputes`) are created automatically the first time the app writes to them. See `src/firebase/firestore.js` for the exact shape of each document.

### 5.6 Enable Storage

1. Go to **Build → Storage → Get started**, and choose the same region as Firestore.
2. This is used for profile photos (`avatars/{userId}/...`), project/quotation attachments (`projects/{projectId}/...`, `quotations/{quotationId}/...`), and Civil Engineer registration documents — resume, degree certificate, government ID, portfolio images (`engineers/{userId}/...`).

### 5.7 Deploy security rules & indexes

Install the Firebase CLI once, globally:

```bash
npm install -g firebase-tools
firebase login
```

From the project root:

```bash
firebase init
# When prompted, select: Firestore, Storage, Hosting
# Choose "Use an existing project" and select the project you created
# Accept the default file names (firestore.rules, storage.rules, firebase.json)
#   — these files already exist in this repo, so choose "No" if asked to overwrite them
```

Then deploy the rules/indexes included in this repo:

```bash
firebase deploy --only firestore:rules,firestore:indexes,storage:rules
```

### 5.8 Deploy the frontend to Firebase Hosting (optional)

```bash
npm run build
firebase deploy --only hosting
```

---

## 6. Data Model Reference

| Collection      | Key fields                                                                 | Written by |
|------------------|-----------------------------------------------------------------------------|------------|
| `users`          | `name`, `email`, `role`, `photoURL`, `twoFactorEnabled`, `emailNotifications`, `smsNotifications`, `marketingEmails`, `createdAt`, `updatedAt` (clients also get `phone`, `location`, `company`; civil engineers also get `phone`, `phoneVerified`, `resumeURL`, `degreeCertificateURL`, `govIdURL`, `portfolioURLs[]`, `dob`, `gender`, `address`, `state`, `city`, `pinCode`, `qualification`, `specialization`, `experienceYears`, `preferredLocation`, `skills[]`, `languages`, `availability`, `about`) | Register / social login / Civil Engineer Registration Form / Profile & Settings pages |
| `projects`       | `clientId`, `title`, `category`, `budgetMin/Max`, `deadline`, `status`      | Client → Post Project |
| `quotations`     | `projectId`, `engineerId`, `amount`, `durationDays`, `status`               | Engineer → Submit Quotation |
| `hires`          | `projectId`, `clientId`, `engineerId`                                       | Client accepting a quotation |
| `payments`       | `projectId`, `clientId`, `engineerId`, `amount`, `method`, `type`, `status` | Client → Payments page |
| `conversations`  | `participants[]`, `lastMessage`, `lastMessageAt`                            | Chat page |
| `conversations/{id}/messages` | `senderId`, `text`, `createdAt`                               | Chat page |
| `reviews`        | `projectId`, `clientId`, `engineerId`, `rating`, `comment`                  | Client → Reviews page |
| `notifications`  | `userId`, `text`, `type`, `read`                                            | Server-side triggers / app events |
| `disputes`       | `projectId`, `raisedBy`, `reason`, `status`                                 | Dispute Management flow |

`role` on the `users` collection is one of: `client`, `civilEngineer`,
`architect`, `structuralEngineer`, `mepEngineer`, `contractor`. Route
guards (`ProtectedRoute`) use this to send each account to the correct
dashboard (`/client/...` or `/engineer/...`).

---

## 7. Notes on Images & Placeholder Data

- Avatars use [DiceBear](https://www.dicebear.com/) (license-free, generated from a name seed) as a fallback when someone hasn't uploaded a real profile photo yet.
- Project cards without an uploaded photo use a deterministic [Picsum](https://picsum.photos/) placeholder image seeded by the project's ID, purely for visual polish — no fake project data is stored or displayed.
- Every page reads and writes live Firestore data: Profile, Settings, Civil Engineer Registration, Find Engineers → Hire, Messages, Post Project, My Projects, Received/Submitted Quotations (with working Accept/Reject), Active Projects, Payments (with a working "Proceed to Pay"), Invoices, Notifications (real-time, with mark-as-read), and Reviews. There is no mock/demo data left anywhere in the app — a brand-new Firebase project will simply show empty states until real users start posting projects and registering.

## 8. Wiping Test Data (one-time)

If you registered test accounts / posted test projects while building this,
`scripts/wipe-data.js` clears them out so the app can be handed over with a
genuinely empty database:

```bash
# 1. Firebase Console > Project Settings > Service Accounts >
#    Generate new private key. Save the downloaded file as:
#    scripts/serviceAccountKey.json  (already git-ignored)

# 2. Install the one extra dependency (already in package.json):
npm install

# 3. Dry run first — prints document counts, deletes nothing:
npm run wipe-data

# 4. Actually delete:
npm run wipe-data -- --yes

# 5. Optional — also delete the test logins from Firebase Authentication
#    (Firestore user docs alone don't remove the ability to log in):
npm run wipe-data -- --yes --include-auth
```

This uses the Firebase Admin SDK and bypasses `firestore.rules`, so it's
meant to be run once, by hand, from your own machine — never from the
deployed website. It clears `users`, `projects`, `quotations`, `hires`,
`payments`, `conversations` (and their `messages` subcollections),
`reviews`, `notifications`, and `disputes`.

## 9. Next Steps

- Add Cloud Functions (not included) if you want server-side triggers, e.g. auto-creating a `notifications` doc when a quotation is submitted, or integrating a real payment gateway (Razorpay/Stripe) behind the "Proceed to Pay" button (it currently records the payment directly to Firestore, which is fine for a demo but isn't a real money transfer).

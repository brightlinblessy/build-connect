# BuildConnect — Civil Engineer Marketplace

A React + Firebase web app connecting clients with civil engineers, architects,
structural/MEP engineers, and contractors — matching the provided product
mockup: homepage, role-based dashboards (Client / Engineer / Admin), auth,
messaging, quotations, payments, reviews, and admin tools.

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
│   ├── data/                # Mock/demo content + nav configs (matches the mockup)
│   └── pages/
│       ├── auth/            # Login, Register, ForgotPassword
│       ├── client/          # Client dashboard + all sub-pages
│       ├── engineer/        # Engineer dashboard + all sub-pages
│       ├── admin/           # Admin dashboard + all sub-pages
│       └── *.jsx            # Public site: Home, FindEngineers, Projects, Services, Pricing, Blog, About, Contact, HelpCenter, EngineerProfile
├── firestore.rules          # Firestore security rules
├── firestore.indexes.json   # Composite indexes required by the app's queries
├── storage.rules            # Storage security rules
├── firebase.json            # Firebase Hosting/Firestore/Storage config
└── .env.example             # Firebase web config template
```

## 3. Local Setup

```bash
npm install
cp .env.example .env      # then fill in your Firebase values (see Section 4)
npm run dev               # starts Vite dev server at http://localhost:5173
```

Build for production:

```bash
npm run build
npm run preview
```

---

## 4. Firebase Backend Setup (step by step)

### 4.1 Create a Firebase project

1. Go to https://console.firebase.google.com and click **Add project**.
2. Name it (e.g. `build-connect`), disable/enable Google Analytics as you prefer, and create the project.

### 4.2 Register a Web App

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

### 4.3 Enable Authentication providers

Go to **Build → Authentication → Sign-in method** and enable:

- **Email/Password** — required (used by Login/Register pages)
- **Google** — click Enable, set a support email
- **Facebook** — requires a Facebook App ID + App Secret from https://developers.facebook.com; paste them into the Firebase provider settings, and add the OAuth redirect URI Firebase gives you back into your Facebook app settings
- **Phone** — click Enable. For local testing, add test phone numbers under "Phone numbers for testing" so you don't burn real SMS quota
- *(Optional)* **LinkedIn** — Firebase has no built-in LinkedIn provider. To support it, enable a generic **OpenID Connect** provider under "Add new provider," and configure it with your LinkedIn OAuth app's client ID/secret and endpoints.

For phone auth, the app already includes a reCAPTCHA container (`#recaptcha-container`) and helper functions (`initRecaptcha`, `sendOtp`, `confirmOtp`) in `src/firebase/auth.js` — wire these into the phone tab of `Login.jsx` once phone auth is enabled.

### 4.4 Create the Firestore database

1. Go to **Build → Firestore Database → Create database**.
2. Choose **Production mode** (the included `firestore.rules` will secure it) and pick a region close to your users.
3. Firestore is schemaless — collections (`users`, `projects`, `quotations`, `hires`, `payments`, `conversations`, `reviews`, `notifications`, `disputes`) are created automatically the first time the app writes to them. See `src/firebase/firestore.js` for the exact shape of each document.

### 4.5 Enable Storage

1. Go to **Build → Storage → Get started**, and choose the same region as Firestore.
2. This is used for profile photos (`avatars/{userId}/...`) and project/quotation attachments (`projects/{projectId}/...`, `quotations/{quotationId}/...`).

### 4.6 Deploy security rules & indexes

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

### 4.7 Deploy the frontend to Firebase Hosting (optional)

```bash
npm run build
firebase deploy --only hosting
```

---

## 5. Data Model Reference

| Collection      | Key fields                                                                 | Written by |
|------------------|-----------------------------------------------------------------------------|------------|
| `users`          | `name`, `email`, `role`, `twoFactorEnabled`, `createdAt`                    | Register/social login |
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
`architect`, `structuralEngineer`, `mepEngineer`, `contractor`, `admin`. Route
guards (`ProtectedRoute`) use this to send each account to the correct
dashboard (`/client/...`, `/engineer/...`, `/admin/...`).

**Note:** to create your first `admin` account, register normally, then
manually edit that user's `role` field to `admin` in the Firestore console
(there's intentionally no public "sign up as admin" option).

---

## 6. Notes on Images & Placeholder Data

- Avatars use [DiceBear](https://www.dicebear.com/) (license-free, generated from a name seed) — swap `avatarUrl()` in `src/data/mockData.js` for real uploaded photos (via Firebase Storage) once users can upload them.
- Construction/project photography uses royalty-free Unsplash source images as placeholders — replace with your own photography/licensed assets before going to production.
- All names, stats, and sample records in `src/data/mockData.js` are demo content mirroring the layout of the original mockup — replace with live Firestore reads (functions already provided in `src/firebase/firestore.js`) as you wire up each page.

## 7. Next Steps

- Replace mock data usage in dashboard pages with live calls to `src/firebase/firestore.js`.
- Add Cloud Functions (not included) if you want server-side triggers, e.g. auto-creating a `notifications` doc when a quotation is submitted, or integrating a real payment gateway (Razorpay/Stripe) behind the "Proceed to Pay" button.
- Add file upload wiring (Firebase Storage) to the "Choose Files" inputs in Post Project / Submit Quotation forms.

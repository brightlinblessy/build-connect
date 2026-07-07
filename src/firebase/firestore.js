// Firestore data access functions.
// Covers the Core Modules from the mockup: Project Management,
// Quotation System, Messaging System, Payment System, Review & Rating,
// Portfolio Management, Notification System, Dispute Management.
//
// Collections used:
//   users            - all roles (client, civilEngineer, architect,
//                       structuralEngineer, mepEngineer, contractor, admin)
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
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './config'

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

export function updateProjectStatus(projectId, status) {
  return updateDoc(doc(db, 'projects', projectId), { status })
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

export function respondToQuotation(quotationId, status) {
  return updateDoc(doc(db, 'quotations', quotationId), { status })
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

// ---------- Admin ----------

export async function getAllUsers() {
  const snap = await getDocs(collection(db, 'users'))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function getAllProjects() {
  const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'))
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

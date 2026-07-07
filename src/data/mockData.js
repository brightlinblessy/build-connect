// Demo content mirroring the mockup. Swap for live Firestore reads
// (see src/firebase/firestore.js) once your project has real data.

export const userRoles = [
  { id: 'client', label: 'Client', desc: 'Post projects, Hire engineers', color: 'role-client' },
  { id: 'civilEngineer', label: 'Civil Engineer', desc: 'Apply projects, Send quotations', color: 'role-civil' },
  { id: 'architect', label: 'Architect', desc: 'Design 2D, 3D, Interior concepts', color: 'role-architect' },
  { id: 'structuralEngineer', label: 'Structural Engineer', desc: 'Structural drawings, Building analysis', color: 'role-structural' },
  { id: 'mepEngineer', label: 'MEP Engineer', desc: 'Electrical, Plumbing, HVAC planning', color: 'role-mep' },
  { id: 'contractor', label: 'Contractor', desc: 'Construction Execution', color: 'role-contractor' },
  { id: 'admin', label: 'Admin', desc: 'Manage users, Payments, Reports', color: 'role-admin' },
]

export const platformFlow = [
  'Post Project',
  'Receive Quotes',
  'Compare & Hire',
  'Project In Progress',
  'Milestone Payments',
  'Complete & Review',
]

export const heroStats = [
  { label: 'Projects Posted', value: '10K+' },
  { label: 'Registered Engineers', value: '25K+' },
  { label: 'Happy Clients', value: '8K+' },
  { label: 'Success Rate', value: '95%' },
]

export const categories = [
  'Civil Engineer',
  'Architect',
  'Structural Engineer',
  'MEP Engineer',
  'Contractor',
  'Surveyor',
  'Interior Designer',
  'Landscape Designer',
]

export const featuredEngineers = [
  {
    id: 'eng-1',
    name: 'Ar. Rahul Verma',
    title: 'Architect',
    rating: 4.8,
    reviews: 134,
    projects: '50+ Projects',
    rate: '₹1500/hr',
    avatarSeed: 'Rahul-Verma',
  },
  {
    id: 'eng-2',
    name: 'Er. Amit Singh',
    title: 'Civil Engineer',
    rating: 4.9,
    reviews: 98,
    projects: '80+ Projects',
    rate: '₹1200/hr',
    avatarSeed: 'Amit-Singh',
  },
  {
    id: 'eng-3',
    name: 'Er. Neha Sharma',
    title: 'Structural Engineer',
    rating: 4.7,
    reviews: 76,
    projects: '60+ Projects',
    rate: '₹1500/hr',
    avatarSeed: 'Neha-Sharma',
  },
  {
    id: 'eng-4',
    name: 'Er. Imran Khan',
    title: 'MEP Engineer',
    rating: 4.6,
    reviews: 54,
    projects: '40+ Projects',
    rate: '₹1300/hr',
    avatarSeed: 'Imran-Khan',
  },
]

export const latestProjects = [
  { id: 'proj-1', title: 'Residential Building', location: 'New Delhi', budget: '₹2 - 5 Lakhs', image: 'residential' },
  { id: 'proj-2', title: 'Villa Construction', location: 'Mumbai', budget: '₹10 - 20 Lakhs', image: 'villa' },
  { id: 'proj-3', title: 'Commercial Complex', location: 'Bangalore', budget: '₹50 Lakhs+', image: 'commercial' },
  { id: 'proj-4', title: 'School Building', location: 'Pune', budget: '₹20 - 30 Lakhs', image: 'school' },
]

export const clientDashboardStats = [
  { label: 'Total Projects', value: 12, icon: 'FolderKanban', color: 'text-brand-600', bg: 'bg-brand-50' },
  { label: 'Active Projects', value: 5, icon: 'Loader', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'Hired Engineers', value: 8, icon: 'Users', color: 'text-violet-600', bg: 'bg-violet-50' },
  { label: 'Total Spent', value: '₹3,25,000', icon: 'Wallet', color: 'text-amber-600', bg: 'bg-amber-50' },
]

export const projectOverviewData = [
  { name: 'In Progress', value: 5, color: '#2563EB' },
  { name: 'In Review', value: 3, color: '#F59E0B' },
  { name: 'Completed', value: 2, color: '#16A34A' },
  { name: 'Cancelled', value: 2, color: '#EF4444' },
]

export const recentProjects = [
  { id: 'p1', title: 'Residential Building', location: 'New Delhi', status: 'In Progress' },
  { id: 'p2', title: 'Shopping Complex', location: 'Mumbai', status: 'In Progress' },
  { id: 'p3', title: 'Villa Construction', location: 'Goa', status: 'Completed' },
  { id: 'p4', title: 'School Building', location: 'Pune', status: 'Completed' },
]

export const recentQuotations = [
  { id: 'q1', project: 'Residential Building', engineer: 'Er. Amit Singh', amount: '₹2,45,000', status: 'Pending' },
  { id: 'q2', project: 'Shopping Complex', engineer: 'Er. Neha Sharma', amount: '₹9,50,000', status: 'Pending' },
  { id: 'q3', project: 'Villa Construction', engineer: 'Er. Imran Khan', amount: '₹12,00,000', status: 'Accepted' },
]

export const paymentOverview = {
  total: '₹3,25,000',
  period: 'This Month',
  points: [
    { date: '1 May', amount: 40000 },
    { date: '8 May', amount: 65000 },
    { date: '15 May', amount: 50000 },
    { date: '22 May', amount: 90000 },
    { date: '30 May', amount: 80000 },
  ],
}

export const adminOverviewStats = [
  { label: 'User Registrations', value: '25,430', change: '+12%' },
  { label: 'Projects', value: '5,620', change: '+18%' },
  { label: 'Revenue', value: '₹45,80,000', change: '+23%' },
  { label: 'Engineers', value: '12,840', change: '+15%' },
]

export const chatMessages = [
  { id: 'm1', from: 'client', text: 'Hello, I have a project for residential building.', time: '10:30 AM' },
  { id: 'm2', from: 'engineer', text: 'Hello John, Sure! Please share the details.', time: '10:31 AM' },
  { id: 'm3', from: 'client', text: "I've uploaded drawings and project details.", time: '10:32 AM' },
  { id: 'm4', from: 'engineer', text: 'Thanks! I will review and send you the quotation.', time: '10:33 AM' },
]

export const notifications = [
  { id: 'n1', text: 'New quotation received for Residential Building', time: '10 mins ago', type: 'quotation' },
  { id: 'n2', text: 'Er. Neha Sharma applied for your project', time: '30 mins ago', type: 'application' },
  { id: 'n3', text: 'Payment of ₹50,000 received from Er. Amit Singh', time: '1 hour ago', type: 'payment' },
  { id: 'n4', text: 'Your project Villa Construction is in review', time: '2 hours ago', type: 'status' },
]

// Deterministic, license-free placeholder avatars (DiceBear). Swap
// `avatarUrl(seed)` calls for real uploaded photos (Firebase Storage)
// once available.
export function avatarUrl(seed) {
  return `https://api.dicebear.com/8.x/avataaars/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9`
}

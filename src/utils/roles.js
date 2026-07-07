// Central place for role definitions and role -> route mapping.
// The platform recognizes three top-level access groups:
//   1. client   – posts projects, hires professionals
//   2. engineer – covers 5 specialties (civilEngineer, architect,
//                 structuralEngineer, mepEngineer, contractor), all of
//                 which share the same "/engineer" dashboard shell.
//   3. admin    – manages the whole platform

export const ENGINEER_ROLES = [
  { id: 'civilEngineer', label: 'Civil Engineer' },
  { id: 'architect', label: 'Architect' },
  { id: 'structuralEngineer', label: 'Structural Engineer' },
  { id: 'mepEngineer', label: 'MEP Engineer' },
  { id: 'contractor', label: 'Contractor' },
]

export const ENGINEER_ROLE_IDS = ENGINEER_ROLES.map((r) => r.id)

export const ACCOUNT_TYPES = [
  { id: 'client', label: 'Client', description: 'Post projects & hire professionals' },
  { id: 'engineer', label: 'Engineer', description: 'Bid on projects & manage work' },
  { id: 'admin', label: 'Admin', description: 'Manage the platform' },
]

export function isEngineerRole(role) {
  return ENGINEER_ROLE_IDS.includes(role)
}

export function accountTypeForRole(role) {
  if (role === 'client') return 'client'
  if (role === 'admin') return 'admin'
  if (isEngineerRole(role)) return 'engineer'
  return null
}

export function engineerLabel(role) {
  return ENGINEER_ROLES.find((r) => r.id === role)?.label || 'Engineer'
}

// Returns the base dashboard path for a given Firestore user role.
export function dashboardPathForRole(role) {
  const type = accountTypeForRole(role)
  if (type === 'client') return '/client/dashboard'
  if (type === 'admin') return '/admin/dashboard'
  if (type === 'engineer') return '/engineer/dashboard'
  return '/login'
}

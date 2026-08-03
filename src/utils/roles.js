// Central place for role definitions and role -> route mapping.
// The platform recognizes two top-level access groups:
//   1. client   – posts projects, hires professionals
//   2. engineer – covers 5 specialties (civilEngineer, architect,
//                 structuralEngineer, mepEngineer, contractor), all of
//                 which share the same "/engineer" dashboard shell.

export const ROLE_CONFIGS = {
  client: {
    label: 'Client',
    desc: 'Post projects, Hire engineers',
    colorClass: 'text-blue-600 bg-blue-50 border-blue-200',
    badgeClass: 'text-blue-600 bg-blue-50/70 border border-blue-200',
    sidebarClass: 'text-blue-300 bg-blue-900/30 border border-blue-800/30',
    hex: '#2563EB',
    iconName: 'User',
  },
  civilEngineer: {
    label: 'Civil Engineer',
    desc: 'Apply projects, Send quotations',
    colorClass: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    badgeClass: 'text-emerald-600 bg-emerald-50/70 border border-emerald-200',
    sidebarClass: 'text-emerald-300 bg-emerald-900/30 border border-emerald-800/30',
    hex: '#16A34A',
    iconName: 'HardHat',
  },
  architect: {
    label: 'Architect',
    desc: 'Design 2D, 3D, Interior concepts',
    colorClass: 'text-violet-600 bg-violet-50 border-violet-200',
    badgeClass: 'text-violet-600 bg-violet-50/70 border border-violet-200',
    sidebarClass: 'text-violet-300 bg-violet-900/30 border border-violet-800/30',
    hex: '#7C3AED',
    iconName: 'Palette',
  },
  structuralEngineer: {
    label: 'Structural Engineer',
    desc: 'Structural drawings, Building analysis',
    colorClass: 'text-pink-600 bg-pink-50 border-pink-200',
    badgeClass: 'text-pink-600 bg-pink-50/70 border border-pink-200',
    sidebarClass: 'text-pink-300 bg-pink-900/30 border border-pink-800/30',
    hex: '#EC4899',
    iconName: 'Layers',
  },
  mepEngineer: {
    label: 'MEP Engineer',
    desc: 'Electrical, Plumbing, HVAC planning',
    colorClass: 'text-teal-600 bg-teal-50 border-teal-200',
    badgeClass: 'text-teal-600 bg-teal-50/70 border border-teal-200',
    sidebarClass: 'text-teal-300 bg-teal-900/30 border border-teal-800/30',
    hex: '#0D9488',
    iconName: 'Zap',
  },
  contractor: {
    label: 'Contractor',
    desc: 'Construction Execution',
    colorClass: 'text-orange-600 bg-orange-50 border-orange-200',
    badgeClass: 'text-orange-600 bg-orange-50/70 border border-orange-200',
    sidebarClass: 'text-orange-300 bg-orange-900/30 border border-orange-800/30',
    hex: '#F97316',
    iconName: 'Wrench',
  },
}

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
]

export function isEngineerRole(role) {
  return ENGINEER_ROLE_IDS.includes(role)
}

export function accountTypeForRole(role) {
  if (role === 'client') return 'client'
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
  if (type === 'engineer') return '/engineer/dashboard'
  return '/login'
}

import {
  LayoutDashboard,
  FolderKanban,
  PlusCircle,
  FileText,
  Users,
  CreditCard,
  Receipt,
  MessageSquare,
  Bell,
  Star,
  User,
  Settings,
  Briefcase,
  ShieldCheck,
  AlertTriangle,
  BarChart3,
} from 'lucide-react'

export const clientNavItems = [
  { label: 'Dashboard', to: '/client/dashboard', icon: LayoutDashboard, end: true },
  { label: 'My Projects', to: '/client/projects', icon: FolderKanban },
  { label: 'Post New Project', to: '/client/post-project', icon: PlusCircle },
  { label: 'Received Quotation', to: '/client/quotations', icon: FileText, badge: 5 },
  { label: 'Hired Engineers', to: '/client/hired-engineers', icon: Users },
  { label: 'Payments', to: '/client/payments', icon: CreditCard },
  { label: 'Invoices', to: '/client/invoices', icon: Receipt },
  { label: 'Messages', to: '/client/messages', icon: MessageSquare },
  { label: 'Notifications', to: '/client/notifications', icon: Bell, badge: 5 },
  { label: 'Reviews', to: '/client/reviews', icon: Star },
  { label: 'Profile', to: '/client/profile', icon: User },
  { label: 'Settings', to: '/client/settings', icon: Settings },
]

export const engineerNavItems = [
  { label: 'Dashboard', to: '/engineer/dashboard', icon: LayoutDashboard, end: true },
  { label: 'Available Projects', to: '/engineer/projects', icon: FolderKanban },
  { label: 'My Quotations', to: '/engineer/quotations', icon: FileText },
  { label: 'Active Projects', to: '/engineer/active-projects', icon: Briefcase },
  { label: 'Payments', to: '/engineer/payments', icon: CreditCard },
  { label: 'Messages', to: '/engineer/messages', icon: MessageSquare },
  { label: 'Notifications', to: '/engineer/notifications', icon: Bell, badge: 2 },
  { label: 'Reviews', to: '/engineer/reviews', icon: Star },
  { label: 'Portfolio', to: '/engineer/profile', icon: User },
  { label: 'Settings', to: '/engineer/settings', icon: Settings },
]

export const adminNavItems = [
  { label: 'Overview', to: '/admin/dashboard', icon: LayoutDashboard, end: true },
  { label: 'Users', to: '/admin/users', icon: Users },
  { label: 'Projects', to: '/admin/projects', icon: FolderKanban },
  { label: 'Payments & Revenue', to: '/admin/payments', icon: CreditCard },
  { label: 'Reports & Analytics', to: '/admin/reports', icon: BarChart3 },
  { label: 'Reviews', to: '/admin/reviews', icon: Star },
  { label: 'Disputes', to: '/admin/disputes', icon: AlertTriangle },
  { label: 'Verification', to: '/admin/verification', icon: ShieldCheck },
  { label: 'Settings', to: '/admin/settings', icon: Settings },
]

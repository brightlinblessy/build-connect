import { Routes, Route } from 'react-router-dom'

// Auth pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import CivilEngineerRegister from './pages/auth/CivilEngineerRegister'
import ForgotPassword from './pages/auth/ForgotPassword'

// Gates + layout
import RootGate from './components/common/RootGate'
import GuestRoute from './components/common/GuestRoute'
import DashboardLayout from './components/layout/DashboardLayout'
import ProtectedRoute from './components/common/ProtectedRoute'
import { clientNavItems, engineerNavItems } from './data/navConfig'

// Client dashboard pages
import ClientDashboard from './pages/client/ClientDashboard'
import ClientProjects from './pages/client/Projects'
import PostProject from './pages/client/PostProject'
import EditProject from './pages/client/EditProject'
import ClientQuotations from './pages/client/Quotations'
import FindEngineers from './pages/client/FindEngineers'
import EngineerPublicProfile from './pages/client/EngineerPublicProfile'
import HiredEngineers from './pages/client/HiredEngineers'
import ClientPayments from './pages/client/Payments'
import Invoices from './pages/client/Invoices'
import ClientMessages from './pages/client/Messages'
import ClientNotifications from './pages/client/Notifications'
import ClientReviews from './pages/client/Reviews'
import ClientProfile from './pages/client/Profile'
import ClientSettings from './pages/client/Settings'

// Engineer dashboard pages
import EngineerDashboard from './pages/engineer/EngineerDashboard'
import AvailableProjects from './pages/engineer/AvailableProjects'
import SubmitQuotation from './pages/engineer/SubmitQuotation'
import ActiveProjects from './pages/engineer/ActiveProjects'
import EngineerPayments from './pages/engineer/EngineerPayments'
import EngineerProfileEditor from './pages/engineer/EngineerProfileEditor'


export default function App() {
  return (
    <Routes>
      {/* First page: pure auth gate. Logged out -> /login. Logged in -> role dashboard. */}
      <Route path="/" element={<RootGate />} />

      {/* Auth (guest-only: logged in users are redirected to their dashboard) */}
      <Route
        path="/login"
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />
      <Route
        path="/register"
        element={
          <GuestRoute>
            <Register />
          </GuestRoute>
        }
      />
      <Route
        path="/register/civil-engineer"
        element={
          <GuestRoute>
            <CivilEngineerRegister />
          </GuestRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <GuestRoute>
            <ForgotPassword />
          </GuestRoute>
        }
      />

      {/* Client dashboard */}
      <Route
        path="/client"
        element={
          <ProtectedRoute allowedRoles={['client']}>
            <DashboardLayout navItems={clientNavItems} title="Client" />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<ClientDashboard />} />
        <Route path="projects" element={<ClientProjects />} />
        <Route path="projects/:id/edit" element={<EditProject />} />
        <Route path="post-project" element={<PostProject />} />
        <Route path="quotations" element={<ClientQuotations />} />
        <Route path="engineers" element={<FindEngineers />} />
        <Route path="engineers/:id" element={<EngineerPublicProfile />} />
        <Route path="hired-engineers" element={<HiredEngineers />} />
        <Route path="payments" element={<ClientPayments />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="messages" element={<ClientMessages />} />
        <Route path="notifications" element={<ClientNotifications />} />
        <Route path="reviews" element={<ClientReviews />} />
        <Route path="profile" element={<ClientProfile />} />
        <Route path="settings" element={<ClientSettings />} />
      </Route>

      {/* Engineer dashboard (civilEngineer, architect, structuralEngineer, mepEngineer, contractor) */}
      <Route
        path="/engineer"
        element={
          <ProtectedRoute allowedRoles={['civilEngineer', 'architect', 'structuralEngineer', 'mepEngineer', 'contractor']}>
            <DashboardLayout navItems={engineerNavItems} title="Engineer" />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<EngineerDashboard />} />
        <Route path="projects" element={<AvailableProjects />} />
        <Route path="quotations" element={<SubmitQuotation />} />
        <Route path="active-projects" element={<ActiveProjects />} />
        <Route path="payments" element={<EngineerPayments />} />
        <Route path="messages" element={<ClientMessages />} />
        <Route path="notifications" element={<ClientNotifications />} />
        <Route path="reviews" element={<ClientReviews />} />
        <Route path="profile" element={<EngineerProfileEditor />} />
        <Route path="settings" element={<ClientSettings />} />
      </Route>

      {/* Fallback: send anything unknown through the root gate */}
      <Route path="*" element={<RootGate />} />
    </Routes>
  )
}

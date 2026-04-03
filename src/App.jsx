import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useSelector } from 'react-redux';

// Layout & infra
import { ProtectedRoute, PortalLayout } from './components/layout';
import { FullPageLoader, ToastListener } from './components/feedback';
import { ROLE_THEME } from './config/portalConfig';

// Public pages
import Login          from './pages/public/Login';
import Register       from './pages/public/Register';
import ForgotPassword from './pages/public/ForgotPassword';
import ResetPassword  from './pages/public/ResetPassword';

// Instructor portal
import Dashboard   from './pages/instructor/Dashboard';
import ProfilePage from './pages/instructor/ProfilePage';

// Studio portal
import StudioDashboard    from './pages/studio/StudioDashboard';
import StudioProfile      from './pages/studio/StudioProfile';
import SearchInstructors  from './pages/studio/SearchInstructors';

// Common pages (same UI for instructor + studio, role-aware)
import Messages     from './pages/common/Messages';
import Subscription from './pages/common/Subscription';
import Payments     from './pages/common/Payments';

// Admin portal
import AdminDashboard from './pages/admin/AdminDashboard';

// Smart root redirect: sends each role to their home
function RoleRedirect() {
  const { token, user } = useSelector((s) => s.auth);
  if (!token) return <Navigate to="/login" replace />;
  if (!user)  return null; // wait for getMe
  return <Navigate to={ROLE_THEME[user.role]?.defaultPath || '/login'} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors
        toastOptions={{ duration: 3000, style: { fontFamily: 'DM Sans, sans-serif' } }} />
      <FullPageLoader />
      <ToastListener />

      <Routes>
        {/* ── Public ─────────────────────────────────────────── */}
        <Route path="/login"          element={<Login />} />
        <Route path="/register"       element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password"  element={<ResetPassword />} />

        {/* ── Instructor portal ──────────────────────────────── */}
        <Route path="/portal" element={
          <ProtectedRoute allowedRoles={['instructor']}>
            <PortalLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"    element={<Dashboard />} />
          <Route path="profile"      element={<ProfilePage />} />
          <Route path="messages"     element={<Messages />} />
          <Route path="subscription" element={<Subscription />} />
          <Route path="payments"     element={<Payments />} />
        </Route>

        {/* ── Studio portal ──────────────────────────────────── */}
        <Route path="/studio" element={
          <ProtectedRoute allowedRoles={['studio']}>
            <PortalLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"    element={<StudioDashboard />} />
          <Route path="profile"      element={<StudioProfile />} />
          <Route path="search"       element={<SearchInstructors />} />
          <Route path="messages"     element={<Messages />} />
          <Route path="subscription" element={<Subscription />} />
          <Route path="payments"     element={<Payments />} />
        </Route>

        {/* ── Admin portal ───────────────────────────────────── */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <PortalLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
        </Route>

        {/* ── Root / catch-all ───────────────────────────────── */}
        <Route path="/"  element={<RoleRedirect />} />
        <Route path="*"  element={<RoleRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}

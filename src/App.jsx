import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useSelector } from 'react-redux';

// Shared / infra
import ProtectedRoute from './components/ProtectedRoute';
import PortalLayout   from './components/PortalLayout';
import FullPageLoader from './components/FullPageLoader';
import ToastListener  from './components/ToastListener';
import { ROLE_THEME } from './config/portalConfig';

// Public pages
import Login          from './pages/Login';
import Register       from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword  from './pages/ResetPassword';

// Instructor portal
import Dashboard   from './pages/Dashboard';
import ProfilePage from './pages/ProfilePage';
import Messages    from './pages/Messages';
import Subscription from './pages/Subscription';
import Payments    from './pages/Payments';

// Studio portal
import StudioDashboard    from './pages/studio/StudioDashboard';
import StudioProfile      from './pages/studio/StudioProfile';
import SearchInstructors  from './pages/studio/SearchInstructors';
import StudioMessages     from './pages/studio/StudioMessages';
import StudioSubscription from './pages/studio/StudioSubscription';
import StudioPayments     from './pages/studio/StudioPayments';

// Admin portal (placeholders — swap real pages when built)
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
          <Route path="messages"     element={<StudioMessages />} />
          <Route path="subscription" element={<StudioSubscription />} />
          <Route path="payments"     element={<StudioPayments />} />
        </Route>

        {/* ── Admin portal ───────────────────────────────────── */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <PortalLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          {/* Add more admin routes here as you build them */}
        </Route>

        {/* ── Root / catch-all ───────────────────────────────── */}
        <Route path="/"  element={<RoleRedirect />} />
        <Route path="*"  element={<RoleRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}
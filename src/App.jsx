import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useSelector } from 'react-redux';

import { ProtectedRoute, PortalLayout } from './components/layout';
import { FullPageLoader, ToastListener } from './components/feedback';
import { ROLE_THEME } from './config/portalConfig';

// Public
import Login          from './pages/public/Login';
import Register       from './pages/public/Register';
import ForgotPassword from './pages/public/ForgotPassword';
import ResetPassword  from './pages/public/ResetPassword';

// Instructor portal
import Dashboard      from './pages/instructor/Dashboard';
import ProfilePage    from './pages/instructor/ProfilePage';
import FindWork       from './pages/instructor/FindWork';

// Common (shared between portals)
import Messages       from './pages/common/Messages';
import Subscription   from './pages/common/Subscription';
import Payments       from './pages/common/Payments';
import Grow           from './pages/common/Grow';

// Studio portal
import StudioDashboard   from './pages/studio/StudioDashboard';
import StudioProfile     from './pages/studio/StudioProfile';
import SearchInstructors from './pages/studio/SearchInstructors';
import Favourites        from './pages/studio/Favourites';
import JobListings       from './pages/studio/JobListings';

// Admin portal
import AdminDashboard from './pages/admin/AdminDashboard';

function RoleRedirect() {
  const { token, user } = useSelector((s) => s.auth);
  if (!token) return <Navigate to="/login" replace />;
  if (!user)  return null;
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
        <Route path="/login"            element={<Login />} />
        <Route path="/register"         element={<Register />} />
        <Route path="/forgot-password"  element={<ForgotPassword />} />
        <Route path="/reset-password"   element={<ResetPassword />} />

        {/* ── Instructor portal ──────────────────────────────── */}
        <Route path="/portal" element={
          <ProtectedRoute allowedRoles={['instructor']}>
            <PortalLayout />
          </ProtectedRoute>
        }>
          <Route index             element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"  element={<Dashboard />} />
          <Route path="profile"    element={<ProfilePage />} />
          <Route path="find-work"  element={<FindWork />} />
          <Route path="grow"       element={<Grow />} />
          <Route path="messages"   element={<Messages />} />
          <Route path="subscription" element={<Subscription />} />
          <Route path="payments"   element={<Payments />} />
        </Route>

        {/* ── Studio portal ──────────────────────────────────── */}
        <Route path="/studio" element={
          <ProtectedRoute allowedRoles={['studio']}>
            <PortalLayout />
          </ProtectedRoute>
        }>
          <Route index              element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"   element={<StudioDashboard />} />
          <Route path="profile"     element={<StudioProfile />} />
          <Route path="search"      element={<SearchInstructors />} />
          <Route path="favourites"  element={<Favourites />} />
          <Route path="jobs"        element={<JobListings />} />
          <Route path="grow"        element={<Grow />} />
          <Route path="messages"    element={<Messages />} />
          <Route path="subscription" element={<Subscription />} />
          <Route path="payments"    element={<Payments />} />
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

        {/* ── Catch-all ──────────────────────────────────────── */}
        <Route path="/"  element={<RoleRedirect />} />
        <Route path="*"  element={<RoleRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}
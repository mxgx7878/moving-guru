import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useSelector, useDispatch } from 'react-redux';

import { ProtectedRoute, PortalLayout } from './components/layout';
import { FullPageLoader, ToastListener } from './components/feedback';
import { ROLE_THEME } from './config/portalConfig';
import { STATUS } from './constants/apiConstants';
import { getMe } from './store/actions/authAction';

// Public
import Login          from './pages/public/Login';
import Register       from './pages/public/Register';
import ForgotPassword from './pages/public/ForgotPassword';
import ResetPassword  from './pages/public/ResetPassword';

// Instructor portal
import Dashboard      from './pages/instructor/Dashboard';
import ProfilePage    from './pages/instructor/ProfilePage';
import FindWork       from './pages/instructor/FindWork';
import SavedJobs      from './pages/instructor/SavedJobs';

// Common (shared between portals)
import Messages       from './pages/common/Messages';
import Subscription   from './pages/common/Subscription';
import Payments       from './pages/common/Payments';
import Grow           from './pages/common/Grow';
import GrowPostForm   from './pages/common/GrowPostForm';

// Studio portal
import StudioDashboard   from './pages/studio/StudioDashboard';
import StudioProfile     from './pages/studio/StudioProfile';
import SearchInstructors from './pages/studio/SearchInstructors';
import Favourites        from './pages/studio/Favourites';
import JobListings       from './pages/studio/JobListings';

// Admin portal
import AdminDashboard     from './pages/admin/AdminDashboard';
import AdminGrowPosts     from './pages/admin/AdminGrowPosts';
import AdminUsers         from './pages/admin/AdminUsers';
import AdminPosts         from './pages/admin/AdminPosts';
import AdminJobs          from './pages/admin/AdminJobs';
import AdminSubscriptions from './pages/admin/AdminSubscriptions';
import AdminSettings      from './pages/admin/AdminSettings';
import InstructorDetail   from './pages/studio/InstructorDetail';
import StudioDetail       from './pages/public/StudioDetail';
import MyApplications from './pages/instructor/Myapplications';

function RoleRedirect() {
  const dispatch = useDispatch();
  const { token, user, status } = useSelector((s) => s.auth);

  // If a token exists (possibly stale from a different app) but no user has
  // been loaded yet, validate it once. If the token is invalid the slice
  // will clear it and this component re-renders into the login redirect.
  useEffect(() => {
    if (token && !user && status === STATUS.IDLE) {
      dispatch(getMe());
    }
  }, [token, user, status, dispatch]);

  if (!token) return <Navigate to="/login" replace />;

  if (!user) {
    // Still validating → show a loader instead of a blank white screen.
    if (status === STATUS.IDLE || status === STATUS.LOADING) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#FDFCF8]">
          <div className="w-8 h-8 border-2 border-[#CE4F56]/30 border-t-[#CE4F56] rounded-full animate-spin" />
        </div>
      );
    }
    // Validation finished without a user (failed or empty response) — token
    // is unusable. Force a fresh login.
    return <Navigate to="/login" replace />;
  }

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
          <Route path="saved-jobs" element={<SavedJobs />} />
          <Route path="applications" element={<MyApplications />} />
          <Route path="grow"            element={<Grow />} />
          <Route path="grow/new"        element={<GrowPostForm />} />
          <Route path="grow/edit/:id"   element={<GrowPostForm />} />
          <Route path="studios/:id" element={<StudioDetail />} />
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
          <Route path="instructors/:id" element={<InstructorDetail />} />
          <Route path="studios/:id"     element={<StudioDetail />} />
          <Route path="grow"            element={<Grow />} />
          <Route path="grow/new"        element={<GrowPostForm />} />
          <Route path="grow/edit/:id"   element={<GrowPostForm />} />
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
          <Route path="dashboard"       element={<AdminDashboard />} />
          <Route path="users"           element={<AdminUsers />} />
          <Route path="jobs"            element={<AdminJobs />} />
          <Route path="posts"           element={<AdminPosts />} />
          <Route path="grow"            element={<AdminGrowPosts />} />
          <Route path="grow/edit/:id"   element={<GrowPostForm />} />
          <Route path="subscriptions"   element={<AdminSubscriptions />} />
          <Route path="settings"        element={<AdminSettings />} />
        </Route>

        {/* ── Catch-all ──────────────────────────────────────── */}
        <Route path="/"  element={<RoleRedirect />} />
        <Route path="*"  element={<RoleRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}
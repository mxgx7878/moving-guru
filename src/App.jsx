import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useSelector, useDispatch } from 'react-redux';

import { ProtectedRoute, PortalLayout, RequireApproved } from './components/layout';
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
// StudioDetail lives in `pages/public/` because the view itself is
// read-only and has no role-specific affordances — it's the same card
// surface whether a signed-in instructor, a studio, or a logged-out
// visitor looks at it. The route is mounted in BOTH the public tree
// (as a shareable deep link) and the protected trees (so the sidebar
// navigation stays in context). Move it if/when these views diverge.
import StudioDetail       from './pages/public/StudioDetail';
import MyApplications from './pages/instructor/MyApplications';
import Announcements from './pages/common/Announcements';
import NotFound from './pages/common/NotFound';

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

          {/* Always accessible — needed to reach approval */}
          <Route path="dashboard"   element={<Dashboard />} />
          <Route path="profile"     element={<ProfilePage />} />
          <Route path="subscription" element={<Subscription />} />
          <Route path="payments"    element={<Payments />} />

          {/* Gated — require approval */}
          <Route path="find-work"    element={<RequireApproved><FindWork /></RequireApproved>} />
          <Route path="saved-jobs"   element={<RequireApproved><SavedJobs /></RequireApproved>} />
          <Route path="applications" element={<RequireApproved><MyApplications /></RequireApproved>} />
          <Route path="grow"         element={<RequireApproved><Grow /></RequireApproved>} />
          <Route path="grow/new"     element={<RequireApproved><GrowPostForm /></RequireApproved>} />
          <Route path="grow/edit/:id" element={<RequireApproved><GrowPostForm /></RequireApproved>} />
          <Route path="studios/:id"  element={<RequireApproved><StudioDetail /></RequireApproved>} />
          <Route path="messages"     element={<RequireApproved><Messages /></RequireApproved>} />
          <Route path="announcements" element={<Announcements />} />
        </Route>

        {/* ── Studio portal ──────────────────────────────────── */}
        <Route path="/studio" element={
          <ProtectedRoute allowedRoles={['studio']}>
            <PortalLayout />
          </ProtectedRoute>
        }>
          <Route index               element={<Navigate to="dashboard" replace />} />

          {/* Always accessible */}
          <Route path="dashboard"    element={<StudioDashboard />} />
          <Route path="profile"      element={<StudioProfile />} />
          <Route path="subscription" element={<Subscription />} />
          <Route path="payments"     element={<Payments />} />

          {/* Gated */}
          <Route path="search"        element={<RequireApproved><SearchInstructors /></RequireApproved>} />
          <Route path="favourites"    element={<RequireApproved><Favourites /></RequireApproved>} />
          <Route path="jobs"          element={<RequireApproved><JobListings /></RequireApproved>} />
          <Route path="instructors/:id" element={<RequireApproved><InstructorDetail /></RequireApproved>} />
          <Route path="studios/:id"   element={<RequireApproved><StudioDetail /></RequireApproved>} />
          <Route path="grow"          element={<RequireApproved><Grow /></RequireApproved>} />
          <Route path="grow/new"      element={<RequireApproved><GrowPostForm /></RequireApproved>} />
          <Route path="grow/edit/:id" element={<RequireApproved><GrowPostForm /></RequireApproved>} />
          <Route path="messages"      element={<RequireApproved><Messages /></RequireApproved>} />
          <Route path="announcements" element={<Announcements />} />
        </Route>

        {/* Admin portal — unchanged, admins bypass all gating */}

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
          <Route path="announcements"  element={<AdminPosts />} />
          <Route path="posts"           element={<AdminPosts />} />
          <Route path="grow"            element={<AdminGrowPosts />} />
          <Route path="grow/edit/:id"   element={<GrowPostForm />} />
          <Route path="subscriptions"   element={<AdminSubscriptions />} />
          <Route path="settings"        element={<AdminSettings />} />
        </Route>

        {/* ── Root → role home ──────────────────────────────── */}
        <Route path="/"  element={<RoleRedirect />} />

        {/* ── 404 ────────────────────────────────────────────── */}
        <Route path="*"  element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

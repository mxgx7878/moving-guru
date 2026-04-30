import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useSelector, useDispatch } from 'react-redux';

import { ProtectedRoute, PortalLayout, RequireApproved } from './components/layout';
import RequireFeature from './components/gates/RequireFeature';
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
import MyApplications from './pages/instructor/MyApplications';

// Common (shared between portals)
import Messages       from './pages/common/Messages';
import Subscription   from './pages/common/Subscription';
import Payments       from './pages/common/Payments';
import Grow           from './pages/common/Grow';
import GrowPostForm   from './pages/common/GrowPostForm';
import Announcements  from './pages/common/Announcements';
import NotFound       from './pages/common/NotFound';

// Studio portal
import StudioDashboard   from './pages/studio/StudioDashboard';
import StudioProfile     from './pages/studio/StudioProfile';
import SearchInstructors from './pages/studio/SearchInstructors';
import Favourites        from './pages/studio/Favourites';
import JobListings       from './pages/studio/JobListings';
import InstructorDetail  from './pages/studio/InstructorDetail';

// Admin portal
import AdminDashboard      from './pages/admin/AdminDashboard';
import AdminGrowPosts      from './pages/admin/AdminGrowPosts';
import AdminUsers          from './pages/admin/AdminUsers';
import AdminPosts          from './pages/admin/AdminPosts';
import AdminJobs           from './pages/admin/AdminJobs';
import AdminSubscriptions  from './pages/admin/AdminSubscriptions';
import AdminSettings       from './pages/admin/AdminSettings';
import AdminReviews        from './pages/admin/AdminReviews';
import AdminCommunications from './pages/admin/AdminCommunications';

// StudioDetail lives in `pages/public/` because the view itself is
// read-only and has no role-specific affordances.
import StudioDetail from './pages/public/StudioDetail';

// ─── Feature key constants ────────────────────────────────────────
// Must match the `key` column in the `features` DB table.
// Kept here (not imported from a separate file) because they're route-level
// only — admin matrix loads the same list from /api/admin/features.
const FK = {
  MESSAGING:          'messaging',
  JOB_APPLICATIONS:   'job_applications',
  POST_JOBS:          'post_jobs',
  GROW_POSTS:         'grow_posts',
  PROFILE_VISIBILITY: 'profile_visibility',
  SAVE_JOBS:          'save_jobs',
  SEARCH_INSTRUCTORS: 'search_instructors',
  FAVOURITES:         'favourites',
  REVIEWS:            'reviews',
};

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
    if (status === STATUS.IDLE || status === STATUS.LOADING) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#FDFCF8]">
          <div className="w-8 h-8 border-2 border-[#CE4F56]/30 border-t-[#CE4F56] rounded-full animate-spin" />
        </div>
      );
    }
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={ROLE_THEME[user.role]?.defaultPath || '/login'} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        richColors
        toastOptions={{ duration: 3000, style: { fontFamily: 'DM Sans, sans-serif' } }}
      />
      <FullPageLoader />
      <ToastListener />

      <Routes>
        {/* ── Public ─────────────────────────────────────────── */}
        <Route path="/login"           element={<Login />} />
        <Route path="/register"        element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password"  element={<ResetPassword />} />

        {/* ═══════════════════════════════════════════════════════════
            Instructor portal
            Gates:
              RequireApproved  → admin must approve the user first
              RequireFeature   → user's plan must include the feature
            Always-accessible (NEVER feature-gated): dashboard, profile,
            subscription, payments — users need these to upgrade.
        ═══════════════════════════════════════════════════════════ */}
        <Route path="/portal" element={
          <ProtectedRoute allowedRoles={['instructor']}>
            <PortalLayout />
          </ProtectedRoute>
        }>
          <Route index             element={<Navigate to="dashboard" replace />} />

          {/* Always accessible */}
          <Route path="dashboard"       element={<Dashboard />} />
          <Route path="profile"         element={<ProfilePage />} />
          <Route path="subscription"    element={<Subscription />} />
          <Route path="payments"        element={<Payments />} />
          <Route path="instructors/:id" element={<InstructorDetail />} />

          {/* Approval-gated + feature-gated */}
          <Route path="find-work" element={
            <RequireApproved>
              <RequireFeature feature={FK.JOB_APPLICATIONS}><FindWork /></RequireFeature>
            </RequireApproved>
          } />
          <Route path="saved-jobs" element={
            <RequireApproved>
              <RequireFeature feature={FK.SAVE_JOBS}><SavedJobs /></RequireFeature>
            </RequireApproved>
          } />
          <Route path="applications" element={
            <RequireApproved>
              <RequireFeature feature={FK.JOB_APPLICATIONS}><MyApplications /></RequireFeature>
            </RequireApproved>
          } />
          <Route path="grow" element={
            <RequireApproved>
              <RequireFeature feature={FK.GROW_POSTS}><Grow /></RequireFeature>
            </RequireApproved>
          } />
          <Route path="grow/new" element={
            <RequireApproved>
              <RequireFeature feature={FK.GROW_POSTS}><GrowPostForm /></RequireFeature>
            </RequireApproved>
          } />
          <Route path="grow/edit/:id" element={
            <RequireApproved>
              <RequireFeature feature={FK.GROW_POSTS}><GrowPostForm /></RequireFeature>
            </RequireApproved>
          } />
          <Route path="studios/:id" element={
            <RequireApproved><StudioDetail /></RequireApproved>
          } />
          <Route path="messages" element={
            <RequireApproved>
              <RequireFeature feature={FK.MESSAGING}><Messages /></RequireFeature>
            </RequireApproved>
          } />

          {/* No subscription gate — announcements are platform-wide */}
          <Route path="announcements" element={<Announcements />} />
        </Route>

        {/* ═══════════════════════════════════════════════════════════
            Studio portal
        ═══════════════════════════════════════════════════════════ */}
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

          {/* Approval-gated + feature-gated */}
          <Route path="search" element={
            <RequireApproved>
              <RequireFeature feature={FK.SEARCH_INSTRUCTORS}><SearchInstructors /></RequireFeature>
            </RequireApproved>
          } />
          <Route path="favourites" element={
            <RequireApproved>
              <RequireFeature feature={FK.FAVOURITES}><Favourites /></RequireFeature>
            </RequireApproved>
          } />
          <Route path="jobs" element={
            <RequireApproved>
              <RequireFeature feature={FK.POST_JOBS}><JobListings /></RequireFeature>
            </RequireApproved>
          } />
          <Route path="instructors/:id" element={
            <RequireApproved>
              <RequireFeature feature={FK.SEARCH_INSTRUCTORS}><InstructorDetail /></RequireFeature>
            </RequireApproved>
          } />
          <Route path="studios/:id" element={
            <RequireApproved><StudioDetail /></RequireApproved>
          } />
          <Route path="grow" element={
            <RequireApproved>
              <RequireFeature feature={FK.GROW_POSTS}><Grow /></RequireFeature>
            </RequireApproved>
          } />
          <Route path="grow/new" element={
            <RequireApproved>
              <RequireFeature feature={FK.GROW_POSTS}><GrowPostForm /></RequireFeature>
            </RequireApproved>
          } />
          <Route path="grow/edit/:id" element={
            <RequireApproved>
              <RequireFeature feature={FK.GROW_POSTS}><GrowPostForm /></RequireFeature>
            </RequireApproved>
          } />
          <Route path="messages" element={
            <RequireApproved>
              <RequireFeature feature={FK.MESSAGING}><Messages /></RequireFeature>
            </RequireApproved>
          } />
          <Route path="announcements" element={<Announcements />} />
        </Route>

        {/* ═══════════════════════════════════════════════════════════
            Admin portal — admins bypass ALL gating (approval + feature)
        ═══════════════════════════════════════════════════════════ */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <PortalLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"      element={<AdminDashboard />} />
          <Route path="users"          element={<AdminUsers />} />
          <Route path="jobs"           element={<AdminJobs />} />
          <Route path="announcements"  element={<AdminPosts />} />
          <Route path="posts"          element={<AdminPosts />} />
          <Route path="grow"           element={<AdminGrowPosts />} />
          <Route path="grow/edit/:id"  element={<GrowPostForm />} />
          <Route path="reviews"        element={<AdminReviews />} />
          <Route path="subscriptions"  element={<AdminSubscriptions />} />
          <Route path="settings"       element={<AdminSettings />} />
          <Route path="communications" element={<AdminCommunications />} />
        </Route>

        {/* ── Root → role home ──────────────────────────────── */}
        <Route path="/" element={<RoleRedirect />} />

        {/* ── 404 ────────────────────────────────────────────── */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
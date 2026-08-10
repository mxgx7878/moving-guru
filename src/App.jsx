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

import Login          from './pages/public/Login';
import Register       from './pages/public/Register';
import ForgotPassword from './pages/public/ForgotPassword';
import ResetPassword  from './pages/public/ResetPassword';

import Dashboard      from './pages/instructor/Dashboard';
import ProfilePage    from './pages/instructor/ProfilePage';
import FindWork       from './pages/instructor/FindWork';
import SavedJobs      from './pages/instructor/SavedJobs';
import MyApplications from './pages/instructor/MyApplications';

import Messages       from './pages/common/Messages';
import Subscription   from './pages/common/Subscription';
import Payments       from './pages/common/Payments';
import Grow           from './pages/common/Grow';
import GrowPostForm   from './pages/common/GrowPostForm';
import Announcements  from './pages/common/Announcements';
import NotFound       from './pages/common/NotFound';

import StudioDashboard   from './pages/studio/StudioDashboard';
import StudioProfile     from './pages/studio/StudioProfile';
import SearchInstructors from './pages/studio/SearchInstructors';
import Favourites        from './pages/studio/Favourites';
import JobListings       from './pages/studio/JobListings';
import InstructorDetail  from './pages/studio/InstructorDetail';

import AdminDashboard      from './pages/admin/AdminDashboard';
import AdminGrowPosts      from './pages/admin/AdminGrowPosts';
import AdminUsers          from './pages/admin/AdminUsers';
import AdminPosts          from './pages/admin/AdminPosts';
import AdminJobs           from './pages/admin/AdminJobs';
import AdminSubscriptions  from './pages/admin/AdminSubscriptions';
import AdminSettings       from './pages/admin/AdminSettings';
import AdminReviews        from './pages/admin/AdminReviews';
import AdminCommunications from './pages/admin/AdminCommunications';
import AdminGrowPromoCodes from './pages/admin/AdminGrowPromoCodes'
import AdminReports         from './pages/admin/AdminReports';
import './styles/dashboard-bg.css';

import StudioDetail from './pages/public/StudioDetail';
import AdminPromoCodes from './pages/admin/AdminPromoCodes';
import SubscriptionCheckout from './pages/common/SubscriptionCheckout';

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

  useEffect(() => {
    if (token && !user && status === STATUS.IDLE) {
      dispatch(getMe());
    }
  }, [token, user, status, dispatch]);

  if (!token) return <Navigate to="/login" replace />;

  if (!user) {
    if (status === STATUS.IDLE || status === STATUS.LOADING) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#FFFFFF]">
          <div className="w-8 h-8 border-2 border-coral/30 border-t-coral rounded-full animate-spin" />
        </div>
      );
    }
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin' && user.status === 'pending_payment') {
    return <Navigate to="/checkout" replace />;
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
        <Route path="/login"           element={<Login />} />
        <Route path="/register"        element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password"  element={<ResetPassword />} />
        <Route
  path="/checkout"
  element={
    <ProtectedRoute
      allowedRoles={['instructor', 'studio']}
    >
      <SubscriptionCheckout />
    </ProtectedRoute>
  }
/>

        <Route path="/portal" element={
          <ProtectedRoute allowedRoles={['instructor']}>
            <PortalLayout />
          </ProtectedRoute>
        }>
          <Route index             element={<Navigate to="dashboard" replace />} />

          <Route path="dashboard"       element={<Dashboard />} />
          <Route path="profile"         element={<ProfilePage />} />
          <Route path="subscription"    element={<Subscription />} />
          <Route path="payments"        element={<Payments />} />
          <Route path="instructors/:id" element={<InstructorDetail />} />

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

          <Route path="announcements" element={<Announcements />} />
        </Route>

        <Route path="/studio" element={
          <ProtectedRoute allowedRoles={['studio']}>
            <PortalLayout />
          </ProtectedRoute>
        }>
          <Route index               element={<Navigate to="dashboard" replace />} />

          <Route path="dashboard"    element={<StudioDashboard />} />
          <Route path="profile"      element={<StudioProfile />} />
          <Route path="subscription" element={<Subscription />} />
          <Route path="payments"     element={<Payments />} />

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
          <Route path="reports"        element={<AdminReports />} />
          <Route path="promo-codes" element={<AdminPromoCodes />} />
          <Route path="grow-promo-codes" element={<AdminGrowPromoCodes />} />
        </Route>

        <Route path="/" element={<RoleRedirect />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

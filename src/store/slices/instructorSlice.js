import { createSlice } from '@reduxjs/toolkit';
import { STATUS } from '../../constants/apiConstants';
import { DUMMY_INSTRUCTORS } from '../../data/dummyData';
import { DUMMY_ADMIN_USERS } from '../../data/adminData';
import {
  fetchInstructors,
  fetchInstructorDetail,
  saveInstructor,
  unsaveInstructor,
  fetchSavedInstructors,
  fetchAdminUsers,
  fetchAdminUserDetail,
  updateAdminUser,
  suspendAdminUser,
  activateAdminUser,
  verifyAdminUser,
  deleteAdminUser,
} from '../actions/instructorAction';

const initialState = {
  // Studio "Find Instructors" search
  instructors: DUMMY_INSTRUCTORS,
  savedIds: ['inst_001', 'inst_004'],
  selectedInstructor: null,
  pagination: null,
  status: STATUS.IDLE,
  error: null,

  // Admin user management (instructors + studios in one list)
  users: DUMMY_ADMIN_USERS,
  userDetail: null,
  usersPagination: null,
  usersStatus: STATUS.IDLE,
  userMutating: STATUS.IDLE,
  message: null,
};

// Replace a user wherever it appears in state
const replaceUser = (state, updated) => {
  if (!updated) return;
  const idx = state.users.findIndex((u) => u.id === updated.id);
  if (idx !== -1) state.users[idx] = updated;
  if (state.userDetail?.id === updated.id) state.userDetail = updated;
};

const instructorSlice = createSlice({
  name: 'instructor',
  initialState,
  reducers: {
    clearInstructorError(state) {
      state.error = null;
    },
    clearSelectedInstructor(state) {
      state.selectedInstructor = null;
    },
    clearUserDetail(state) {
      state.userDetail = null;
    },
    clearInstructorMessage(state) {
      state.message = null;
    },
    // Local-only mutations on dummy data (used while admin APIs are not ready)
    locallyMutateUser(state, { payload }) {
      replaceUser(state, payload);
    },
    locallyDeleteUser(state, { payload: id }) {
      state.users = state.users.filter((u) => u.id !== id);
      if (state.userDetail?.id === id) state.userDetail = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Fetch instructors (studio search) ───────────────────
      .addCase(fetchInstructors.pending, (state) => {
        state.status = STATUS.LOADING;
        state.error = null;
      })
      .addCase(fetchInstructors.fulfilled, (state, { payload }) => {
        state.status = STATUS.SUCCEEDED;
        const apiData = payload.data?.instructors || payload.data;
        if (apiData && Array.isArray(apiData) && apiData.length > 0) {
          state.instructors = apiData;
        }
        state.pagination = payload.data?.pagination || null;
      })
      .addCase(fetchInstructors.rejected, (state) => {
        state.status = STATUS.SUCCEEDED;
        // Keep dummy data on error — silent
      })

      .addCase(fetchInstructorDetail.pending, (state) => {
        state.status = STATUS.LOADING;
      })
      .addCase(fetchInstructorDetail.fulfilled, (state, { payload }) => {
        state.status = STATUS.SUCCEEDED;
        state.selectedInstructor = payload.data?.instructor || payload.data || null;
      })
      .addCase(fetchInstructorDetail.rejected, (state, { payload }) => {
        state.status = STATUS.FAILED;
        state.error = payload;
      })

      .addCase(saveInstructor.fulfilled, (state, { meta }) => {
        const id = meta.arg;
        if (!state.savedIds.includes(id)) state.savedIds.push(id);
      })
      .addCase(unsaveInstructor.fulfilled, (state, { meta }) => {
        state.savedIds = state.savedIds.filter((id) => id !== meta.arg);
      })
      .addCase(fetchSavedInstructors.fulfilled, (state, { payload }) => {
        state.savedIds = (payload.data || []).map((i) => i.id);
      })

      // ═══════════════════════════════════════════════════════
      //  Admin user management (instructors + studios)
      // ═══════════════════════════════════════════════════════
      .addCase(fetchAdminUsers.pending, (state) => {
        state.usersStatus = STATUS.LOADING;
      })
      .addCase(fetchAdminUsers.fulfilled, (state, { payload }) => {
        state.usersStatus = STATUS.SUCCEEDED;
        const apiData = payload.data;
        if (Array.isArray(apiData) && apiData.length > 0) {
          state.users = apiData;
          state.usersPagination = payload.meta || null;
        }
        // else: keep dummy fallback already in state
      })
      .addCase(fetchAdminUsers.rejected, (state) => {
        // Silent: keep dummy data, don't surface error to user
        state.usersStatus = STATUS.SUCCEEDED;
      })

      .addCase(fetchAdminUserDetail.fulfilled, (state, { payload }) => {
        if (payload?.data) state.userDetail = payload.data;
      })
      .addCase(fetchAdminUserDetail.rejected, (state, { meta }) => {
        // Silent: fall back to the user already in the list
        const id = meta.arg;
        const found = state.users.find((u) => u.id === id);
        if (found) state.userDetail = found;
      })

      .addCase(updateAdminUser.pending, (state) => { state.userMutating = STATUS.LOADING; })
      .addCase(updateAdminUser.fulfilled, (state, { payload }) => {
        state.userMutating = STATUS.SUCCEEDED;
        replaceUser(state, payload?.data);
        state.message = payload?.message || 'User updated.';
      })
      .addCase(updateAdminUser.rejected, (state, { payload }) => {
        state.userMutating = STATUS.FAILED;
        state.error = payload;
      })

      .addCase(suspendAdminUser.fulfilled, (state, { payload }) => {
        replaceUser(state, payload?.data);
        state.message = payload?.message || 'User suspended.';
      })
      .addCase(suspendAdminUser.rejected, (state, { payload }) => { state.error = payload; })

      .addCase(activateAdminUser.fulfilled, (state, { payload }) => {
        replaceUser(state, payload?.data);
        state.message = payload?.message || 'User activated.';
      })
      .addCase(activateAdminUser.rejected, (state, { payload }) => { state.error = payload; })

      .addCase(verifyAdminUser.fulfilled, (state, { payload }) => {
        replaceUser(state, payload?.data);
        state.message = payload?.message || 'Verification updated.';
      })
      .addCase(verifyAdminUser.rejected, (state, { payload }) => { state.error = payload; })

      .addCase(deleteAdminUser.fulfilled, (state, { payload: id }) => {
        state.users = state.users.filter((u) => u.id !== id);
        if (state.userDetail?.id === id) state.userDetail = null;
        state.message = 'User deleted.';
      })
      .addCase(deleteAdminUser.rejected, (state, { payload }) => { state.error = payload; });
  },
});

export const {
  clearInstructorError,
  clearSelectedInstructor,
  clearUserDetail,
  clearInstructorMessage,
  locallyMutateUser,
  locallyDeleteUser,
} = instructorSlice.actions;

export default instructorSlice.reducer;

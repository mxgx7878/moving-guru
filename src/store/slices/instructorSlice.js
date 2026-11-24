import { createSlice } from "@reduxjs/toolkit";
import { STATUS } from "../../constants/apiConstants";
import {
  fetchInstructors,
  fetchInstructorDetail,
  saveInstructor,
  unsaveInstructor,
  fetchSavedInstructors,
  fetchAdminUsers,
  fetchAdminUserDetail,
  updateAdminUser,
  createAdminUser,
  approveAdminUser,
  rejectAdminUser,
  suspendAdminUser,
  activateAdminUser,
  verifyAdminUser,
  deleteAdminUser,
  updateAdminUserPlan,
} from "../actions/instructorAction";

const initialState = {
  instructors: [],
  savedInstructors: [],
  savedStatus: STATUS.IDLE,
  savedIds: [],
  selectedInstructor: null,
  detailStatus: STATUS.IDLE,
  pagination: null,
  status: STATUS.IDLE,
  listRequestId: null,
  error: null,

  users: [],
  userDetail: null,
  userDetailStatus: STATUS.IDLE,
  usersPagination: null,
  usersStatus: STATUS.IDLE,
  userMutating: STATUS.IDLE,
  message: null,
};

const replaceUser = (state, updated) => {
  if (!updated) return;
  const idx = state.users.findIndex((u) => u.id === updated.id);
  if (idx !== -1) state.users[idx] = updated;
  if (state.userDetail?.id === updated.id) state.userDetail = updated;
};

const unwrapInstructors = (payload) => {
  const d = payload?.data;
  if (Array.isArray(d?.instructors)) return d.instructors;
  if (Array.isArray(d)) return d;
  return [];
};

const instructorSlice = createSlice({
  name: "instructor",
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInstructors.pending, (state, { meta }) => {
        state.requestIds ??= {};
        state.requestIds.fetchInstructors = meta.requestId;
        state.status = STATUS.LOADING;
        state.listRequestId = meta.requestId;
        state.error = null;
      })
      .addCase(fetchInstructors.fulfilled, (state, { payload, meta }) => {
        if (state.requestIds?.fetchInstructors !== meta.requestId) return;
        if (meta.requestId !== state.listRequestId) return;
        state.status = STATUS.SUCCEEDED;
        const list = unwrapInstructors(payload);

        if (payload?.append) {
          const seen = new Set(state.instructors.map((i) => i.id));
          state.instructors = [
            ...state.instructors,
            ...list.filter((i) => !seen.has(i.id)),
          ];
        } else {
          state.instructors = list;
        }

        const savedFromList = list.filter((i) => i.is_saved).map((i) => i.id);
        if (savedFromList.length) {
          state.savedIds = Array.from(
            new Set([...state.savedIds, ...savedFromList]),
          );
        }

        state.pagination =
          payload?.data?.meta || payload?.data?.pagination || null;
      })
      .addCase(fetchInstructors.rejected, (state, { payload, meta }) => {
        if (state.requestIds?.fetchInstructors !== meta.requestId) return;
        if (meta.requestId !== state.listRequestId) return;
        state.status = STATUS.FAILED;
        state.error = payload;
      })

      .addCase(fetchInstructorDetail.pending, (state, { meta }) => {
        state.requestIds ??= {};
        state.requestIds.fetchInstructorDetail = meta.requestId;
        state.detailStatus = STATUS.LOADING;
        state.selectedInstructor = null;
      })
      .addCase(fetchInstructorDetail.fulfilled, (state, { meta, payload }) => {
        if (state.requestIds?.fetchInstructorDetail !== meta.requestId) return;
        state.detailStatus = STATUS.SUCCEEDED;
        console.log(payload, "payload in slice");
        const inst = payload?.data?.user || payload?.data || null;
        state.selectedInstructor = inst;
        if (inst) {
          const saved = state.savedInstructors.findIndex((i) => i.id === inst.id);
          if (saved !== -1) state.savedInstructors[saved] = inst;
        }
      })
      .addCase(fetchInstructorDetail.rejected, (state, { meta, payload }) => {
        if (state.requestIds?.fetchInstructorDetail !== meta.requestId) return;
        state.detailStatus = STATUS.FAILED;
        state.error = payload;
      })

      .addCase(saveInstructor.fulfilled, (state, { meta }) => {
        const id = meta.arg;
        if (!state.savedIds.includes(id)) state.savedIds.push(id);
      })
      .addCase(unsaveInstructor.fulfilled, (state, { meta }) => {
        state.savedIds = state.savedIds.filter((id) => id !== meta.arg);
        state.savedInstructors = state.savedInstructors.filter((i) => i.id !== meta.arg);
      })

      .addCase(fetchSavedInstructors.pending, (state, { meta }) => {
        state.requestIds ??= {};
        state.requestIds.fetchSavedInstructors = meta.requestId;
        state.savedStatus = STATUS.LOADING;
      })
      .addCase(fetchSavedInstructors.fulfilled, (state, { meta, payload }) => {
        if (state.requestIds?.fetchSavedInstructors !== meta.requestId) return;
        state.savedStatus = STATUS.SUCCEEDED;
        const list = unwrapInstructors(payload);
        state.savedIds = list.map((i) => i.id);
        state.savedInstructors = list;
      })
      .addCase(fetchSavedInstructors.rejected, (state, { meta, payload }) => {
        if (state.requestIds?.fetchSavedInstructors !== meta.requestId) return;
        state.savedStatus = STATUS.FAILED;
        state.error = payload;
      })

      .addCase(fetchAdminUsers.pending, (state, { meta }) => {
        state.requestIds ??= {};
        state.requestIds.fetchAdminUsers = meta.requestId;
        state.usersStatus = STATUS.LOADING;
      })
      .addCase(fetchAdminUsers.fulfilled, (state, { meta, payload }) => {
        if (state.requestIds?.fetchAdminUsers !== meta.requestId) return;
        state.usersStatus = STATUS.SUCCEEDED;
        state.users = Array.isArray(payload?.data) ? payload.data : [];
        state.usersPagination = payload?.meta || null;
      })
      .addCase(fetchAdminUsers.rejected, (state, { meta, payload }) => {
        if (state.requestIds?.fetchAdminUsers !== meta.requestId) return;
        state.usersStatus = STATUS.FAILED;
        state.error = payload;
      })

      .addCase(fetchAdminUserDetail.pending, (state, { meta }) => {
        state.requestIds ??= {};
        state.requestIds.fetchAdminUserDetail = meta.requestId;
        state.userDetailStatus = STATUS.LOADING;
        state.userDetail = null;
      })
      .addCase(fetchAdminUserDetail.fulfilled, (state, { meta, payload }) => {
        if (state.requestIds?.fetchAdminUserDetail !== meta.requestId) return;
        state.userDetailStatus = STATUS.SUCCEEDED;
        console.log(payload, "payload in user detail slice");
        if (payload?.data) state.userDetail = payload.data.user;
      })
      .addCase(fetchAdminUserDetail.rejected, (state, { meta, payload }) => {
        if (state.requestIds?.fetchAdminUserDetail !== meta.requestId) return;
        state.userDetailStatus = STATUS.FAILED;
        const id = meta.arg;
        const found = state.users.find((u) => u.id === id);
        if (found) state.userDetail = found;
        state.error = payload;
      })

      .addCase(createAdminUser.pending, (state) => {
        state.userMutating = STATUS.LOADING;
      })
      .addCase(createAdminUser.fulfilled, (state, { payload }) => {
        state.userMutating = STATUS.SUCCEEDED;
        const created = payload?.data?.user;
        if (created?.id) state.users.unshift(created);
        state.message = payload?.message || "User created.";
      })
      .addCase(createAdminUser.rejected, (state, { payload }) => {
        state.userMutating = STATUS.FAILED;
        state.error = payload;
      })

      .addCase(updateAdminUser.pending, (state) => {
        state.userMutating = STATUS.LOADING;
      })
      .addCase(updateAdminUser.fulfilled, (state, { payload }) => {
        state.userMutating = STATUS.SUCCEEDED;
        replaceUser(state, payload?.data?.user);
        state.message = payload?.message || "User updated.";
      })
      .addCase(updateAdminUser.rejected, (state, { payload }) => {
        state.userMutating = STATUS.FAILED;
        state.error = payload;
      })

      .addCase(approveAdminUser.fulfilled, (state, { payload }) => {
        replaceUser(state, payload?.data);
        state.message = payload?.message || "User approved.";
      })
      .addCase(approveAdminUser.rejected, (state, { payload }) => {
        state.error = payload;
      })

      .addCase(rejectAdminUser.fulfilled, (state, { payload }) => {
        replaceUser(state, payload?.data);
        state.message = payload?.message || "User rejected.";
      })
      .addCase(rejectAdminUser.rejected, (state, { payload }) => {
        state.error = payload;
      })

      .addCase(suspendAdminUser.fulfilled, (state, { payload }) => {
        replaceUser(state, payload?.data);
        state.message = payload?.message || "User suspended.";
      })
      .addCase(suspendAdminUser.rejected, (state, { payload }) => {
        state.error = payload;
      })

      .addCase(activateAdminUser.fulfilled, (state, { payload }) => {
        replaceUser(state, payload?.data);
        state.message = payload?.message || "User activated.";
      })
      .addCase(activateAdminUser.rejected, (state, { payload }) => {
        state.error = payload;
      })

      .addCase(verifyAdminUser.fulfilled, (state, { payload }) => {
        replaceUser(state, payload?.data);
        state.message = payload?.message || "Verification updated.";
      })
      .addCase(verifyAdminUser.rejected, (state, { payload }) => {
        state.error = payload;
      })

      .addCase(deleteAdminUser.fulfilled, (state, { payload: id }) => {
        state.users = state.users.filter((u) => u.id !== id);
        if (state.userDetail?.id === id) state.userDetail = null;
        state.message = "User deleted.";
      })
      .addCase(deleteAdminUser.rejected, (state, { payload }) => {
        state.error = payload;
      })
      .addCase(updateAdminUserPlan.pending, (state) => {
        state.userMutating = STATUS.LOADING;
      })
      .addCase(updateAdminUserPlan.fulfilled, (state, { payload }) => {
        state.userMutating = STATUS.SUCCEEDED;
        const updated = payload?.data?.user;
        if (updated) {
          state.users = state.users.map((u) =>
            u.id === updated.id ? { ...u, ...updated } : u,
          );
          if (state.userDetail?.id === updated.id) {
            state.userDetail = { ...state.userDetail, ...updated };
          }
          state.message = payload?.message || "Plan updated";
        }
      })
      .addCase(updateAdminUserPlan.rejected, (state, { payload }) => {
        state.userMutating = STATUS.FAILED;
        state.error = payload;
      });
  },
});

export const {
  clearInstructorError,
  clearSelectedInstructor,
  clearUserDetail,
  clearInstructorMessage,
} = instructorSlice.actions;

export default instructorSlice.reducer;

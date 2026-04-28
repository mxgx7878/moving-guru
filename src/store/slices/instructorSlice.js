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
  savedIds: [],
  selectedInstructor: null,
  pagination: null,
  status: STATUS.IDLE,
  error: null,

  users: [],
  userDetail: null,
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

const upsertInstructor = (state, inst) => {
  if (!inst || !inst.id) return;
  const idx = state.instructors.findIndex((i) => i.id === inst.id);
  if (idx === -1) state.instructors.push(inst);
  else state.instructors[idx] = { ...state.instructors[idx], ...inst };
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
      .addCase(fetchInstructors.pending, (state) => {
        state.status = STATUS.LOADING;
        state.error = null;
      })
      .addCase(fetchInstructors.fulfilled, (state, { payload }) => {
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
      .addCase(fetchInstructors.rejected, (state, { payload }) => {
        state.status = STATUS.FAILED;
        state.error = payload;
      })

      .addCase(fetchInstructorDetail.pending, (state) => {
        state.status = STATUS.LOADING;
      })
      .addCase(fetchInstructorDetail.fulfilled, (state, { payload }) => {
        state.status = STATUS.SUCCEEDED;
        console.log(payload, "payload in slice");
        const inst = payload?.data?.instructor || payload?.data || null;
        state.selectedInstructor = inst;
        if (inst) upsertInstructor(state, inst);
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
        const list = unwrapInstructors(payload);
        state.savedIds = list.map((i) => i.id);
        list.forEach((inst) => upsertInstructor(state, inst));
      })

      // ═══ Admin user management ═════════════════════════════
      .addCase(fetchAdminUsers.pending, (state) => {
        state.usersStatus = STATUS.LOADING;
      })
      .addCase(fetchAdminUsers.fulfilled, (state, { payload }) => {
        state.usersStatus = STATUS.SUCCEEDED;
        state.users = Array.isArray(payload?.data) ? payload.data : [];
        state.usersPagination = payload?.meta || null;
      })
      .addCase(fetchAdminUsers.rejected, (state, { payload }) => {
        state.usersStatus = STATUS.FAILED;
        state.error = payload;
      })

      .addCase(fetchAdminUserDetail.pending, (state) => {
        state.userMutating = STATUS.LOADING;
      })
      .addCase(fetchAdminUserDetail.fulfilled, (state, { payload }) => {
        state.userMutating = STATUS.SUCCEEDED;
        console.log(payload, "payload in user detail slice");
        if (payload?.data) state.userDetail = payload.data.user;
      })
      .addCase(fetchAdminUserDetail.rejected, (state, { meta, payload }) => {
        state.userMutating = STATUS.FAILED;
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
        const created = payload?.data;
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
        replaceUser(state, payload?.data);
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

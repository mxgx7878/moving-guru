import { createSlice } from '@reduxjs/toolkit';
import { STATUS } from '../../constants/apiConstants';
import { DUMMY_INSTRUCTORS } from '../../data/dummyData';
import {
  fetchInstructors,
  fetchInstructorDetail,
  saveInstructor,
  unsaveInstructor,
  fetchSavedInstructors,
} from '../actions/instructorAction';

const initialState = {
  instructors: DUMMY_INSTRUCTORS,
  savedIds: ['inst_001', 'inst_004'],
  selectedInstructor: null,
  pagination: null,
  status: STATUS.IDLE,
  error: null,
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
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
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
        // Keep dummy data on error
      })

      // Fetch detail
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

      // Save instructor
      .addCase(saveInstructor.fulfilled, (state, { meta }) => {
        const id = meta.arg;
        if (!state.savedIds.includes(id)) {
          state.savedIds.push(id);
        }
      })

      // Unsave instructor
      .addCase(unsaveInstructor.fulfilled, (state, { meta }) => {
        state.savedIds = state.savedIds.filter(id => id !== meta.arg);
      })

      // Fetch saved
      .addCase(fetchSavedInstructors.fulfilled, (state, { payload }) => {
        state.savedIds = (payload.data || []).map(i => i.id);
      });
  },
});

export const { clearInstructorError, clearSelectedInstructor } = instructorSlice.actions;
export default instructorSlice.reducer;

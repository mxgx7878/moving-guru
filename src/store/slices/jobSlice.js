import { createSlice } from '@reduxjs/toolkit';
import { STATUS } from '../../constants/apiConstants';
import { DUMMY_JOBS } from '../../data/dummyData';
import { fetchJobs, createJob, updateJob, deleteJob } from '../actions/jobAction';

const initialState = {
  jobs: DUMMY_JOBS,
  status: STATUS.IDLE,
  error: null,
  message: null,
};

const jobSlice = createSlice({
  name: 'job',
  initialState,
  reducers: {
    clearJobError(state) {
      state.error = null;
    },
    clearJobMessage(state) {
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchJobs.pending, (state) => {
        state.status = STATUS.LOADING;
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, { payload }) => {
        state.status = STATUS.SUCCEEDED;
        const apiJobs = payload.data?.jobs || payload.data;
        if (apiJobs && Array.isArray(apiJobs) && apiJobs.length > 0) {
          state.jobs = apiJobs;
        }
      })
      .addCase(fetchJobs.rejected, (state) => {
        state.status = STATUS.SUCCEEDED;
        // Keep dummy jobs
      })

      // Create
      .addCase(createJob.pending, (state) => {
        state.status = STATUS.LOADING;
      })
      .addCase(createJob.fulfilled, (state, { payload }) => {
        state.status = STATUS.SUCCEEDED;
        const newJob = payload.data?.job || payload.data;
        if (newJob) {
          state.jobs.unshift(newJob);
        }
        state.message = payload.message || 'Listing created successfully';
      })
      .addCase(createJob.rejected, (state, { payload }) => {
        state.status = STATUS.FAILED;
        state.error = payload;
      })

      // Update
      .addCase(updateJob.fulfilled, (state, { payload }) => {
        const updated = payload.data?.job || payload.data;
        if (updated) {
          const idx = state.jobs.findIndex(j => j.id === updated.id);
          if (idx !== -1) state.jobs[idx] = updated;
        }
        state.message = payload.message || 'Listing updated';
      })
      .addCase(updateJob.rejected, (state, { payload }) => {
        state.error = payload;
      })

      // Delete
      .addCase(deleteJob.fulfilled, (state, { payload }) => {
        state.jobs = state.jobs.filter(j => j.id !== payload);
        state.message = 'Listing deleted';
      })
      .addCase(deleteJob.rejected, (state, { payload }) => {
        state.error = payload;
      });
  },
});

export const { clearJobError, clearJobMessage } = jobSlice.actions;
export default jobSlice.reducer;

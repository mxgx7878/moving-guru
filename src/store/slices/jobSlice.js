import { createSlice } from '@reduxjs/toolkit';
import { STATUS } from '../../constants/apiConstants';
import { DUMMY_JOBS } from '../../data/dummyData';
import {
  fetchJobs,
  fetchMyJobs,
  createJob,
  updateJob,
  deleteJob,
  fetchJobApplicants,
  updateApplicationStatus,
  applyToJob,
  withdrawApplication,
  fetchMyApplications,
} from '../actions/jobAction';

const initialState = {
  // Public / instructor browse — only ever active listings
  jobs: [],
  status: STATUS.IDLE,

  // Studio's own listings (active + inactive)
  myJobs: [],
  myJobsStatus: STATUS.IDLE,

  // Applicants by jobId: { [jobId]: { job, applicants, status } }
  applicantsByJobId: {},

  // Instructor's own applications
  myApplications: [],
  myApplicationsStatus: STATUS.IDLE,

  // Per-action mutation state for apply button etc.
  applyingJobId: null,
  mutatingApplicationId: null,

  error: null,
  message: null,
};

// Helpers — unwrap backend envelope { status, data: { jobs } } or legacy
const unwrapJobs = (payload) =>
  payload?.data?.jobs || payload?.data || [];

const unwrapJob = (payload) =>
  payload?.data?.job || payload?.data || null;

const unwrapApplicants = (payload) =>
  payload?.data?.applicants || payload?.applicants || [];

const unwrapApplication = (payload) =>
  payload?.data?.application || payload?.application || null;

// Replace a job in an array (in-place), or return unchanged
const replaceInArr = (arr, updated) => {
  if (!updated) return;
  const idx = arr.findIndex((j) => j.id === updated.id);
  if (idx !== -1) arr[idx] = { ...arr[idx], ...updated };
};

const jobSlice = createSlice({
  name: 'job',
  initialState,
  reducers: {
    clearJobError(state)   { state.error = null; },
    clearJobMessage(state) { state.message = null; },
    // Optimistic toggle for the instructor's Apply button — the thunk
    // will reconcile against the server response afterwards.
    locallyMarkApplied(state, { payload: jobId }) {
      const apply = (arr) => replaceInArr(arr, { id: jobId, has_applied: true });
      apply(state.jobs);
      apply(state.myJobs);
    },
  },
  extraReducers: (builder) => {
    builder
      // ═══ Browse (public / instructor) ═══════════════════════
      .addCase(fetchJobs.pending, (state) => {
        state.status = STATUS.LOADING;
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, { payload }) => {
        state.status = STATUS.SUCCEEDED;
        const list = unwrapJobs(payload);
        if (Array.isArray(list) && list.length > 0) {
          state.jobs = list;
        } else if (Array.isArray(list)) {
          // Empty array from API is a legitimate "no listings yet"
          state.jobs = [];
        }
      })
      .addCase(fetchJobs.rejected, (state) => {
        // Silent: keep whatever was already in state (dummy or stale)
        state.status = STATUS.FAILED;
      })

      // ═══ Studio: my listings ═══════════════════════════════
      .addCase(fetchMyJobs.pending, (state) => {
        state.myJobsStatus = STATUS.LOADING;
        state.error = null;
      })
      .addCase(fetchMyJobs.fulfilled, (state, { payload }) => {
        state.myJobsStatus = STATUS.SUCCEEDED;
        const list = unwrapJobs(payload);
        state.myJobs = Array.isArray(list) ? list : [];
      })
      .addCase(fetchMyJobs.rejected, (state, { payload }) => {
        state.myJobsStatus = STATUS.FAILED;
        state.error = payload;
      })

      // ═══ Studio: create ════════════════════════════════════
      .addCase(createJob.pending, (state) => {
        state.myJobsStatus = STATUS.LOADING;
      })
      .addCase(createJob.fulfilled, (state, { payload }) => {
        state.myJobsStatus = STATUS.SUCCEEDED;
        const newJob = unwrapJob(payload);
        if (newJob) {
          state.myJobs.unshift(newJob);
          // If the new listing is active, mirror into public list
          if (newJob.is_active !== false) state.jobs.unshift(newJob);
        }
        state.message = payload?.message || 'Listing created successfully';
      })
      .addCase(createJob.rejected, (state, { payload }) => {
        state.myJobsStatus = STATUS.FAILED;
        state.error = payload;
      })

      // ═══ Studio: update ════════════════════════════════════
      .addCase(updateJob.fulfilled, (state, { payload }) => {
        const updated = unwrapJob(payload);
        if (updated) {
          replaceInArr(state.myJobs, updated);
          replaceInArr(state.jobs, updated);
          // If toggled inactive, drop it from the public list
          if (updated.is_active === false) {
            state.jobs = state.jobs.filter((j) => j.id !== updated.id);
          }
        }
        state.message = payload?.message || 'Listing updated';
      })
      .addCase(updateJob.rejected, (state, { payload }) => {
        state.error = payload;
      })

      // ═══ Studio: delete ════════════════════════════════════
      .addCase(deleteJob.fulfilled, (state, { payload: id }) => {
        state.myJobs = state.myJobs.filter((j) => j.id !== id);
        state.jobs   = state.jobs.filter((j)   => j.id !== id);
        delete state.applicantsByJobId[id];
        state.message = 'Listing deleted';
      })
      .addCase(deleteJob.rejected, (state, { payload }) => {
        state.error = payload;
      })

      // ═══ Studio: applicants ════════════════════════════════
      .addCase(fetchJobApplicants.pending, (state, { meta }) => {
        const jobId = meta.arg;
        state.applicantsByJobId[jobId] = {
          ...(state.applicantsByJobId[jobId] || {}),
          status: STATUS.LOADING,
        };
      })
      .addCase(fetchJobApplicants.fulfilled, (state, { payload }) => {
        const { jobId, payload: resp } = payload;
        const applicants = unwrapApplicants(resp);
        state.applicantsByJobId[jobId] = {
          applicants,
          job: resp?.data?.job || null,
          status: STATUS.SUCCEEDED,
        };
        // Keep the studio's job card count in sync — any pending applicants
        // got auto-marked "viewed" on the backend, but the overall count
        // shouldn't change. Just align applicants_count to the real list.
        replaceInArr(state.myJobs, { id: jobId, applicants_count: applicants.length });
      })
      .addCase(fetchJobApplicants.rejected, (state, { meta, payload }) => {
        const jobId = meta.arg;
        state.applicantsByJobId[jobId] = {
          ...(state.applicantsByJobId[jobId] || {}),
          status: STATUS.FAILED,
        };
        state.error = payload;
      })

      // ═══ Studio: accept / reject an applicant ══════════════
      .addCase(updateApplicationStatus.pending, (state, { meta }) => {
        state.mutatingApplicationId = meta.arg.applicationId;
      })
      .addCase(updateApplicationStatus.fulfilled, (state, { payload }) => {
        state.mutatingApplicationId = null;
        const { jobId, payload: resp } = payload;
        const app = unwrapApplication(resp);
        if (app && state.applicantsByJobId[jobId]) {
          const bucket = state.applicantsByJobId[jobId];
          const idx = bucket.applicants.findIndex((a) => a.id === app.id);
          if (idx !== -1) bucket.applicants[idx] = app;
        }
        state.message = resp?.message || 'Application updated';
      })
      .addCase(updateApplicationStatus.rejected, (state, { payload }) => {
        state.mutatingApplicationId = null;
        state.error = payload;
      })

      // ═══ Instructor: apply ═════════════════════════════════
      .addCase(applyToJob.pending, (state, { meta }) => {
        state.applyingJobId = meta.arg.jobId;
      })
      .addCase(applyToJob.fulfilled, (state, { payload }) => {
        state.applyingJobId = null;
        const { jobId, payload: resp } = payload;
        const app = unwrapApplication(resp);
        if (app) {
          // Deduplicate — if instructor re-applied after withdrawing,
          // replace the old entry instead of adding a duplicate.
          const existing = state.myApplications.findIndex(
            (a) => a.job_listing_id === app.job_listing_id,
          );
          if (existing !== -1) state.myApplications[existing] = app;
          else state.myApplications.unshift(app);
        }
        // Mark job as applied so the Apply button flips state
        replaceInArr(state.jobs, { id: jobId, has_applied: true });
        state.message = resp?.message || 'Application submitted';
      })
      .addCase(applyToJob.rejected, (state, { payload }) => {
        state.applyingJobId = null;
        state.error = payload;
      })

      // ═══ Instructor: withdraw ══════════════════════════════
      .addCase(withdrawApplication.pending, (state, { meta }) => {
        state.mutatingApplicationId = meta.arg;
      })
      .addCase(withdrawApplication.fulfilled, (state, { payload: appId }) => {
        state.mutatingApplicationId = null;
        const app = state.myApplications.find((a) => a.id === appId);
        state.myApplications = state.myApplications.filter((a) => a.id !== appId);
        // Flip has_applied back off in the public list so the button resets
        if (app?.job_listing_id) {
          replaceInArr(state.jobs, { id: app.job_listing_id, has_applied: false });
        }
        state.message = 'Application withdrawn';
      })
      .addCase(withdrawApplication.rejected, (state, { payload }) => {
        state.mutatingApplicationId = null;
        state.error = payload;
      })

      // ═══ Instructor: my applications ═══════════════════════
      .addCase(fetchMyApplications.pending, (state) => {
        state.myApplicationsStatus = STATUS.LOADING;
      })
      .addCase(fetchMyApplications.fulfilled, (state, { payload }) => {
        state.myApplicationsStatus = STATUS.SUCCEEDED;
        state.myApplications = payload?.data?.applications || payload?.data || [];
      })
      .addCase(fetchMyApplications.rejected, (state, { payload }) => {
        state.myApplicationsStatus = STATUS.FAILED;
        state.error = payload;
      });
  },
});

export const { clearJobError, clearJobMessage, locallyMarkApplied } = jobSlice.actions;
export default jobSlice.reducer;
import { createSlice } from '@reduxjs/toolkit';
import { STATUS } from '../../constants/apiConstants';
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
  fetchAdminJobs,
  fetchAdminJobDetail,
  deactivateAdminJob,
  activateAdminJob,
  deleteAdminJob,
} from '../actions/jobAction';

const initialState = {
  jobs: [],
  status: STATUS.IDLE,

  myJobs: [],
  myJobsStatus: STATUS.IDLE,

  applicantsByJobId: {},

  myApplications: [],
  myApplicationsStatus: STATUS.IDLE,

  applyingJobId: null,
  mutatingApplicationId: null,

  error: null,
  message: null,

   adminJobs: [],
  adminJobsStatus: STATUS.IDLE,
  adminJobsPagination: null,
  selectedJob: null,

  jobsMeta: { page: 1, per_page: 10, total: 0, last_page: 1 },
};

const unwrapJobs = (payload) =>
  payload?.data?.jobs || payload?.data || [];

const unwrapJob = (payload) =>
  payload?.data?.job || payload?.data || null;

const unwrapApplicants = (payload) =>
  payload?.data?.applicants || payload?.applicants || [];

const unwrapApplication = (payload) =>
  payload?.data?.application || payload?.application || null;

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
    clearSelectedJob(state) {
      state.selectedJob = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.status = STATUS.LOADING;
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, { payload }) => {
        state.status = STATUS.SUCCEEDED;
        const list = unwrapJobs(payload);
        const next = Array.isArray(list) ? list : [];

        if (payload?.append) {
          const seen = new Set(state.jobs.map((j) => j.id));
          state.jobs = [...state.jobs, ...next.filter((j) => !seen.has(j.id))];
        } else {
          state.jobs = next;
        }

        state.jobsMeta = {
          page:      payload?.data?.meta?.page      ?? 1,
          per_page:  payload?.data?.meta?.per_page  ?? 10,
          total:     payload?.data?.meta?.total     ?? state.jobs.length,
          last_page: payload?.data?.meta?.last_page ?? 1,
        };
      })
      .addCase(fetchJobs.rejected, (state, { payload }) => {
        state.status = STATUS.FAILED;
        state.error = payload;
      })

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

      .addCase(createJob.pending, (state) => {
        state.myJobsStatus = STATUS.LOADING;
      })
      .addCase(createJob.fulfilled, (state, { payload }) => {
        state.myJobsStatus = STATUS.SUCCEEDED;
        const newJob = unwrapJob(payload);
        if (newJob) {
          state.myJobs.unshift(newJob);
          if (newJob.is_active !== false) state.jobs.unshift(newJob);
        }
        state.message = payload?.message || 'Listing created successfully';
      })
      .addCase(createJob.rejected, (state, { payload }) => {
        state.myJobsStatus = STATUS.FAILED;
        state.error = payload;
      })

      .addCase(updateJob.fulfilled, (state, { payload }) => {
        const updated = unwrapJob(payload);
        if (updated) {
          replaceInArr(state.myJobs, updated);
          replaceInArr(state.jobs, updated);
          if (updated.is_active === false) {
            state.jobs = state.jobs.filter((j) => j.id !== updated.id);
          }
        }
        state.message = payload?.message || 'Listing updated';
      })
      .addCase(updateJob.rejected, (state, { payload }) => {
        state.error = payload;
      })

      .addCase(deleteJob.fulfilled, (state, { payload: id }) => {
        state.myJobs = state.myJobs.filter((j) => j.id !== id);
        state.jobs   = state.jobs.filter((j)   => j.id !== id);
        delete state.applicantsByJobId[id];
        state.message = 'Listing deleted';
      })
      .addCase(deleteJob.rejected, (state, { payload }) => {
        state.error = payload;
      })

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

      .addCase(applyToJob.pending, (state, { meta }) => {
        state.applyingJobId = meta.arg.jobId;
      })
      .addCase(applyToJob.fulfilled, (state, { payload }) => {
        state.applyingJobId = null;
        const { jobId, payload: resp } = payload;
        const app = unwrapApplication(resp);
        if (app) {
          const existing = state.myApplications.findIndex(
            (a) => a.job_listing_id === app.job_listing_id,
          );
          if (existing !== -1) state.myApplications[existing] = app;
          else state.myApplications.unshift(app);
        }
        replaceInArr(state.jobs, { id: jobId, has_applied: true });
        state.message = resp?.message || 'Application submitted';
      })
      .addCase(applyToJob.rejected, (state, { payload }) => {
        state.applyingJobId = null;
        state.error = payload;
      })

      .addCase(withdrawApplication.pending, (state, { meta }) => {
        state.mutatingApplicationId = meta.arg;
      })
      .addCase(withdrawApplication.fulfilled, (state, { payload: appId }) => {
        state.mutatingApplicationId = null;
        const app = state.myApplications.find((a) => a.id === appId);
        state.myApplications = state.myApplications.filter((a) => a.id !== appId);
        if (app?.job_listing_id) {
          replaceInArr(state.jobs, { id: app.job_listing_id, has_applied: false });
        }
        state.message = 'Application withdrawn';
      })
      .addCase(withdrawApplication.rejected, (state, { payload }) => {
        state.mutatingApplicationId = null;
        state.error = payload;
      })

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
      })
      .addCase(fetchAdminJobs.pending, (state) => {
        state.adminJobsStatus = STATUS.LOADING;
        state.error = null;
      })
      .addCase(fetchAdminJobs.fulfilled, (state, { payload }) => {
        state.adminJobsStatus = STATUS.SUCCEEDED;
        state.adminJobs = unwrapJobs(payload);
        state.adminJobsPagination = payload?.data?.meta || payload?.meta || null;
      })
      .addCase(fetchAdminJobs.rejected, (state, { payload }) => {
        state.adminJobsStatus = STATUS.FAILED;
        state.error = payload;
      })

      .addCase(fetchAdminJobDetail.fulfilled, (state, { payload }) => {
        state.selectedJob = unwrapJob(payload);
      })
      .addCase(fetchAdminJobDetail.rejected, (state, { meta, payload }) => {
        const found = state.adminJobs.find((j) => j.id === meta.arg);
        if (found) state.selectedJob = found;
        state.error = payload;
      })

      .addCase(activateAdminJob.fulfilled, (state, { payload, meta }) => {
        const updated = unwrapJob(payload) || { id: meta.arg, is_active: true };
        replaceInArr(state.adminJobs, updated);
        if (state.selectedJob?.id === updated.id) {
          state.selectedJob = { ...state.selectedJob, ...updated };
        }
        state.message = payload?.message || 'Listing activated.';
      })
      .addCase(activateAdminJob.rejected, (state, { payload }) => { state.error = payload; })

      .addCase(deactivateAdminJob.fulfilled, (state, { payload, meta }) => {
        const updated = unwrapJob(payload) || { id: meta.arg, is_active: false };
        replaceInArr(state.adminJobs, updated);
        if (state.selectedJob?.id === updated.id) {
          state.selectedJob = { ...state.selectedJob, ...updated };
        }
        state.message = payload?.message || 'Listing deactivated.';
      })
      .addCase(deactivateAdminJob.rejected, (state, { payload }) => { state.error = payload; })

      .addCase(deleteAdminJob.fulfilled, (state, { payload: id }) => {
        state.adminJobs = state.adminJobs.filter((j) => j.id !== id);
        if (state.selectedJob?.id === id) state.selectedJob = null;
        state.message = 'Listing deleted.';
      })
      .addCase(deleteAdminJob.rejected, (state, { payload }) => { state.error = payload; })
  },
});

export const { clearJobError, clearJobMessage, clearSelectedJob } = jobSlice.actions;
export default jobSlice.reducer;

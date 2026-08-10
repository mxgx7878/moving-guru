import { createSlice } from '@reduxjs/toolkit';
import { STATUS } from '../../constants/apiConstants';
import { submitReport, fetchAdminReports, updateReportStatus } from '../actions/reportAction';

const initialState = {
  submitStatus: STATUS.IDLE,
  adminReports: [],
  adminStatus: STATUS.IDLE,
  meta: null,
  statusUpdating: STATUS.IDLE,
  error: null,
};

const reportSlice = createSlice({
  name: 'report',
  initialState,
  reducers: {
    clearReportError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitReport.pending, (state) => {
        state.submitStatus = STATUS.LOADING;
        state.error = null;
      })
      .addCase(submitReport.fulfilled, (state) => {
        state.submitStatus = STATUS.SUCCEEDED;
      })
      .addCase(submitReport.rejected, (state, { payload }) => {
        state.submitStatus = STATUS.FAILED;
        state.error = payload;
      })

      .addCase(fetchAdminReports.pending, (state) => {
        state.adminStatus = STATUS.LOADING;
        state.error = null;
      })
      .addCase(fetchAdminReports.fulfilled, (state, { payload }) => {
        state.adminStatus = STATUS.SUCCEEDED;
        state.adminReports = payload.data?.reports || [];
        state.meta = payload.data?.meta || null;
      })
      .addCase(fetchAdminReports.rejected, (state, { payload }) => {
        state.adminStatus = STATUS.FAILED;
        state.error = payload;
      })

      .addCase(updateReportStatus.pending, (state) => {
        state.statusUpdating = STATUS.LOADING;
      })
      .addCase(updateReportStatus.fulfilled, (state, { payload }) => {
        state.statusUpdating = STATUS.SUCCEEDED;
        const updated = payload.data?.report;
        if (updated) {
          const idx = state.adminReports.findIndex((r) => r.id === updated.id);
          if (idx !== -1) {
            state.adminReports[idx] = { ...state.adminReports[idx], ...updated };
          }
        }
      })
      .addCase(updateReportStatus.rejected, (state, { payload }) => {
        state.statusUpdating = STATUS.FAILED;
        state.error = payload;
      });
  },
});

export const { clearReportError } = reportSlice.actions;
export default reportSlice.reducer;

import { createSlice } from '@reduxjs/toolkit';
import { STATUS } from '../../constants/apiConstants';
import {
  fetchInstructorDashboard,
  fetchStudioDashboard,
} from '../actions/dashboardAction';

const initialState = {
  instructor: null,
  studio:     null,
  status:     STATUS.IDLE,
  error:      null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboardError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    const handlePending = (state, { meta }) => { state.status = STATUS.LOADING; state.requestId = meta.requestId; };
    const handleRejected = (state, { payload, meta }) => {
      if (state.requestId !== meta.requestId) return;
      state.status = STATUS.FAILED;
      state.error = payload;
    };

    builder
      .addCase(fetchInstructorDashboard.pending,   handlePending)
      .addCase(fetchInstructorDashboard.fulfilled, (state, { payload }) => {
        state.status = STATUS.SUCCEEDED;
        state.instructor = payload;
      })
      .addCase(fetchInstructorDashboard.rejected,  handleRejected)

      .addCase(fetchStudioDashboard.pending,   handlePending)
      .addCase(fetchStudioDashboard.fulfilled, (state, { payload }) => {
        state.status = STATUS.SUCCEEDED;
        state.studio = payload;
      })
      .addCase(fetchStudioDashboard.rejected,  handleRejected);
  },
});

export const { clearDashboardError } = dashboardSlice.actions;
export default dashboardSlice.reducer;

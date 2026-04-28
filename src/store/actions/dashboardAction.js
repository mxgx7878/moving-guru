import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../config/axiosInstance';
import { API_ENDPOINTS } from '../../constants/apiConstants';
import { getErrorMessage } from '../../utils/errorUtils';

export const fetchInstructorDashboard = createAsyncThunk(
  'dashboard/fetchInstructor',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(API_ENDPOINTS.DASHBOARD_INSTRUCTOR);
      return data?.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const fetchStudioDashboard = createAsyncThunk(
  'dashboard/fetchStudio',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(API_ENDPOINTS.DASHBOARD_STUDIO);
      return data?.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);
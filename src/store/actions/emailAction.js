import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../config/axiosInstance';
import { API_ENDPOINTS } from '../../constants/apiConstants';
import { getErrorMessage } from '../../utils/errorUtils';

/**
 * Fetch audience counts so the form can show "this will send to X users"
 * before the admin pulls the trigger.
 */
export const fetchAudienceCounts = createAsyncThunk(
  'email/audienceCounts',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(API_ENDPOINTS.ADMIN_EMAIL_AUDIENCE_COUNTS);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

/**
 * Send a broadcast — or a test, when payload.send_test is true.
 */
export const sendBroadcast = createAsyncThunk(
  'email/sendBroadcast',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(API_ENDPOINTS.ADMIN_EMAIL_BROADCAST, payload);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);
import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../config/axiosInstance';
import { API_ENDPOINTS } from '../../constants/apiConstants';
import { getErrorMessage } from '../../utils/errorUtils';

export const fetchInstructors = createAsyncThunk(
  'instructor/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(API_ENDPOINTS.INSTRUCTORS, { params });
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const fetchInstructorDetail = createAsyncThunk(
  'instructor/fetchDetail',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`${API_ENDPOINTS.INSTRUCTOR_DETAIL}/${id}`);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const saveInstructor = createAsyncThunk(
  'instructor/save',
  async (instructorId, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(API_ENDPOINTS.SAVE_INSTRUCTOR, { instructor_id: instructorId });
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const unsaveInstructor = createAsyncThunk(
  'instructor/unsave',
  async (instructorId, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(API_ENDPOINTS.UNSAVE_INSTRUCTOR, { instructor_id: instructorId });
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const fetchSavedInstructors = createAsyncThunk(
  'instructor/fetchSaved',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(API_ENDPOINTS.SAVED_INSTRUCTORS);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

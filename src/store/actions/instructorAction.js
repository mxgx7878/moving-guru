import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../config/axiosInstance';
import { API_ENDPOINTS } from '../../constants/apiConstants';
import { getErrorMessage } from '../../utils/errorUtils';

export const fetchInstructors = createAsyncThunk(
  'instructor/fetchAll',
  async (params = {}, { rejectWithValue ,getState }) => {
    try {
      const { append = false, ...query } = params;
      console.log(localStorage.getItem('access_token'))
      const isAuthed = Boolean(getState()?.auth?.user);
      const endpoint = isAuthed
        ? API_ENDPOINTS.ME_INSTRUCTORS
        : API_ENDPOINTS.INSTRUCTORS;

      const { data } = await axiosInstance.get(endpoint, { params: query });
      return { ...data, append };
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
      console.log('Fetched instructor detail:', data);
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

// ═══════════════════════════════════════════════════════════════
//  Admin user management (instructors + studios)
// ═══════════════════════════════════════════════════════════════

export const fetchAdminUsers = createAsyncThunk(
  'instructor/adminFetchUsers',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(API_ENDPOINTS.ADMIN_USERS, { params });
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const fetchAdminUserDetail = createAsyncThunk(
  'instructor/adminFetchUserDetail',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`${API_ENDPOINTS.ADMIN_USER_DETAIL}/${id}`);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const updateAdminUser = createAsyncThunk(
  'instructor/adminUpdateUser',
  async ({ id, ...payload }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.patch(
        `${API_ENDPOINTS.ADMIN_USER_UPDATE}/${id}`,
        payload,
      );
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const suspendAdminUser = createAsyncThunk(
  'instructor/adminSuspendUser',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.patch(
        `${API_ENDPOINTS.ADMIN_USER_SUSPEND}/${id}/suspend`,
        { reason },
      );
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const activateAdminUser = createAsyncThunk(
  'instructor/adminActivateUser',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.patch(
        `${API_ENDPOINTS.ADMIN_USER_ACTIVATE}/${id}/activate`,
      );
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const verifyAdminUser = createAsyncThunk(
  'instructor/adminVerifyUser',
  async ({ id, is_verified = true }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.patch(
        `${API_ENDPOINTS.ADMIN_USER_VERIFY}/${id}/verify`,
        { is_verified },
      );
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const deleteAdminUser = createAsyncThunk(
  'instructor/adminDeleteUser',
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`${API_ENDPOINTS.ADMIN_USER_DELETE}/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const createAdminUser = createAsyncThunk(
  'instructor/adminCreateUser',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(API_ENDPOINTS.ADMIN_USER_CREATE, payload);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const approveAdminUser = createAsyncThunk(
  'instructor/adminApproveUser',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.patch(
        `${API_ENDPOINTS.ADMIN_USER_APPROVE}/${id}/approve`,
      );
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const rejectAdminUser = createAsyncThunk(
  'instructor/adminRejectUser',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.patch(
        `${API_ENDPOINTS.ADMIN_USER_REJECT}/${id}/reject`,
        { reason },
      );
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);
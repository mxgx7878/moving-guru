import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../config/axiosInstance';
import { API_ENDPOINTS } from '../../constants/apiConstants';
import { getErrorMessage } from '../../utils/errorUtils';

export const fetchJobs = createAsyncThunk(
  'job/fetchAll',
  async (params ={}, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(API_ENDPOINTS.JOBS, {params});
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const fetchMyJobs = createAsyncThunk(
  'job/fetchMine',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(API_ENDPOINTS.JOBS_MINE);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const createJob = createAsyncThunk(
  'job/create',
  async (jobData, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(API_ENDPOINTS.JOBS, jobData);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const updateJob = createAsyncThunk(
  'job/update',
  async ({ id, ...jobData }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.patch(`${API_ENDPOINTS.JOB_DETAIL}/${id}`, jobData);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const deleteJob = createAsyncThunk(
  'job/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`${API_ENDPOINTS.JOB_DETAIL}/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);



export const fetchJobApplicants = createAsyncThunk(
  'job/fetchApplicants',
  async (jobId, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(
        `${API_ENDPOINTS.JOB_APPLICANTS}/${jobId}/applicants`,
      );
      return { jobId, payload: data };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);



export const updateApplicationStatus = createAsyncThunk(
  'job/updateApplicationStatus',
  async ({ applicationId, jobId, status }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.patch(
        `${API_ENDPOINTS.APPLICATION_STATUS}/${applicationId}/status`,
        { status },
      );
      return { applicationId, jobId, payload: data };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);



export const applyToJob = createAsyncThunk(
  'job/apply',
  async ({ jobId, message }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(
        `${API_ENDPOINTS.JOB_APPLY}/${jobId}/apply`,
        { message },
      );
      return { jobId, payload: data };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);


export const withdrawApplication = createAsyncThunk(
  'job/withdraw',
  async (applicationId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`${API_ENDPOINTS.APPLICATIONS}/${applicationId}`);
      return applicationId;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
)


export const fetchMyApplications = createAsyncThunk(
  'job/fetchMyApplications',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(API_ENDPOINTS.APPLICATIONS_MINE);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);
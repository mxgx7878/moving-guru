import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../config/axiosInstance';
import { API_ENDPOINTS } from '../../constants/apiConstants';
import { getErrorMessage } from '../../utils/errorUtils';

export const fetchPayments = createAsyncThunk(
  'payment/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(API_ENDPOINTS.PAYMENTS);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const downloadInvoice = createAsyncThunk(
  'payment/downloadInvoice',
  async (paymentId, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`${API_ENDPOINTS.DOWNLOAD_INVOICE}/${paymentId}/invoice`, {
        responseType: 'blob',
      });
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

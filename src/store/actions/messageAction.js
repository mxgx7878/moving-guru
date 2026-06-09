import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../config/axiosInstance';
import { API_ENDPOINTS } from '../../constants/apiConstants';
import { getErrorMessage } from '../../utils/errorUtils';

export const fetchConversations = createAsyncThunk(
  'message/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(API_ENDPOINTS.CONVERSATIONS);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const fetchMessages = createAsyncThunk(
  'message/fetchMessages',
  async (conversationId, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`${API_ENDPOINTS.MESSAGES}/${conversationId}/messages`);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const sendMessage = createAsyncThunk(
  'message/send',
  async ({ conversationId, text }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(`${API_ENDPOINTS.MESSAGES}/${conversationId}/messages`, { body: text });
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

// camelCase end-to-end — backend validates { recipientId, body }.
// Thunk arg shape ({ recipientId, message }) is unchanged so existing
// callers (e.g. AdminGrowPosts reject flow) keep working as-is.
export const createConversation = createAsyncThunk(
  'message/createConversation',
  async ({ recipientId, message }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(API_ENDPOINTS.CONVERSATIONS, {
        recipientId,
        body: message,
      });
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

// Marks all incoming messages in a conversation as read — used when a
// realtime message lands while the thread is already open on screen.
export const markConversationRead = createAsyncThunk(
  'message/markConversationRead',
  async (conversationId, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.patch(`${API_ENDPOINTS.CONVERSATIONS}/${conversationId}/read`);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);
import { createSlice } from '@reduxjs/toolkit';
import { STATUS } from '../../constants/apiConstants';
import {
  fetchConversations,
  fetchMessages,
  sendMessage,
  createConversation,
} from '../actions/messageAction';

const initialState = {
  conversations: [],
  messages: [],
  status: STATUS.IDLE,
  sendStatus: STATUS.IDLE,
  error: null,
};

const messageSlice = createSlice({
  name: 'message',
  initialState,
  reducers: {
    clearMessageError(state) {
      state.error = null;
    },
    clearMessages(state) {
      state.messages = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.status = STATUS.LOADING;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, { payload }) => {
        state.status = STATUS.SUCCEEDED;
        const apiData = payload.data?.conversations || payload.data;
        state.conversations = Array.isArray(apiData) ? apiData : [];
      })
      .addCase(fetchConversations.rejected, (state, { payload }) => {
        state.status = STATUS.FAILED;
        state.error = payload;
      })

      .addCase(fetchMessages.pending, (state) => {
        state.status = STATUS.LOADING;
      })
      .addCase(fetchMessages.fulfilled, (state, { payload }) => {
        state.status = STATUS.SUCCEEDED;
        const apiMsgs = payload.data?.messages || payload.data;
        state.messages = Array.isArray(apiMsgs) ? apiMsgs : [];
      })
      .addCase(fetchMessages.rejected, (state, { payload }) => {
        state.status = STATUS.FAILED;
        state.error = payload;
      })

      .addCase(sendMessage.pending, (state) => {
        state.sendStatus = STATUS.LOADING;
      })
      .addCase(sendMessage.fulfilled, (state, { payload }) => {
        state.sendStatus = STATUS.SUCCEEDED;
        const newMsg = payload.data?.message || payload.data;
        if (newMsg) state.messages.push(newMsg);
      })
      .addCase(sendMessage.rejected, (state, { payload }) => {
        state.sendStatus = STATUS.FAILED;
        state.error = payload;
      })

      .addCase(createConversation.fulfilled, (state, { payload }) => {
        const newConvo = payload.data?.conversation || payload.data;
        if (newConvo) state.conversations.unshift(newConvo);
      });
  },
});

export const { clearMessageError, clearMessages } = messageSlice.actions;
export default messageSlice.reducer;

import { createSlice } from '@reduxjs/toolkit';
import { STATUS } from '../../constants/apiConstants';
import { DUMMY_CONVERSATIONS, DUMMY_MESSAGES } from '../../data/dummyData';
import {
  fetchConversations,
  fetchMessages,
  sendMessage,
  createConversation,
} from '../actions/messageAction';

const initialState = {
  conversations: DUMMY_CONVERSATIONS,
  messages: DUMMY_MESSAGES['conv_001'] || [],
  allMessages: DUMMY_MESSAGES,
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
      // Fetch conversations
      .addCase(fetchConversations.pending, (state) => {
        state.status = STATUS.LOADING;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, { payload }) => {
        state.status = STATUS.SUCCEEDED;
        const apiData = payload.data?.conversations || payload.data;
        if (apiData && Array.isArray(apiData) && apiData.length > 0) {
          state.conversations = apiData;
        }
      })
      .addCase(fetchConversations.rejected, (state) => {
        state.status = STATUS.SUCCEEDED;
        // Keep dummy conversations
      })

      // Fetch messages
      .addCase(fetchMessages.pending, (state) => {
        state.status = STATUS.LOADING;
      })
      .addCase(fetchMessages.fulfilled, (state, { payload }) => {
        state.status = STATUS.SUCCEEDED;
        const apiMsgs = payload.data?.messages || payload.data;
        if (apiMsgs && Array.isArray(apiMsgs) && apiMsgs.length > 0) {
          state.messages = apiMsgs;
        }
      })
      .addCase(fetchMessages.rejected, (state) => {
        state.status = STATUS.SUCCEEDED;
        // Keep dummy messages
      })

      // Send message
      .addCase(sendMessage.pending, (state) => {
        state.sendStatus = STATUS.LOADING;
      })
      .addCase(sendMessage.fulfilled, (state, { payload }) => {
        state.sendStatus = STATUS.SUCCEEDED;
        const newMsg = payload.data?.message || payload.data;
        if (newMsg) {
          state.messages.push(newMsg);
        }
      })
      .addCase(sendMessage.rejected, (state, { payload }) => {
        state.sendStatus = STATUS.FAILED;
        state.error = payload;
      })

      // Create conversation
      .addCase(createConversation.fulfilled, (state, { payload }) => {
        const newConvo = payload.data?.conversation || payload.data;
        if (newConvo) {
          state.conversations.unshift(newConvo);
        }
      });
  },
});

export const { clearMessageError, clearMessages } = messageSlice.actions;
export default messageSlice.reducer;

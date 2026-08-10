import { createSlice } from '@reduxjs/toolkit';
import { STATUS } from '../../constants/apiConstants';
import {
  fetchConversations,
  fetchMessages,
  sendMessage,
  createConversation,
  markConversationRead,
} from '../actions/messageAction';

const initialState = {
  conversations: [],
  messages: [],
  activeConversationId: null,
  status: STATUS.IDLE,
  messagesStatus: STATUS.IDLE,
  sendStatus: STATUS.IDLE,
  error: null,
};

const bumpConversation = (state, conversationId, patch = {}) => {
  const idx = state.conversations.findIndex((c) => c.id === conversationId);
  if (idx === -1) return null;
  const updated = { ...state.conversations[idx], ...patch };
  state.conversations.splice(idx, 1);
  state.conversations.unshift(updated);
  return updated;
};

const zeroUnread = (state, conversationId) => {
  const convo = state.conversations.find((c) => c.id === conversationId);
  if (convo) convo.unreadCount = 0;
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
    setActiveConversation(state, { payload }) {
      state.activeConversationId = payload ?? null;
      if (payload) zeroUnread(state, payload);
    },

    chatMessageReceived(state, { payload }) {
      const msg = payload?.message;
      if (!msg || msg.conversationId !== state.activeConversationId) return;
      if (state.messages.some((m) => m.id === msg.id)) return;
      state.messages.push(msg);
      bumpConversation(state, msg.conversationId, {
        lastMessage: { body: msg.body, senderId: msg.senderId, createdAt: msg.createdAt },
        lastMessageAt: msg.createdAt,
        unreadCount: 0,
      });
    },

    inboxMessageReceived(state, { payload }) {
      const msg = payload?.message;
      if (!msg) return;
      const isActive = msg.conversationId === state.activeConversationId;

      const existing = state.conversations.find((c) => c.id === msg.conversationId);
      if (existing) {
        bumpConversation(state, msg.conversationId, {
          lastMessage: { body: msg.body, senderId: msg.senderId, createdAt: msg.createdAt },
          lastMessageAt: msg.createdAt,
          unreadCount: isActive ? 0 : (existing.unreadCount || 0) + 1,
        });
      } else if (payload?.conversation) {
        state.conversations.unshift({
          ...payload.conversation,
          lastMessage: { body: msg.body, senderId: msg.senderId, createdAt: msg.createdAt },
          unreadCount: isActive ? 0 : 1,
        });
      }
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
        state.messagesStatus = STATUS.LOADING;
      })
      .addCase(fetchMessages.fulfilled, (state, { payload }) => {
        state.messagesStatus = STATUS.SUCCEEDED;
        const apiMsgs = payload.data?.messages || payload.data;
        state.messages = Array.isArray(apiMsgs) ? apiMsgs : [];
        const convoId = payload.data?.conversationId;
        if (convoId) zeroUnread(state, convoId);
      })
      .addCase(fetchMessages.rejected, (state, { payload }) => {
        state.messagesStatus = STATUS.FAILED;
        state.error = payload;
      })

      .addCase(sendMessage.pending, (state) => {
        state.sendStatus = STATUS.LOADING;
      })
      .addCase(sendMessage.fulfilled, (state, { payload }) => {
        state.sendStatus = STATUS.SUCCEEDED;
        const newMsg = payload.data?.message || payload.data;
        if (newMsg && !state.messages.some((m) => m.id === newMsg.id)) {
          state.messages.push(newMsg);
        }
        if (newMsg?.conversationId) {
          bumpConversation(state, newMsg.conversationId, {
            lastMessage: { body: newMsg.body, senderId: newMsg.senderId, createdAt: newMsg.createdAt },
            lastMessageAt: newMsg.createdAt,
          });
        }
      })
      .addCase(sendMessage.rejected, (state, { payload }) => {
        state.sendStatus = STATUS.FAILED;
        state.error = payload;
      })

      .addCase(createConversation.fulfilled, (state, { payload }) => {
        const newConvo = payload.data?.conversation || payload.data;
        if (!newConvo?.id) return;
        state.conversations = state.conversations.filter((c) => c.id !== newConvo.id);
        state.conversations.unshift(newConvo);
      })

      .addCase(markConversationRead.fulfilled, (state, { payload, meta }) => {
        const convoId = payload.data?.conversationId ?? meta.arg;
        if (convoId) zeroUnread(state, convoId);
      });
  },
});

export const {
  clearMessageError,
  clearMessages,
  setActiveConversation,
  chatMessageReceived,
  inboxMessageReceived,
} = messageSlice.actions;
export default messageSlice.reducer;

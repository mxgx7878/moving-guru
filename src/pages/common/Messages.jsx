import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { Search, Send, ArrowLeft } from 'lucide-react';
import { ROLE_THEME } from '../../config/portalConfig';
import {
  fetchConversations,
  fetchMessages,
  sendMessage as sendMessageAction,
  createConversation,
  markConversationRead,
} from '../../store/actions/messageAction';
import {
  setActiveConversation,
  clearMessages,
  chatMessageReceived,
} from '../../store/slices/messageSlice';
import { STATUS } from '../../constants/apiConstants';
import { TableSkeleton } from '../../components/feedback';
import { ButtonLoader } from '../../components/feedback';
import { Avatar } from '../../components/ui';
import { getEcho } from '../../config/echo';
import { toast } from 'sonner';

// "14:32" today, "Tue" within the week, "12 May" beyond that.
const formatStamp = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  if ((now - d) / 86400000 < 7) {
    return d.toLocaleDateString([], { weekday: 'short' });
  }
  return d.toLocaleDateString([], { day: 'numeric', month: 'short' });
};

export default function Messages() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector((s) => s.auth);
  // Real users.id — flattenUser detail.id se user.id ko override kar
  // deta hai, isliye user_id pehle (admin ke liye id fallback).
  const myId = user?.user_id ?? user?.id;
  const { conversations, messages, status, messagesStatus, sendStatus } = useSelector((s) => s.message);
  const role = user?.role || 'instructor';
  const theme = ROLE_THEME[role] || ROLE_THEME.instructor;

  const [activeId, setActiveId] = useState(null);
  const [msgText, setMsgText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  // Mobile: controls whether we're showing the conversation list or the chat
  const [mobileView, setMobileView] = useState('list'); // 'list' | 'chat'
  // Draft thread — jab kisi ke profile/card se "Chat" dabate hain aur in
  // dono ke beech abhi koi conversation nahi hai. Pehla message bhejte hi
  // real conversation ban jati hai.
  const [draftRecipient, setDraftRecipient] = useState(null); // { id, name, avatarUrl }
  const [creating, setCreating] = useState(false);

  const scrollRef = useRef(null);
  // Deep-link target (kisi page se navigate hua to) — sirf ek baar consume.
  const deepLinkRef = useRef(false);

  const activeConvo = (!activeId && draftRecipient)
    ? { id: null, participant: draftRecipient, isDraft: true }
    : conversations.find((c) => c.id === activeId) || null;
  const sending = sendStatus === STATUS.LOADING || creating;

  // Load inbox; reset active conversation state on unmount so inbox events
  // bump unread badges again once we leave this page.
  useEffect(() => {
    dispatch(fetchConversations());
    return () => {
      dispatch(setActiveConversation(null));
      dispatch(clearMessages());
    };
  }, [dispatch]);

  // On desktop only: auto-select first conversation. On mobile we wait for tap.
  // (Skip when arriving with a recipient to open, or a draft is pending.)
  useEffect(() => {
    if (location.state?.recipientId && !deepLinkRef.current) return;
    if (draftRecipient) return;
    if (conversations.length > 0 && !activeId && window.innerWidth >= 768) {
      setActiveId(conversations[0].id);
    }
  }, [conversations, activeId, location.state, draftRecipient]);

  // Deep-link: a "Chat" button elsewhere navigates here with
  // { state: { recipientId, recipientName, recipientAvatar } }. If a thread
  // with that user already exists we open it; otherwise we open a DRAFT
  // thread — the real conversation is created on the first send.
  useEffect(() => {
    const recipientId = location.state?.recipientId;
    if (!recipientId || deepLinkRef.current) return;
    if (status !== STATUS.SUCCEEDED) return; // wait for the inbox to load first
    deepLinkRef.current = true;

    const existing = conversations.find(
      (c) => Number(c.participant?.id) === Number(recipientId),
    );
    if (existing) {
      setDraftRecipient(null);
      setActiveId(existing.id);
    } else {
      dispatch(clearMessages());
      dispatch(setActiveConversation(null));
      setActiveId(null);
      setDraftRecipient({
        id: recipientId,
        name: location.state?.recipientName,
        avatarUrl: location.state?.recipientAvatar,
      });
    }
    setMobileView('chat');
  }, [location.state, conversations, status, dispatch]);

  // Opening a thread: clear the previous one, mark it active (zeroes its
  // unread badge) and fetch — the backend marks incoming messages read.
  useEffect(() => {
    if (!activeId) return;
    dispatch(clearMessages());
    dispatch(setActiveConversation(activeId));
    dispatch(fetchMessages(activeId));
  }, [activeId, dispatch]);

  // Live thread: subscribe to conversation.{id} while it's open.
  useEffect(() => {
    const echo = getEcho();
    if (!echo || !activeId) return undefined;

    const channelName = `conversation.${activeId}`;
    echo.private(channelName).listen('.message.sent', (payload) => {
      const msg = payload?.message;
      // Own messages already arrive via the send response — skip the echo.
      if (!msg || msg.senderId === myId) return;
      dispatch(chatMessageReceived(payload));
      // It was read on screen — keep the server's unread counter in sync.
      dispatch(markConversationRead(activeId));
    });

    return () => {
      echo.leave(channelName);
    };
  }, [activeId, myId, dispatch]);

  // Pin the thread to the newest message.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, activeId]);

  const handleOpenConvo = (convo) => {
    setDraftRecipient(null);
    setActiveId(convo.id);
    setMobileView('chat');
  };

  const handleBackToList = () => {
    setMobileView('list');
  };

  const convoDisplayName = (convo) => {
    const r = convo?.participant?.role;
    // Platform admin messages always appear from "GURU" in the inbox.
    if (r === 'admin') return 'GURU';
    return convo?.participant?.name || 'Unknown';
  };

  const handleSend = () => {
    const text = msgText.trim();
    if (!text || sending) return;
    if (!activeId && !draftRecipient) return;
    setMsgText('');

    if (activeId) {
      dispatch(sendMessageAction({ conversationId: activeId, text }));
      return;
    }

    // Draft → create the conversation with this first message, then switch to
    // the real thread so live updates + read state work normally.
    setCreating(true);
    dispatch(createConversation({ recipientId: draftRecipient.id, message: text }))
      .unwrap()
      .then((res) => {
        const newId = res?.data?.conversation?.id;
        if (newId) {
          setDraftRecipient(null);
          setActiveId(newId);
        }
      })
      .catch((err) => {
        setMsgText(text); // restore so the message isn't lost
        toast.error(err?.message || (typeof err === 'string' ? err : 'Failed to send message'));
      })
      .finally(() => setCreating(false));
  };

  const filteredConversations = conversations.filter(c =>
    !searchQuery || convoDisplayName(c).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const subtitle = role === 'studio'
    ? 'Connect with instructors'
    : 'Connect with studios and instructors';

  if (status === STATUS.LOADING && conversations.length === 0) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="font-unbounded text-xl font-black text-[#3E3D38]">Messages</h1>
          <p className="text-[#9A9A94] text-sm mt-1">{subtitle}</p>
        </div>
        <TableSkeleton rows={6} cols={3} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-4 sm:mb-6 hidden md:block">
        <h1 className="font-unbounded text-xl font-black text-[#3E3D38]">Messages</h1>
        <p className="text-[#9A9A94] text-sm mt-1">{subtitle}</p>
      </div>

      {/* Container — responsive height that respects the mobile viewport.
          On mobile this fills the available area below the top bar so messages
          aren't cut off. Use dvh (dynamic viewport height) for iOS Safari. */}
      <div
        className="bg-white rounded-2xl border border-[#E5E0D8] overflow-hidden"
        style={{ height: 'min(calc(100dvh - 7rem), calc(100vh - 7rem))', minHeight: '420px' }}
      >
        <div className="flex h-full relative">

          {/* ── Conversation list ──
              Mobile: full-width slide panel, hidden when chat is open.
              Desktop (md+): always visible left column. */}
          <div
            className={`
              ${mobileView === 'list' ? 'flex' : 'hidden'} md:flex
              w-full md:w-80 border-r border-[#E5E0D8] flex-col flex-shrink-0
            `}
          >
            {/* Mobile header inside list */}
            <div className="md:hidden px-4 pt-3 pb-1">
              <h1 className="font-unbounded text-lg font-black text-[#3E3D38]">Messages</h1>
              <p className="text-[#9A9A94] text-xs">{subtitle}</p>
            </div>

            <div className="p-3 border-b border-[#E5E0D8]">
              <div className="flex items-center gap-2 bg-[#FFFFFF] rounded-xl px-3 py-2 border border-[#E5E0D8]">
                <Search size={14} className="text-[#9A9A94]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search messages..."
                  className="flex-1 bg-transparent border-none outline-none text-sm text-[#3E3D38] placeholder-[#C4BCB4] min-w-0"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 && (
                <div className="p-6 text-center">
                  <p className="text-[#9A9A94] text-sm">No conversations yet</p>
                </div>
              )}
              {filteredConversations.map(convo => (
                <button
                  key={convo.id}
                  onClick={() => handleOpenConvo(convo)}
                  className={`w-full text-left px-4 py-3.5 flex items-center gap-3 transition-colors border-b border-[#E5E0D8]/50
                    ${activeId === convo.id ? 'bg-[#FAFEE0]' : 'hover:bg-[#FAFEE0]/50'}`}
                >
                  <Avatar
                    name={convoDisplayName(convo)}
                    src={convo.participant?.avatarUrl}
                    size="sm"
                    tone={theme.avatarTone}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-sm font-semibold text-[#3E3D38] truncate">
                        {convoDisplayName(convo)}
                      </p>
                      <span className="text-[10px] text-[#9A9A94] flex-shrink-0">
                        {formatStamp(convo.lastMessageAt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <p className="text-xs text-[#9A9A94] truncate">
                        {convo.lastMessage?.body || 'No messages yet'}
                      </p>
                      {convo.unreadCount > 0 && (
                        <span className="flex-shrink-0 min-w-[18px] h-[18px] px-1.5 bg-[#B4FF5A] text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                          {convo.unreadCount > 9 ? '9+' : convo.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* ── Chat panel ──
              Mobile: slides in over the list when a conversation is open.
              Desktop: always visible right column. */}
          <div
            className={`
              ${mobileView === 'chat' ? 'flex' : 'hidden'} md:flex
              flex-1 flex-col min-w-0 absolute md:relative inset-0 md:inset-auto bg-white
              transition-transform duration-300 ease-out
              ${mobileView === 'chat' ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
            `}
          >
            {activeConvo ? (
              <>
                {/* Chat header */}
                <div className="px-4 sm:px-5 py-3 sm:py-3.5 border-b border-[#E5E0D8] flex items-center gap-3">
                  {/* Mobile back arrow */}
                  <button
                    onClick={handleBackToList}
                    className="md:hidden -ml-1 p-1.5 rounded-lg hover:bg-[#FFFFFF] transition-colors text-[#3E3D38] flex-shrink-0"
                    aria-label="Back to messages"
                  >
                    <ArrowLeft size={20} />
                  </button>

                  <Avatar
                    name={convoDisplayName(activeConvo)}
                    src={activeConvo.participant?.avatarUrl}
                    size="sm"
                    tone={theme.avatarTone}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#3E3D38] truncate">
                      {convoDisplayName(activeConvo)}
                    </p>
                    <p
                      className="text-[10px] font-medium truncate capitalize"
                      style={{ color: theme.accent }}
                    >
                      {activeConvo.participant?.role === 'admin' ? 'Moving Guru' : activeConvo.participant?.role}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                  {activeId && messagesStatus === STATUS.LOADING ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-[#B4FF5A] border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-[#9A9A94] text-sm">No messages yet — say hi!</p>
                    </div>
                  ) : (
                    messages.map(msg => {
                      const isMine = msg.senderId === myId;
                      return (
                        <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                          <div className="max-w-[80%] sm:max-w-[70%]">
                            <div
                              className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                                ${isMine
                                  ? 'text-white rounded-br-md'
                                  : 'bg-[#F5FDA6]/40 text-[#3E3D38] rounded-bl-md border border-[#F5FDA6]'
                                }`}
                              style={isMine ? { backgroundColor: theme.accent } : undefined}
                            >
                              {msg.body}
                            </div>
                            <p className={`text-[10px] text-[#9A9A94] mt-1 ${isMine ? 'text-right' : ''}`}>
                              {formatStamp(msg.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Input */}
                <div className="p-3 sm:p-4 border-t border-[#E5E0D8] flex items-end gap-2 sm:gap-3">
                  <input
                    type="text"
                    value={msgText}
                    onChange={e => setMsgText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    placeholder="Type a message..."
                    className="flex-1 bg-[#FFFFFF] border border-[#E5E0D8] rounded-xl px-4 py-3 text-sm text-[#3E3D38] placeholder-[#C4BCB4] focus:outline-none transition-all min-w-0"
                    style={{ '--tw-ring-color': theme.accent }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={sending || !msgText.trim()}
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-white transition-colors flex-shrink-0 disabled:opacity-50"
                    style={{ backgroundColor: theme.accent }}
                  >
                    {sending ? <ButtonLoader size={16} /> : <Send size={16} />}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-6">
                <p className="text-[#9A9A94] text-sm text-center">Select a conversation to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
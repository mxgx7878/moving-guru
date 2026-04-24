import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Search, Send, ArrowLeft } from 'lucide-react';
import { ROLE_THEME } from '../../config/portalConfig';
import { fetchConversations, fetchMessages, sendMessage as sendMessageAction } from '../../store/actions/messageAction';
import { STATUS } from '../../constants/apiConstants';
import { TableSkeleton } from '../../components/feedback';
import { ButtonLoader } from '../../components/feedback';
import { Avatar } from '../../components/ui';

export default function Messages() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { conversations, messages, allMessages, status } = useSelector((s) => s.message);
  const role = user?.role || 'instructor';
  const theme = ROLE_THEME[role] || ROLE_THEME.instructor;

  const [activeConvo, setActiveConvo] = useState(null);
  const [msgText, setMsgText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sending, setSending] = useState(false);
  const [localMessages, setLocalMessages] = useState([]);
  // Mobile: controls whether we're showing the conversation list or the chat
  const [mobileView, setMobileView] = useState('list'); // 'list' | 'chat'

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  // On desktop only: auto-select first conversation. On mobile we wait for tap.
  useEffect(() => {
    if (conversations.length > 0 && !activeConvo && window.innerWidth >= 768) {
      setActiveConvo(conversations[0]);
    }
  }, [conversations, activeConvo]);

  // Load messages — use allMessages dict (dummy) or fetch from API
  useEffect(() => {
    if (!activeConvo?.id) return;
    if (allMessages && allMessages[activeConvo.id]) {
      setLocalMessages(allMessages[activeConvo.id]);
    } else {
      dispatch(fetchMessages(activeConvo.id));
    }
  }, [activeConvo?.id, allMessages, dispatch]);

  // Sync API messages into localMessages
  useEffect(() => {
    if (messages.length > 0) {
      setLocalMessages(messages);
    }
  }, [messages]);

  const handleOpenConvo = (convo) => {
    setActiveConvo(convo);
    setMobileView('chat');
  };

  const handleBackToList = () => {
    setMobileView('list');
  };

  const handleSend = async () => {
    if (!msgText.trim() || !activeConvo) return;
    setSending(true);
    const newMsg = { id: `msg_local_${Date.now()}`, from: 'me', is_mine: true, text: msgText, time: 'Just now' };
    setLocalMessages(prev => [...prev, newMsg]);
    dispatch(sendMessageAction({ conversationId: activeConvo.id, text: msgText }));
    setMsgText('');
    setSending(false);
  };

  const filteredConversations = conversations.filter(c =>
    !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase())
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
              <div className="flex items-center gap-2 bg-[#FDFCF8] rounded-xl px-3 py-2 border border-[#E5E0D8]">
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
                    ${activeConvo?.id === convo.id ? `bg-[${theme.accent}]/5` : 'hover:bg-[#FDFCF8]'}`}
                >
                  <Avatar
                    name={convo.name}
                    src={convo.profile_picture_url || convo.profile_picture || convo.avatar_url || convo.avatar}
                    size="md"
                    tone="coral"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-[#3E3D38] text-sm font-semibold truncate">{convo.name}</p>
                      <span className="text-[#9A9A94] text-[10px] flex-shrink-0 ml-2">{convo.time || convo.last_message_at}</span>
                    </div>
                    <p className="text-[#9A9A94] text-xs truncate">{convo.lastMessage || convo.last_message}</p>
                    {convo.discipline && (
                      <p className="text-[10px] text-[#C4BCB4] mt-0.5">{convo.discipline}</p>
                    )}
                  </div>
                  {convo.unread > 0 && (
                    <span
                      className="w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: theme.accent }}
                    >
                      {convo.unread}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ── Chat area ──
              Mobile: full-width slide-in from right when convo is selected.
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
                    className="md:hidden -ml-1 p-1.5 rounded-lg hover:bg-[#FDFCF8] transition-colors text-[#3E3D38] flex-shrink-0"
                    aria-label="Back to messages"
                  >
                    <ArrowLeft size={20} />
                  </button>

                  <Avatar
                    name={activeConvo.name}
                    src={activeConvo.profile_picture_url || activeConvo.profile_picture || activeConvo.avatar_url || activeConvo.avatar}
                    size="sm"
                    tone={theme.avatarTone}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#3E3D38] truncate">{activeConvo.name}</p>
                    <p className="text-[10px] text-[#6BE6A4] font-medium truncate">
                      {activeConvo.online ? 'Online' : activeConvo.discipline || ''}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                  {localMessages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.from === 'me' || msg.is_mine ? 'justify-end' : 'justify-start'}`}>
                      <div className="max-w-[80%] sm:max-w-[70%]">
                        <div
                          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                            ${msg.from === 'me' || msg.is_mine
                              ? 'text-white rounded-br-md'
                              : 'bg-[#f5fca6]/40 text-[#3E3D38] rounded-bl-md border border-[#f5fca6]'
                            }`}
                          style={msg.from === 'me' || msg.is_mine ? { backgroundColor: theme.accent } : undefined}
                        >
                          {msg.text || msg.body}
                        </div>
                        <p className={`text-[10px] text-[#9A9A94] mt-1 ${msg.from === 'me' || msg.is_mine ? 'text-right' : ''}`}>
                          {msg.time || msg.created_at}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input */}
                <div className="p-3 sm:p-4 border-t border-[#E5E0D8] flex items-end gap-2 sm:gap-3">
                  <input
                    type="text"
                    value={msgText}
                    onChange={e => setMsgText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    placeholder="Type a message..."
                    className="flex-1 bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-3 text-sm text-[#3E3D38] placeholder-[#C4BCB4] focus:outline-none transition-all min-w-0"
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

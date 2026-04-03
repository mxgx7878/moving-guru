import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Search, Send } from 'lucide-react';
import { ROLE_THEME } from '../../config/portalConfig';
import { fetchConversations, fetchMessages, sendMessage as sendMessageAction } from '../../store/actions/messageAction';
import { STATUS } from '../../constants/apiConstants';
import { TableSkeleton } from '../../components/feedback';
import { ButtonLoader } from '../../components/feedback';

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

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  useEffect(() => {
    if (conversations.length > 0 && !activeConvo) {
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

  const handleSend = async () => {
    if (!msgText.trim() || !activeConvo) return;
    setSending(true);
    // Add message locally for instant feedback
    const newMsg = { id: `msg_local_${Date.now()}`, from: 'me', is_mine: true, text: msgText, time: 'Just now' };
    setLocalMessages(prev => [...prev, newMsg]);
    // Also try API
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
          <h1 className="font-['Unbounded'] text-xl font-black text-[#3E3D38]">Messages</h1>
          <p className="text-[#9A9A94] text-sm mt-1">{subtitle}</p>
        </div>
        <TableSkeleton rows={6} cols={3} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="font-['Unbounded'] text-xl font-black text-[#3E3D38]">Messages</h1>
        <p className="text-[#9A9A94] text-sm mt-1">{subtitle}</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E0D8] overflow-hidden" style={{ height: 'calc(100vh - 220px)', minHeight: '500px' }}>
        <div className="flex h-full">
          {/* Conversation list */}
          <div className="w-80 border-r border-[#E5E0D8] flex flex-col flex-shrink-0">
            <div className="p-3 border-b border-[#E5E0D8]">
              <div className="flex items-center gap-2 bg-[#FDFCF8] rounded-xl px-3 py-2 border border-[#E5E0D8]">
                <Search size={14} className="text-[#9A9A94]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search messages..."
                  className="flex-1 bg-transparent border-none outline-none text-sm text-[#3E3D38] placeholder-[#C4BCB4]"
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
                  onClick={() => setActiveConvo(convo)}
                  className={`w-full text-left px-4 py-3.5 flex items-center gap-3 transition-colors border-b border-[#E5E0D8]/50
                    ${activeConvo?.id === convo.id ? `bg-[${theme.accent}]/5` : 'hover:bg-[#FDFCF8]'}`}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold font-['Unbounded'] flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, #CE4F56, #E89560)` }}
                  >
                    {convo.initials || convo.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
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

          {/* Chat area */}
          <div className="flex-1 flex flex-col min-w-0">
            {activeConvo ? (
              <>
                {/* Chat header */}
                <div className="px-5 py-3.5 border-b border-[#E5E0D8] flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold font-['Unbounded']"
                    style={{ background: `linear-gradient(135deg, #CE4F56, #E89560)` }}
                  >
                    {activeConvo.initials || activeConvo.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#3E3D38]">{activeConvo.name}</p>
                    <p className="text-[10px] text-[#6BE6A4] font-medium">
                      {activeConvo.online ? 'Online' : activeConvo.discipline || ''}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {localMessages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.from === 'me' || msg.is_mine ? 'justify-end' : 'justify-start'}`}>
                      <div className="max-w-[70%]">
                        <div
                          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                            ${msg.from === 'me' || msg.is_mine
                              ? 'text-white rounded-br-md'
                              : 'bg-[#F4F0EA] text-[#3E3D38] rounded-bl-md border border-[#E5E0D8]'
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
                <div className="p-4 border-t border-[#E5E0D8] flex items-end gap-3">
                  <input
                    type="text"
                    value={msgText}
                    onChange={e => setMsgText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    placeholder="Type a message..."
                    className="flex-1 bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-3 text-sm text-[#3E3D38] placeholder-[#C4BCB4] focus:outline-none transition-all"
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
              <div className="flex-1 flex items-center justify-center">
                <p className="text-[#9A9A94] text-sm">Select a conversation to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

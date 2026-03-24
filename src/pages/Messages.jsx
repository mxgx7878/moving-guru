import { useState } from 'react';
import { MessageCircle, Search, Send, User } from 'lucide-react';

const DEMO_CONVERSATIONS = [
  {
    id: 1,
    name: 'Flow Studio Bali',
    lastMessage: "We'd love to have you teach reformer classes!",
    time: '2h ago',
    unread: 2,
    initials: 'FS',
  },
  {
    id: 2,
    name: 'Sarah Chen',
    lastMessage: 'Are you still available for the swap in September?',
    time: '5h ago',
    unread: 1,
    initials: 'SC',
  },
  {
    id: 3,
    name: 'Zen Movement Co',
    lastMessage: "Thanks for your application! We'll review it shortly.",
    time: '1d ago',
    unread: 0,
    initials: 'ZM',
  },
];

const DEMO_MESSAGES = [
  { id: 1, from: 'them', text: "Hi Bambi! We saw your profile and love your experience with reformer Pilates.", time: '10:30 AM' },
  { id: 2, from: 'them', text: "We'd love to have you teach reformer classes at our studio in Bali this September!", time: '10:31 AM' },
  { id: 3, from: 'me', text: "Hi! Thank you so much, that sounds amazing! I'll be in South America until October but could potentially come to Bali after that.", time: '11:15 AM' },
  { id: 4, from: 'them', text: "That works perfectly! We have openings from October onwards. Shall we set up a call to discuss details?", time: '11:45 AM' },
];

export default function Messages() {
  const [activeConvo, setActiveConvo] = useState(DEMO_CONVERSATIONS[0]);
  const [message, setMessage] = useState('');

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="font-['Unbounded'] text-xl font-black text-[#3E3D38]">Messages</h1>
        <p className="text-[#9A9A94] text-sm mt-1">Connect with studios and instructors</p>
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
                  placeholder="Search messages..."
                  className="flex-1 bg-transparent border-none outline-none text-sm text-[#3E3D38] placeholder:text-[#9A9A94]"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {DEMO_CONVERSATIONS.map(convo => (
                <button
                  key={convo.id}
                  onClick={() => setActiveConvo(convo)}
                  className={`w-full text-left px-4 py-3.5 flex items-center gap-3 transition-colors border-b border-[#E5E0D8]/50
                    ${activeConvo?.id === convo.id ? 'bg-[#CE4F56]/8' : 'hover:bg-[#FDFCF8]'}`}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#CE4F56] to-[#E89560] flex items-center justify-center text-white text-xs font-bold font-['Unbounded'] flex-shrink-0">
                    {convo.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-[#3E3D38] truncate">{convo.name}</p>
                      <span className="text-[10px] text-[#9A9A94] flex-shrink-0 ml-2">{convo.time}</span>
                    </div>
                    <p className="text-xs text-[#6B6B66] truncate mt-0.5">{convo.lastMessage}</p>
                  </div>
                  {convo.unread > 0 && (
                    <span className="w-5 h-5 bg-[#CE4F56] text-white text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0">
                      {convo.unread}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Chat area */}
          <div className="flex-1 flex flex-col">
            {/* Chat header */}
            <div className="px-5 py-3.5 border-b border-[#E5E0D8] flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#CE4F56] to-[#E89560] flex items-center justify-center text-white text-xs font-bold font-['Unbounded']">
                {activeConvo?.initials}
              </div>
              <div>
                <p className="text-sm font-semibold text-[#3E3D38]">{activeConvo?.name}</p>
                <p className="text-[10px] text-[#6BE6A4] font-medium">Online</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {DEMO_MESSAGES.map(msg => (
                <div key={msg.id} className={`flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] ${msg.from === 'me' ? 'order-1' : ''}`}>
                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                      ${msg.from === 'me'
                        ? 'bg-[#CE4F56] text-white rounded-br-md'
                        : 'bg-[#f5fca6]/40 text-[#3E3D38] rounded-bl-md border border-[#E5E0D8]'
                      }`}>
                      {msg.text}
                    </div>
                    <p className={`text-[10px] text-[#9A9A94] mt-1 ${msg.from === 'me' ? 'text-right' : ''}`}>
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-[#E5E0D8]">
              <div className="flex items-center gap-3 bg-[#FDFCF8] rounded-xl px-4 py-2.5 border border-[#E5E0D8]">
                <input
                  type="text"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent border-none outline-none text-sm text-[#3E3D38] placeholder:text-[#9A9A94]"
                />
                <button className="w-8 h-8 bg-[#CE4F56] rounded-lg flex items-center justify-center hover:bg-[#b8454c] transition-colors">
                  <Send size={14} className="text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

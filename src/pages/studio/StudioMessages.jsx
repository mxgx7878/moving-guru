// StudioMessages.jsx
import { useState } from 'react';
import { MessageCircle, Search, Send } from 'lucide-react';

const CONVERSATIONS = [
  { id: 1, name: 'Bambi Romanowski', lastMessage: 'That sounds wonderful! When would you need me?', time: '1h ago', unread: 1, initials: 'BR', discipline: 'Reformer Pilates' },
  { id: 2, name: 'Sarah Chen', lastMessage: 'I have availability from September onwards.', time: '3h ago', unread: 2, initials: 'SC', discipline: 'Vinyasa Yoga' },
  { id: 3, name: 'Marco Silva', lastMessage: 'Happy to discuss the swap arrangement further!', time: 'Yesterday', unread: 0, initials: 'MS', discipline: 'Muay Thai' },
];

const MESSAGES = {
  1: [
    { id: 1, from: 'them', text: "Hi! I came across your studio on Moving Guru and I'm very interested.", time: '10:00 AM' },
    { id: 2, from: 'me', text: "Hi Bambi! We'd love to have a reformer instructor at our studio this August.", time: '10:15 AM' },
    { id: 3, from: 'them', text: 'That sounds wonderful! When would you need me?', time: '10:30 AM' },
  ],
  2: [
    { id: 1, from: 'me', text: "Sarah, we saw your profile and love your experience with Vinyasa.", time: '9:00 AM' },
    { id: 2, from: 'them', text: "Thank you! I have availability from September onwards.", time: '9:45 AM' },
  ],
  3: [
    { id: 1, from: 'them', text: "I heard your studio is interested in a Muay Thai instructor?", time: 'Yesterday' },
    { id: 2, from: 'me', text: "Yes! We've been wanting to add combat sports classes.", time: 'Yesterday' },
    { id: 3, from: 'them', text: "Happy to discuss the swap arrangement further!", time: 'Yesterday' },
  ],
};

export default function StudioMessages() {
  const [active, setActive] = useState(CONVERSATIONS[0]);
  const [msg, setMsg] = useState('');
  const [allMessages, setAllMessages] = useState(MESSAGES);

  const sendMessage = () => {
    if (!msg.trim()) return;
    setAllMessages(prev => ({
      ...prev,
      [active.id]: [...(prev[active.id] || []), { id: Date.now(), from: 'me', text: msg, time: 'Just now' }],
    }));
    setMsg('');
  };

  const messages = allMessages[active.id] || [];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="font-['Unbounded'] text-xl font-black text-[#3E3D38]">Messages</h1>
        <p className="text-[#9A9A94] text-sm mt-1">Connect with instructors</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E0D8] overflow-hidden" style={{ height: 'calc(100vh - 220px)', minHeight: '500px' }}>
        <div className="flex h-full">
          {/* Conversation list */}
          <div className="w-80 border-r border-[#E5E0D8] flex flex-col flex-shrink-0">
            <div className="p-3 border-b border-[#E5E0D8]">
              <div className="flex items-center gap-2 bg-[#FDFCF8] rounded-xl px-3 py-2 border border-[#E5E0D8]">
                <Search size={14} className="text-[#9A9A94]" />
                <input placeholder="Search messages..." className="flex-1 bg-transparent outline-none text-sm text-[#3E3D38] placeholder-[#C4BCB4]" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {CONVERSATIONS.map(c => (
                <button key={c.id} onClick={() => setActive(c)}
                  className={`w-full text-left px-4 py-3.5 flex items-center gap-3 transition-colors border-b border-[#E5E0D8]/50
                    ${active?.id === c.id ? 'bg-[#2DA4D6]/5' : 'hover:bg-[#FDFCF8]'}`}>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#CE4F56] to-[#E89560] flex items-center justify-center text-white text-xs font-bold font-['Unbounded'] flex-shrink-0">
                    {c.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-[#3E3D38] text-sm font-semibold truncate">{c.name}</p>
                      <span className="text-[#9A9A94] text-[10px] flex-shrink-0">{c.time}</span>
                    </div>
                    <p className="text-[#9A9A94] text-xs truncate">{c.lastMessage}</p>
                    <p className="text-[10px] text-[#C4BCB4] mt-0.5">{c.discipline}</p>
                  </div>
                  {c.unread > 0 && (
                    <span className="w-5 h-5 bg-[#2DA4D6] rounded-full text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                      {c.unread}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Chat area */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="px-5 py-4 border-b border-[#E5E0D8] flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#CE4F56] to-[#E89560] flex items-center justify-center text-white text-xs font-bold font-['Unbounded']">
                {active?.initials}
              </div>
              <div>
                <p className="text-[#3E3D38] text-sm font-semibold">{active?.name}</p>
                <p className="text-[#9A9A94] text-xs">{active?.discipline}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.map(m => (
                <div key={m.id} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs rounded-2xl px-4 py-3 text-sm
                    ${m.from === 'me'
                      ? 'bg-[#2DA4D6] text-white rounded-br-sm'
                      : 'bg-[#F4F0EA] text-[#3E3D38] rounded-bl-sm'}`}>
                    <p>{m.text}</p>
                    <p className={`text-[10px] mt-1 ${m.from === 'me' ? 'text-white/60' : 'text-[#9A9A94]'}`}>{m.time}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-[#E5E0D8] flex items-end gap-3">
              <input
                value={msg}
                onChange={e => setMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 bg-[#FDFCF8] border border-[#E5E0D8] rounded-xl px-4 py-3 text-sm text-[#3E3D38] placeholder-[#C4BCB4] focus:outline-none focus:border-[#2DA4D6] transition-all"
              />
              <button onClick={sendMessage}
                className="w-11 h-11 bg-[#2DA4D6] rounded-xl flex items-center justify-center text-white hover:bg-[#2590bd] transition-colors flex-shrink-0">
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
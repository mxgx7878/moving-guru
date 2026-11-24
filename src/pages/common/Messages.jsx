import Spinner from '../../components/feedback/Spinner';
import usePageLoading from '../../hooks/usePageLoading';
import PageHeader from '../../components/ui/PageHeader';
import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, Link } from "react-router-dom";
import { Search, Send, ArrowLeft } from "lucide-react";
import { ROLE_THEME } from "../../config/portalConfig";
import {
  fetchConversations,
  fetchMessages,
  sendMessage as sendMessageAction,
  createConversation,
  markConversationRead,
} from "../../store/actions/messageAction";
import {
  setActiveConversation,
  clearMessages,
  chatMessageReceived,
} from "../../store/slices/messageSlice";
import { STATUS } from "../../constants/apiConstants";
import { TableSkeleton } from "../../components/feedback";
import { ButtonLoader } from "../../components/feedback";
import { Avatar } from "../../components/ui";
import { getEcho } from "../../config/echo";
import { toast } from "sonner";
import MessageActionsMenu from "../../features/chat/MessageActionsMenu";
import ReportModal from "../../features/chat/ReportModal";

const formatStamp = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  if ((now - d) / 86400000 < 7) {
    return d.toLocaleDateString([], { weekday: "short" });
  }
  return d.toLocaleDateString([], { day: "numeric", month: "short" });
};

export default function Messages() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector((s) => s.auth);
  const [report, setReport] = useState(null);
  const myId = user?.user_id ?? user?.id;
  const { conversations, messages, status, messagesStatus, sendStatus } =
    useSelector((s) => s.message);
  const role = user?.role || "instructor";
  const theme = ROLE_THEME[role] || ROLE_THEME.instructor;

  const [activeId, setActiveId] = useState(null);
  const [msgText, setMsgText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileView, setMobileView] = useState("list");
  const [draftRecipient, setDraftRecipient] = useState(null);
  const [creating, setCreating] = useState(false);

  const scrollRef = useRef(null);
  const deepLinkRef = useRef(null);
  const retriedLinkRef = useRef(null);

  const activeConvo =
    !activeId && draftRecipient
      ? { id: null, participant: draftRecipient, isDraft: true }
      : conversations.find((c) => c.id === activeId) || null;
  const participant = activeConvo?.participant;
  const profilePath = participant?.role === 'studio'
    ? `/${role === 'studio' ? 'studio' : 'portal'}/studios/${participant.id}`
    : participant?.role === 'instructor'
      ? `/${role === 'studio' ? 'studio' : 'portal'}/instructors/${participant.id}`
      : null;
  const HeaderProfile = profilePath ? Link : 'div';
  const sending = sendStatus === STATUS.LOADING || creating;

  useEffect(() => {
    dispatch(fetchConversations());
    return () => {
      dispatch(setActiveConversation(null));
      dispatch(clearMessages());
    };
  }, [dispatch]);

  useEffect(() => {
    if ((location.state?.recipientId || location.state?.conversationId)
      && deepLinkRef.current !== location.key) return;
    if (draftRecipient) return;
    if (conversations.length > 0 && !activeId && window.innerWidth >= 768) {
      setActiveId(conversations[0].id);
    }
  }, [conversations, activeId, location.state, draftRecipient]);

  useEffect(() => {
    const { recipientId, conversationId } = location.state || {};
    if ((!recipientId && !conversationId) || deepLinkRef.current === location.key) return;
    if (status !== STATUS.SUCCEEDED) return;
    deepLinkRef.current = location.key;

    const existing = conversations.find((c) =>
      (conversationId && Number(c.id) === Number(conversationId)) ||
      (recipientId && Number(c.participant?.id) === Number(recipientId)),
    );
    if (existing) {
      setDraftRecipient(null);
      setActiveId(existing.id);
    } else if (conversationId) {
      if (retriedLinkRef.current !== location.key) {
        retriedLinkRef.current = location.key;
        dispatch(fetchConversations());
        deepLinkRef.current = null;
      } else {
        toast.error("Conversation could not be loaded. Please try again.");
      }
      return;
    } else if (recipientId) {
      dispatch(clearMessages());
      dispatch(setActiveConversation(null));
      setActiveId(null);
      setDraftRecipient({
        id: recipientId,
        name: location.state?.recipientName,
        avatarUrl: location.state?.recipientAvatar,
      });
    }
    setMobileView("chat");
  }, [location.key, location.state, conversations, status, dispatch]);

  useEffect(() => {
    if (!activeId) return;
    dispatch(clearMessages());
    dispatch(setActiveConversation(activeId));
    dispatch(fetchMessages(activeId));
  }, [activeId, dispatch]);

  useEffect(() => {
    const echo = getEcho();
    if (!echo || !activeId) return undefined;

    const channelName = `conversation.${activeId}`;
    echo.private(channelName).listen(".message.sent", (payload) => {
      const msg = payload?.message;
      if (!msg || msg.senderId === myId) return;
      dispatch(chatMessageReceived(payload));
      dispatch(markConversationRead(activeId));
    });

    return () => {
      echo.leave(channelName);
    };
  }, [activeId, myId, dispatch]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, activeId]);

  const handleOpenConvo = (convo) => {
    setDraftRecipient(null);
    setActiveId(convo.id);
    setMobileView("chat");
  };

  const handleBackToList = () => {
    setMobileView("list");
  };

  const convoDisplayName = (convo) => {
    const r = convo?.participant?.role;
    if (r === "admin") return "GURU";
    return convo?.participant?.name || "Unknown";
  };

  const handleSend = () => {
    const text = msgText.trim();
    if (!text || sending) return;
    if (!activeId && !draftRecipient) return;
    setMsgText("");

    if (activeId) {
      dispatch(sendMessageAction({ conversationId: activeId, text }));
      return;
    }

    setCreating(true);
    dispatch(
      createConversation({ recipientId: draftRecipient.id, message: text }),
    )
      .unwrap()
      .then((res) => {
        const newId = res?.data?.conversation?.id;
        if (newId) {
          setDraftRecipient(null);
          setActiveId(newId);
        }
      })
      .catch((err) => {
        setMsgText(text);
        toast.error(
          err?.message ||
            (typeof err === "string" ? err : "Failed to send message"),
        );
      })
      .finally(() => setCreating(false));
  };

  const filteredConversations = conversations.filter(
    (c) =>
      !searchQuery ||
      convoDisplayName(c).toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const subtitle =
    role === "studio"
      ? "Connect with instructors"
      : "Connect with studios and instructors";

  const pageLoading = usePageLoading(status);
  if (pageLoading) {
    return (
      <div className="max-w-5xl mx-auto">
        <PageHeader title="Messages" description={<> {subtitle} </>} className="mb-6" />
        <TableSkeleton rows={6} cols={3} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader title="Messages" description={<> {subtitle} </>} className="mb-6" />

      <div
        className="bg-white rounded-2xl border border-[#E5E0D8] overflow-hidden"
        style={{
          height: "min(calc(100dvh - 7rem), calc(100vh - 7rem))",
          minHeight: "420px",
        }}
      >
        <div className="flex h-full relative">
          <div
            className={`
              ${mobileView === "list" ? "flex" : "hidden"} md:flex
              w-full md:w-80 border-r border-[#E5E0D8] flex-col flex-shrink-0
            `}
          >
            

            <div className="p-3 border-b border-[#E5E0D8]">
              <div className="flex items-center gap-2 bg-[#FFFFFF] rounded-xl px-3 py-2 border border-[#E5E0D8]">
                <Search size={14} className="text-ink-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search messages..."
                  className="flex-1 bg-transparent border-none outline-none text-sm text-[#3E3D38] placeholder-ink-muted min-w-0"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 && (
                <div className="p-6 text-center">
                  <p className="text-ink-muted text-sm">No conversations yet</p>
                </div>
              )}
              {filteredConversations.map((convo) => (
                <button
                  key={convo.id}
                  onClick={() => handleOpenConvo(convo)}
                  className={`w-full text-left px-4 py-3.5 flex items-center gap-3 transition-colors border-b border-[#E5E0D8]/50
                    ${activeId === convo.id ? "bg-[#FAFEE0]" : "hover:bg-[#FAFEE0]/50"}`}
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
                      <span className="text-[10px] text-ink-muted flex-shrink-0">
                        {formatStamp(convo.lastMessageAt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <p className="text-xs text-ink-muted truncate">
                        {convo.lastMessage?.body || "No messages yet"}
                      </p>
                      {convo.unreadCount > 0 && (
                        <span className="flex-shrink-0 min-w-[18px] h-[18px] px-1.5 bg-[#B4FF5A] text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                          {convo.unreadCount > 9 ? "9+" : convo.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div
            className={`
              ${mobileView === "chat" ? "flex" : "hidden"} md:flex
              flex-1 flex-col min-w-0 absolute md:relative inset-0 md:inset-auto bg-white
              transition-transform duration-300 ease-out
              ${mobileView === "chat" ? "translate-x-0" : "translate-x-full md:translate-x-0"}
            `}
          >
            {activeConvo ? (
              <>
                <div className="px-4 sm:px-5 py-3 sm:py-3.5 border-b border-[#E5E0D8] flex items-center gap-3">
                  <button
                    onClick={handleBackToList}
                    className="md:hidden -ml-1 p-1.5 rounded-lg hover:bg-[#FFFFFF] transition-colors text-[#3E3D38] flex-shrink-0"
                    aria-label="Back to messages"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <HeaderProfile
                    {...(profilePath ? { to: profilePath } : {})}
                    className="flex items-center gap-3 min-w-0"
                  >
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
                        style={{ color: '#3D5E16' }}
                      >
                        {activeConvo.participant?.role === "admin"
                          ? "Moving Guru"
                          : activeConvo.participant?.role}
                      </p>
                    </div>
                  </HeaderProfile>
                </div>

                <div
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4"
                >
                  {activeId && messagesStatus === STATUS.LOADING ? (
                    <div className="h-full flex items-center justify-center">
                      <Spinner />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-ink-muted text-sm">
                        No messages yet — say hi!
                      </p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMine = msg.senderId === myId;
                      return (
                        <div
                          key={msg.id}
                          className={`group flex items-start gap-1.5 ${isMine ? "justify-end" : "justify-start"}`}
                        >
                          <div className="max-w-[80%] sm:max-w-[70%]">
                            <div
                              className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed
            ${
              isMine
                ? "text-black rounded-br-md"
                : "bg-[#F5FDA6]/40 text-[#3E3D38] rounded-bl-md border border-[#F5FDA6]"
            }`}
                              style={
                                isMine
                                  ? { backgroundColor: theme.accent }
                                  : undefined
                              }
                            >
                              {msg.body}
                            </div>
                            <p
                              className={`text-[10px] text-ink-muted mt-1 ${isMine ? "text-right" : ""}`}
                            >
                              {formatStamp(msg.createdAt)}
                            </p>
                          </div>

                          {!isMine && (
                            <div className="pt-1.5">
                              <MessageActionsMenu
                                onReportMessage={() =>
                                  setReport({
                                    type: "message",
                                    reportedUserId: msg.senderId,
                                    conversationId: activeId,
                                    messageId: msg.id,
                                  })
                                }
                                onReportProfile={() =>
                                  setReport({
                                    type: "profile",
                                    reportedUserId:
                                    activeConvo?.participant?.id,
                                    conversationId: activeId,
                                    messageId: null,
                                  })
                                }
                              />
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="p-3 sm:p-4 border-t border-[#E5E0D8] flex items-end gap-2 sm:gap-3">
                  <input
                    type="text"
                    value={msgText}
                    onChange={(e) => setMsgText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Type a message..."
                    className="flex-1 bg-[#FFFFFF] border border-[#E5E0D8] rounded-xl px-4 py-3 text-sm text-[#3E3D38] placeholder-ink-muted focus:outline-none transition-all min-w-0"
                    style={{ "--tw-ring-color": theme.accent }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={sending || !msgText.trim()}
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-black transition-colors flex-shrink-0 disabled:opacity-50"
                    style={{ backgroundColor: theme.accent }}
                  >
                    {sending ? <ButtonLoader size={16} color="#000" /> : <Send size={16} />}
                  </button>
                </div>
                {report && (
                  <ReportModal
                    type={report.type}
                    reportedUserId={report.reportedUserId}
                    conversationId={report.conversationId}
                    messageId={report.messageId}
                    onClose={() => setReport(null)}
                  />
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-6">
                <p className="text-ink-muted text-sm text-center">
                  Select a conversation to start messaging
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

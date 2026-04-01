import { useState, useRef, useEffect } from "react";
import { useInfiniteMessages } from "@/hooks/use-infinite-query";
import { useRealtimeMessages } from "@/hooks/useRealtimeMessages";
import { usePresence } from "@/hooks/usePresence";
import { sendDMMessage, markAsRead, supabase } from "@/lib/supabase/chat";
import MessageFeed from "@/components/chat/MessageFeed";
import MessageInput from "@/components/chat/MessageInput";
import { ChevronLeft } from "lucide-react";

interface DMChatWindowProps {
  conversationId: string;
  currentUser: {
    id: string;
    role: string;
    name: string;
    avatarUrl: string | null;
  };
  onBack: () => void;
}

export default function DMChatWindow({ conversationId, currentUser, onBack }: DMChatWindowProps) {
  const { messages, setMessages, isLoading, isFetchingNextPage, hasMore, fetchNextPage } = useInfiniteMessages(conversationId);
  useRealtimeMessages(conversationId, setMessages);

  const [conversationDetails, setConversationDetails] = useState<any>(null);
  const onlineUsers = usePresence(`presence_${conversationId}`, currentUser);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [showJumpToBottom, setShowJumpToBottom] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('conversations').select('*, student:student_id (id, user_details (first_name, last_name, avatar)), teacher:teacher_id (id, user_details (first_name, last_name, avatar)), course:class_id (name)').eq('id', conversationId).single();
      setConversationDetails(data);
    }
    load();
  }, [conversationId]);

  useEffect(() => {
    // Mark as read when messages load or conversation changes
    if (messages.length > 0) {
      markAsRead(conversationId, currentUser.id);
    }
  }, [messages.length, conversationId, currentUser.id]);

  useEffect(() => {
    // Focus & unread logic
    const handleFocus = () => markAsRead(conversationId, currentUser.id);
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [conversationId, currentUser.id]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;

    if (scrollHeight - scrollTop - clientHeight > 500) {
      setShowJumpToBottom(true);
    } else {
      setShowJumpToBottom(false);
      setUnreadCount(0);
    }

    if (scrollTop < 100 && hasMore && !isFetchingNextPage) {
      fetchNextPage(scrollRef);
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    setUnreadCount(0);
  };

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    const content = newMessage.trim();
    setNewMessage("");

    const tempId = `temp-${Date.now()}`;
    const tempMessage = {
      id: tempId,
      conversation_id: conversationId,
      sender_id: currentUser.id,
      sender_role: currentUser.role,
      sender_name: currentUser.name,
      sender_avatar_url: currentUser.avatarUrl,
      content,
      is_deleted: false,
      deleted_by: null,
      created_at: new Date().toISOString(),
      read_at: null
    };

    setMessages(prev => [...prev, tempMessage]);
    scrollToBottom();

    try {
      await sendDMMessage(conversationId, {
        senderId: currentUser.id,
        senderRole: currentUser.role,
        senderName: currentUser.name,
        senderAvatarUrl: currentUser.avatarUrl,
        content,
      });
      setMessages(prev => prev.filter(m => m.id !== tempId));
    } catch (err) {
      console.error("Failed to send", err);
      setMessages(prev => prev.filter(m => m.id !== tempId));
    }
  };

  if (!conversationDetails) return <div className="flex-1 flex items-center justify-center">Loading...</div>;

  const otherUser = conversationDetails.student_id === currentUser.id
    ? conversationDetails.teacher?.user_details
    : conversationDetails.student?.user_details;
  const displayName = otherUser ? `${otherUser.first_name} ${otherUser.last_name}` : "Unknown User";
  const isOnline = onlineUsers.some(u => u.user_id !== currentUser.id);

  // Determine last read message sent by me
  const mySentMessages = [...messages].reverse().filter(m => m.sender_id === currentUser.id);
  const lastReadMessage = mySentMessages.find(m => m.read_at !== null);

  return (
    <div className="flex flex-col flex-1 relative overflow-hidden h-full">
      <div className="flex items-center gap-4 p-4 border-b bg-card z-10 shadow-sm">
        <button onClick={onBack} className="md:hidden p-1.5 hover:bg-muted rounded-full transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold">{displayName}</h1>
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} title={isOnline ? 'Online' : 'Offline'} />
          </div>
          <span className="text-xs text-muted-foreground">{conversationDetails.course?.name || "Private Message"}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4" ref={scrollRef} onScroll={handleScroll}>
        {isLoading ? (
          <div className="flex justify-center p-4"><div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" /></div>
        ) : (
          <div className="flex flex-col gap-4">
            <MessageFeed
              messages={messages}
              currentUser={currentUser}
              isFetchingNextPage={isFetchingNextPage}
              hasMore={hasMore}
            />
            {lastReadMessage && (
              <div className="flex justify-end pr-2 -mt-3">
                <span className="text-[10px] text-primary/70 font-semibold flex items-center gap-1">
                  Seen <span className="text-blue-500">✓✓</span>
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {showJumpToBottom && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-24 right-8 bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium hover:bg-primary/90 transition-transform hover:scale-105"
        >
          {unreadCount > 0 ? `↓ ${unreadCount} New messages` : "↑ Jump to Latest"}
        </button>
      )}

      <div className="p-4 bg-background">
        <MessageInput value={newMessage} onChange={setNewMessage} onSend={handleSend} />
      </div>
    </div>
  );
}

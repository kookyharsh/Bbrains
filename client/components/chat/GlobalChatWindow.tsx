import { useState, useRef, useEffect } from "react";
import { useInfiniteMessages } from "@/hooks/use-infinite-query";
import { useRealtimeMessages } from "@/hooks/useRealtimeMessages";
import { usePresence } from "@/hooks/usePresence";
import { sendGlobalMessage } from "@/lib/supabase/chat";
import MessageFeed from "./MessageFeed";
import MessageInput from "./MessageInput";

interface GlobalChatWindowProps {
  currentUser: {
    id: string;
    name: string;
    role: string;
    avatarUrl: string | null;
  };
}

export default function GlobalChatWindow({ currentUser }: GlobalChatWindowProps) {
  const { messages, setMessages, isLoading, isFetchingNextPage, hasMore, fetchNextPage } = useInfiniteMessages(null);

  useRealtimeMessages(null, setMessages);
  const onlineUsers = usePresence("global_presence", currentUser);

  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showJumpToBottom, setShowJumpToBottom] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;

    // Jump to latest button visibility (scrolled more than 500px from bottom)
    if (scrollHeight - scrollTop - clientHeight > 500) {
      setShowJumpToBottom(true);
    } else {
      setShowJumpToBottom(false);
      setUnreadCount(0); // Clear unread count when scrolled to bottom
    }

    // Fetch older messages when near top
    if (scrollTop < 100 && hasMore && !isFetchingNextPage) {
      fetchNextPage(scrollRef);
    }
  };

  useEffect(() => {
    // Check if new message arrived and we are at the bottom
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;

    if (isAtBottom) {
      scrollToBottom();
    } else {
      // Not at bottom, check if new message is not sent by me
      const lastMsg = messages[messages.length - 1];
      if (lastMsg && lastMsg.sender_id !== currentUser.id) {
        setUnreadCount(prev => prev + 1);
      } else if (lastMsg && lastMsg.sender_id === currentUser.id) {
        scrollToBottom();
      }
    }
  }, [messages, currentUser.id]);

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

    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const tempMessage = {
      id: tempId,
      conversation_id: null,
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
      await sendGlobalMessage({
        senderId: currentUser.id,
        senderRole: currentUser.role,
        senderName: currentUser.name,
        senderAvatarUrl: currentUser.avatarUrl,
        content,
      });
      // the real message will come via realtime, we could optionally replace the temp message or wait for realtime to push it and just let standard array handle it (though we'd have duplicate if we don't handle tempIds).
      // For simplicity, wait for realtime and remove temp on success/failure, or just let realtime do the job and skip optimistic if it causes dupes.
      // Better yet, remove temp message when sending succeeds. Realtime will insert it.
      setMessages(prev => prev.filter(m => m.id !== tempId));
    } catch (err) {
      console.error("Failed to send", err);
      // Remove temp message
      setMessages(prev => prev.filter(m => m.id !== tempId));
    }
  };

  return (
    <div className="flex flex-col flex-1 relative overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b bg-card z-10 shadow-sm">
        <h1 className="text-xl font-bold"># School Chat</h1>
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          {onlineUsers.length} online
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4" ref={scrollRef} onScroll={handleScroll}>
        {isLoading ? (
          <div className="flex justify-center p-4"><div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" /></div>
        ) : (
          <MessageFeed
            messages={messages}
            currentUser={currentUser}
            isFetchingNextPage={isFetchingNextPage}
            hasMore={hasMore}
          />
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

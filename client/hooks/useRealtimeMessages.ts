import { useEffect } from "react";
import { supabase } from "@/lib/supabase/chat";

export function useRealtimeMessages(conversationId: string | null = null, setMessages: React.Dispatch<React.SetStateAction<any[]>>) {
  useEffect(() => {
    // If conversationId is null, listen to global chat.
    // Otherwise, listen to the specific conversation.
    const filter = conversationId === null ? "conversation_id=is.null" : `conversation_id=eq.${conversationId}`;

    const channel = supabase.channel(`messages_${conversationId || 'global'}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter },
        (payload) => {
          // New message - prepend it since our array is ordered oldest at top, newest at bottom,
          // wait, our array is [older, ..., newer], so new messages go to the end!
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages", filter },
        (payload) => {
          // Soft delete or mark as read
          setMessages((prev) => prev.map((msg) => msg.id === payload.new.id ? payload.new : msg));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, setMessages]);
}

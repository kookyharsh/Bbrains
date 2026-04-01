import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase/chat";

export function useInfiniteMessages(conversationId: string | null = null, pageSize = 100) {
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  const fetchMessages = useCallback(async (pageNum: number) => {
    let query = supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false }) // trailing query
      .range(pageNum * pageSize, (pageNum + 1) * pageSize - 1);

    if (conversationId === null) {
      query = query.is("conversation_id", null);
    } else {
      query = query.eq("conversation_id", conversationId);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Error fetching messages:", error);
      return [];
    }

    // Set hasMore if we got exactly pageSize
    setHasMore(data.length === pageSize);
    return data;
  }, [conversationId, pageSize]);

  useEffect(() => {
    let isMounted = true;

    async function loadInitial() {
      setIsLoading(true);
      const data = await fetchMessages(0);
      if (isMounted) {
        setMessages(data.reverse()); // Reverse array so oldest at top, newest at bottom
        setPage(0);
        setIsLoading(false);
      }
    }

    loadInitial();

    return () => { isMounted = false; };
  }, [fetchMessages]);

  const fetchNextPage = async (scrollRef: React.RefObject<HTMLElement>) => {
    if (!hasMore || isFetchingNextPage) return;

    setIsFetchingNextPage(true);
    const nextPage = page + 1;
    const data = await fetchMessages(nextPage);

    // If new data is empty, we reached the end
    if (data.length === 0) {
      setHasMore(false);
      setIsFetchingNextPage(false);
      return;
    }

    // Capture previous scroll height
    const prevHeight = scrollRef.current?.scrollHeight || 0;

    // Data is from new to old. We reverse it to be old to new, and prepend it.
    const olderMessages = data.reverse();
    setMessages(prev => [...olderMessages, ...prev]);
    setPage(nextPage);
    setIsFetchingNextPage(false);

    // Preserve scroll position (wait for next render)
    setTimeout(() => {
      if (scrollRef.current) {
        const newHeight = scrollRef.current.scrollHeight;
        scrollRef.current.scrollTop += (newHeight - prevHeight);
      }
    }, 0);
  };

  return { messages, setMessages, isLoading, isFetchingNextPage, hasMore, fetchNextPage };
}

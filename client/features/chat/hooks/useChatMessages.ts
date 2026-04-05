'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/services/supabase/client'
import { chatApi, dashboardApi, type ChatAttachment, type ChatMessageRecord } from '@/services/api/client'
import type { Message } from '@/features/chat/data'

export type ChatMessageDisplay = Message;

type ChatRealtimeMessage = {
    id: string
    user_id?: string
    userId?: string
    username?: string
    display_name?: string
    displayName?: string
    avatar?: string
    badge?: string
    badge_color?: string
    badgeColor?: string
    content: string
    created_at?: string
    createdAt?: string
    edited_at?: string | null
    editedAt?: string | null
    reply_to?: string | null
    replyTo?: string | null
    mentions?: string[]
    attachments?: ChatAttachment[]
}

const formatMessage = (msg: ChatMessageRecord | ChatRealtimeMessage): ChatMessageDisplay => {
    const createdAt = ('created_at' in msg ? msg.created_at : undefined) || msg.createdAt;
    const userId = ('user_id' in msg ? msg.user_id : undefined) || msg.userId;
    const displayName = ('display_name' in msg ? msg.display_name : undefined) || msg.displayName;
    const editedAt = ('edited_at' in msg ? msg.edited_at : undefined) || msg.editedAt;
    const replyTo = ('reply_to' in msg ? msg.reply_to : undefined) || msg.replyTo;
    const badgeColor = ('badge_color' in msg ? msg.badge_color : undefined) || msg.badgeColor;
    const date = new Date(createdAt);

    return {
        id: msg.id,
        user: {
            id: userId || "",
            username: msg.username || "",
            name: displayName || msg.username || "",
            avatar: msg.avatar,
            badge: msg.badge,
            badgeColor
        },
        content: msg.content,
        timestamp: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: date.toLocaleDateString(),
        createdAt: date.toISOString(),
        editedAt,
        replyTo,
        mentions: msg.mentions || [],
        attachments: msg.attachments || []
    }
}

const upsertMessage = (
    prev: ChatMessageDisplay[],
    nextMessage: ChatMessageDisplay
): ChatMessageDisplay[] => {
    const existingIndex = prev.findIndex((m) => m.id === nextMessage.id)
    const merged =
        existingIndex >= 0
            ? prev.map((m) => (m.id === nextMessage.id ? nextMessage : m))
            : [...prev, nextMessage]

    return merged.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
}

export function useChatMessages() {
    const [messages, setMessages] = useState<ChatMessageDisplay[]>([])
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [hasMore, setHasMore] = useState(true)
    const [isConnected, setIsConnected] = useState(false)
    const [currentUserId, setCurrentUserId] = useState<string>('')
    const [chatRoomId, setChatRoomId] = useState<string>('default')
    const [searchResults, setSearchResults] = useState<ChatMessageDisplay[]>([])
    const [isSearching, setIsSearching] = useState(false)

    const fetchMessages = useCallback(async () => {
        try {
            setLoading(true)
            const userResp = await dashboardApi.getUser()
            if (userResp.success && userResp.data) {
                setCurrentUserId(userResp.data.id)
                const collegeId = userResp.data.college?.id;
                if (collegeId) {
                    setChatRoomId(`global_${collegeId}`);
                }
            }

            const response = await chatApi.getMessages(undefined, 50)
            if (response.success && response.data) {
                const formatted = response.data
                    .map(formatMessage)
                    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                setMessages(formatted)
                setHasMore(formatted.length === 50)
            }
        } catch (error) {
            console.error('Failed to fetch messages:', error)
        } finally {
            setLoading(false)
        }
    }, [])

    const loadMore = useCallback(async () => {
        if (loadingMore || !hasMore || messages.length === 0) return;

        try {
            setLoadingMore(true);
            const oldestMessage = messages[0];
            const response = await chatApi.getMessages(undefined, 50, oldestMessage.createdAt);

            if (response.success && response.data) {
                const formatted = response.data.map(formatMessage);
                if (formatted.length > 0) {
                    setMessages(prev => {
                        let next = [...prev];
                        for (const message of formatted) {
                            next = upsertMessage(next, message);
                        }
                        return next;
                    });
                }
                setHasMore(formatted.length === 50);
            }
        } catch (error) {
            console.error('Failed to load older messages:', error);
        } finally {
            setLoadingMore(false);
        }
    }, [messages, loadingMore, hasMore]);

    const searchMessages = useCallback(async (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }
        
        try {
            setIsSearching(true);
            const response = await chatApi.searchMessages(query, 50);
            if (response.success && response.data) {
                const formatted = response.data.map(formatMessage);
                setSearchResults(formatted);
            }
        } catch (error) {
            console.error('Failed to search messages:', error);
        } finally {
            setIsSearching(false);
        }
    }, []);

    const sendMessage = async (content: string, attachments: ChatAttachment[] = [], mentions: string[] = [], replyToId?: string) => {
        try {
            const response = await chatApi.sendMessage(content, attachments, mentions, replyToId)
            if (!response.success || !response.data) {
                throw new Error(response.message || response.error || 'Failed to send message')
            }

            const newMessage = formatMessage(response.data)
            setMessages((prev) => upsertMessage(prev, newMessage))
            return response
        } catch (error) {
            console.error('Failed to send message:', error)
            throw error
        }
    }

    const deleteMessage = async (messageId: string) => {
        try {
            const response = await chatApi.deleteMessage(messageId)
            if (response.success) {
                setMessages(prev => prev.filter(m => m.id !== messageId))
            }
            return response
        } catch (error) {
            console.error('Failed to delete message:', error)
            throw error
        }
    }

    const editMessage = async (messageId: string, content: string, mentions: string[] = []) => {
        try {
            const response = await chatApi.editMessage(messageId, content, mentions)
            if (response.success && response.data) {
                const updated = formatMessage(response.data)
                setMessages((prev) => upsertMessage(prev, updated))
            }
            return response
        } catch (error) {
            console.error('Failed to edit message:', error)
            throw error
        }
    }

    useEffect(() => {
        fetchMessages()
    }, [fetchMessages])

    useEffect(() => {
        if (!chatRoomId) return;

        const channel = supabase
            .channel(`chat_room_${chatRoomId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'chat_messages',
                    filter: `chat_id=eq.${chatRoomId}`
                },
                (payload: { eventType: "INSERT" | "UPDATE" | "DELETE"; new: ChatRealtimeMessage; old: { id: string } }) => {
                    if (payload.eventType === 'INSERT') {
                        const inserted = formatMessage(payload.new)
                        setMessages((prev) => upsertMessage(prev, inserted))
                    } else if (payload.eventType === 'UPDATE') {
                        const updated = formatMessage(payload.new)
                        setMessages((prev) => upsertMessage(prev, updated))
                    } else if (payload.eventType === 'DELETE') {
                        setMessages(prev => prev.filter(m => m.id !== payload.old.id))
                    }
                }
            )
            .subscribe((status: string) => {
                setIsConnected(status === 'SUBSCRIBED')
            })

        return () => {
            supabase.removeChannel(channel)
        }
    }, [chatRoomId])

    return {
        messages,
        loading,
        loadingMore,
        hasMore,
        isConnected,
        currentUserId,
        sendMessage,
        deleteMessage,
        editMessage,
        refresh: fetchMessages,
        loadMore,
        searchMessages,
        searchResults,
        isSearching
    }
}

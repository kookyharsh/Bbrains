'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/services/supabase/client'
import { chatApi } from '@/services/api/client'
import type { Message } from '@/features/chat/data'

export type ChatMessageDisplay = Message;

const formatMessage = (msg: any): ChatMessageDisplay => {
    const date = new Date(msg.created_at || msg.createdAt);
    return {
        id: msg.id,
        user: {
            id: msg.user_id || msg.userId,
            username: msg.username,
            name: msg.display_name || msg.displayName || msg.username,
            avatar: msg.avatar,
            badge: msg.badge,
            badgeColor: msg.badge_color || msg.badgeColor
        },
        content: msg.content,
        timestamp: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: date.toLocaleDateString(),
        createdAt: date.toISOString(),
        editedAt: msg.edited_at || msg.editedAt,
        replyTo: msg.reply_to || msg.replyTo,
        mentions: msg.mentions || [],
        attachments: msg.attachments || []
    }
}

export function useChatMessages() {
    const [messages, setMessages] = useState<ChatMessageDisplay[]>([])
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [hasMore, setHasMore] = useState(true)
    const [isConnected, setIsConnected] = useState(false)
    const [currentUserId, setCurrentUserId] = useState<string>('')

    const fetchMessages = useCallback(async () => {
        try {
            setLoading(true)
            const { data: user } = await supabase.auth.getUser()
            if (user?.user) {
                setCurrentUserId(user.user.id)
            }

            const response = await chatApi.getMessages(undefined, 50)
            if (response.success && response.data) {
                const formatted = response.data.map(formatMessage)
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
                    setMessages(prev => [...formatted, ...prev]);
                }
                setHasMore(formatted.length === 50);
            }
        } catch (error) {
            console.error('Failed to load older messages:', error);
        } finally {
            setLoadingMore(false);
        }
    }, [messages, loadingMore, hasMore]);

    const sendMessage = async (content: string, attachments: any[] = [], mentions: string[] = [], replyToId?: string) => {
        try {
            const response = await chatApi.sendMessage(content, attachments, mentions, replyToId)
            if (response.success && response.data) {
                // Optimistic update or wait for real-time?
                // For now, let's let real-time handle it or manual fetch if needed
            }
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
                setMessages(prev => prev.map(m => m.id === messageId ? updated : m))
            }
            return response
        } catch (error) {
            console.error('Failed to edit message:', error)
            throw error
        }
    }

    useEffect(() => {
        fetchMessages()

        const channel = supabase
            .channel('chat_room')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'chat_messages'
                },
                (payload: any) => {
                    if (payload.eventType === 'INSERT') {
                        setMessages(prev => [...prev, formatMessage(payload.new)])
                    } else if (payload.eventType === 'UPDATE') {
                        setMessages(prev => prev.map(m => m.id === payload.new.id ? formatMessage(payload.new) : m))
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
    }, [fetchMessages])

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
        loadMore
    }
}

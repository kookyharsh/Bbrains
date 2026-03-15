'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { chatApi } from '@/lib/api-services'
import type { Message } from '@/app/(dashboard)/chat/data'

const formatMessage = (msg: any): Message => {
    const date = new Date(msg.created_at || msg.createdAt);
    return {
        id: msg.id,
        user: {
            id: msg.user_id || msg.userId,
            username: msg.username || 'unknown',
            name: msg.display_name || msg.displayName || msg.username || 'Unknown',
            avatar: msg.avatar || '',
            badge: msg.role === 'admin' ? 'Admin' : msg.role === 'teacher' ? 'Teacher' : undefined,
            badgeColor: msg.role === 'admin' ? 'bg-red-500' : msg.role === 'teacher' ? 'bg-blue-500' : undefined
        },
        content: msg.content,
        timestamp: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: date.toLocaleDateString(),
        createdAt: msg.created_at || msg.createdAt,
        editedAt: (msg.updated_at || msg.updatedAt) !== (msg.created_at || msg.createdAt) ? (msg.updated_at || msg.updatedAt) : null,
        mentions: msg.mentions || [],
        attachments: msg.attachments || [],
        replyTo: (msg.reply_to || msg.replyToMessageId) ? {
            messageId: msg.reply_to || msg.replyToMessageId,
            username: 'someone',
            content: '...'
        } : null
    };
};

export function useChatMessages() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const [isConnected, setIsConnected] = useState(false)
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null)

  const fetchMessages = useCallback(async () => {
    try {
      const response = await chatApi.getMessages()
      if (response.success && response.data) {
        const formattedMessages = response.data.map(formatMessage)
        setMessages(formattedMessages)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setCurrentUserId(user.id)
        
        // Get profile for denormalized inserts
        const profileResponse = await chatApi.getMyProfile()
        if (profileResponse.success) {
            setCurrentUserProfile(profileResponse.data)
        }

        const channel = supabase
          .channel('global-chat')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'chat_messages'
            },
            (payload) => {
              if (payload.eventType === 'INSERT') {
                setMessages(prev => {
                  if (prev.find(m => m.id === payload.new.id)) return prev;
                  return [...prev, formatMessage(payload.new)]
                })
              } else if (payload.eventType === 'UPDATE') {
                setMessages(prev => prev.map(m => m.id === payload.new.id ? formatMessage(payload.new) : m))
              } else if (payload.eventType === 'DELETE') {
                setMessages(prev => prev.filter(m => m.id !== payload.old.id))
              }
            }
          )
          .subscribe((status) => {
            setIsConnected(status === 'SUBSCRIBED')
          })

        return () => {
          supabase.removeChannel(channel)
        }
      }
    }

    setupRealtime()
  }, [])

  useEffect(() => {
    if (currentUserId) {
      fetchMessages()
    }
  }, [currentUserId, fetchMessages])

  const sendMessage = useCallback(async (
    content: string,
    attachments?: { url: string; type: string; name?: string }[],
    mentions?: string[],
    replyToId?: string
  ) => {
    try {
      const response = await chatApi.sendMessage({
        content,
        attachments,
        mentions,
        replyTo: replyToId,
        chatId: 'default'
      })

      if (!response.success) {
        console.error('Error sending message:', response.message)
      }
    } catch (err) {
      console.error('Error sending message (exception):', err)
    }
  }, [])

  const deleteMessage = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting message:', error)
      }
    } catch (err) {
      console.error('Error deleting message (exception):', err)
    }
  }, [])

  const editMessage = useCallback(async (id: string, content: string, mentions?: string[]) => {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({
          content,
          mentions: mentions || [],
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) {
        console.error('Error editing message:', error)
      }
    } catch (err) {
      console.error('Error editing message (exception):', err)
    }
  }, [])

  return {
    messages,
    loading,
    currentUserId,
    isConnected,
    sendMessage,
    deleteMessage,
    editMessage
  }
}

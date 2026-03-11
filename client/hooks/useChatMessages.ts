'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { createClient } from '@/lib/client'

export interface ChatMessageDisplay {
  id: string
  content: string
  userId: string
  username: string
  displayName: string
  avatar: string
  timestamp: Date
  mentions?: string[]
  isOwn: boolean
  replyToId?: string | null
}

interface ChatMessageRow {
  id: string
  content: string
  user_id: string
  created_at: string
  mentions: string[] | null
  reply_to_id: string | null
}

export function useChatMessages() {
  const [messages, setMessages] = useState<ChatMessageDisplay[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string>('')

  const browserClient = createClient()

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await browserClient.auth.getUser()
      if (user) {
        setCurrentUserId(user.id)
      }
    }
    getCurrentUser()
  }, [browserClient])

  const fetchMessages = useCallback(async () => {
    const { data: msgData, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(100)

    if (error) {
      console.error('Error fetching messages:', error)
      setLoading(false)
      return
    }

    const messages = msgData as ChatMessageRow[]
    
    const userIds = [...new Set(messages.map(m => m.user_id))]
    
    const { data: userData } = await supabase
      .from('user')
      .select('user_id, username, type')
      .in('user_id', userIds)

    const { data: detailsData } = await supabase
      .from('user_details')
      .select('user_id, first_name, last_name, avatar')
      .in('user_id', userIds)

    const userMap = new Map()
    userData?.forEach(u => {
      userMap.set(u.user_id, u)
    })

    const detailsMap = new Map()
    detailsData?.forEach(d => {
      detailsMap.set(d.user_id, d)
    })

    const formattedMessages: ChatMessageDisplay[] = messages.map(msg => {
      const user = userMap.get(msg.user_id)
      const details = detailsMap.get(msg.user_id)
      
      const firstName = details?.first_name || ''
      const lastName = details?.last_name || ''
      const displayName = `${firstName} ${lastName}`.trim() || user?.username || 'Unknown'
      
      return {
        id: msg.id,
        content: msg.content,
        userId: msg.user_id,
        username: user?.username || 'unknown',
        displayName,
        avatar: details?.avatar || displayName.charAt(0).toUpperCase(),
        timestamp: new Date(msg.created_at),
        mentions: msg.mentions || undefined,
        isOwn: msg.user_id === currentUserId,
        replyToId: msg.reply_to_id || null
      }
    })

    setMessages(formattedMessages)
    setLoading(false)
  }, [currentUserId])

  useEffect(() => {
    fetchMessages()

    const channel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          console.log('Message change received:', payload)
          fetchMessages()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchMessages])

  const sendMessage = useCallback(async (content: string, mentions?: string[], replyToId?: string) => {
    if (!currentUserId) {
      console.error('No current user ID')
      return
    }

    const { error } = await supabase
      .from('messages')
      .insert({
        content,
        user_id: currentUserId,
        mentions: mentions || null,
        reply_to_id: replyToId || null
      })

    if (error) {
      console.error('Error sending message:', error)
    } else {
      fetchMessages()
    }
  }, [currentUserId, fetchMessages])

  const deleteMessage = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting message:', error)
    } else {
      fetchMessages()
    }
  }, [fetchMessages])

  const editMessage = useCallback(async (id: string, content: string, mentions?: string[]) => {
    const { error } = await supabase
      .from('messages')
      .update({
        content,
        mentions: mentions || null
      })
      .eq('id', id)

    if (error) {
      console.error('Error editing message:', error)
    } else {
      fetchMessages()
    }
  }, [fetchMessages])

  return {
    messages,
    loading,
    currentUserId,
    sendMessage,
    deleteMessage,
    editMessage
  }
}

"use client"

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react"
import { useChatMessages, type ChatMessageDisplay } from "@/hooks/useChatMessages"
import { supabase } from "@/integrations/supabase/client"

interface NotificationContextType {
    unreadCount: number
    mentions: ChatMessageDisplay[]
    markAsRead: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

const LAST_READ_KEY = "bbrains_chat_last_read"

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const { messages, currentUserId } = useChatMessages()
    const [currentUsername, setCurrentUsername] = useState<string | null>(null)
    const [lastReadTimestamp, setLastReadTimestamp] = useState<number>(() => {
        if (typeof window !== "undefined") {
            return parseInt(localStorage.getItem(LAST_READ_KEY) || "0")
        }
        return 0
    })

    // Fetch current user's username
    useEffect(() => {
        if (currentUserId) {
            const fetchUsername = async () => {
                const { data } = await supabase
                    .from("user")
                    .select("username")
                    .eq("user_id", currentUserId)
                    .single()
                if (data) setCurrentUsername(data.username)
            }
            fetchUsername()
        }
    }, [currentUserId])

    const unreadNotifications = useMemo(() => {
        if (!currentUsername || !currentUserId) return []

        return messages.filter((msg) => {
            // Only count if it's newer than the last time we "read"
            const msgTime = new Date(msg.timestamp).getTime()
            if (msgTime <= lastReadTimestamp) return false

            // Don't notify for own messages
            if (msg.userId === currentUserId) return false

            // Is it a mention?
            const isMention = msg.mentions?.some(
                (m) => m.toLowerCase() === currentUsername.toLowerCase()
            )

            // Is it a reply to me?
            // To be precise, we'd need to check if msg.replyToId points to one of our messages.
            // useChatMessages doesn't return the full tree, but we can check if the message 
            // has a replyToId and if we can find that message in our local list and if it's ours.
            let isReplyToMe = false
            if (msg.replyToId) {
                const originalMsg = messages.find(m => m.id === msg.replyToId)
                if (originalMsg && originalMsg.userId === currentUserId) {
                    isReplyToMe = true
                }
            }

            return isMention || isReplyToMe
        })
    }, [messages, currentUsername, currentUserId, lastReadTimestamp])

    const markAsRead = useCallback(() => {
        const now = Date.now()
        setLastReadTimestamp(now)
        if (typeof window !== "undefined") {
            localStorage.setItem(LAST_READ_KEY, now.toString())
        }
    }, [])

    return (
        <NotificationContext.Provider
            value={{
                unreadCount: unreadNotifications.length,
                mentions: unreadNotifications,
                markAsRead,
            }}
        >
            {children}
        </NotificationContext.Provider>
    )
}

export function useNotifications() {
    const context = useContext(NotificationContext)
    if (context === undefined) {
        throw new Error("useNotifications must be used within a NotificationProvider")
    }
    return context
}

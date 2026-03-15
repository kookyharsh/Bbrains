"use client"

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react"
import { notificationApi, Notification } from "@/lib/api-services"
import { supabase } from "@/integrations/supabase/client"

interface NotificationContextType {
    notifications: Notification[]
    unreadCount: number
    loading: boolean
    fetchNotifications: () => Promise<void>
    markRead: (id: number) => Promise<void>
    markAllRead: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(false)

    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true)
            const res = await notificationApi.getNotifications()
            if (res.success && res.data) {
                setNotifications(res.data.notifications)
                setUnreadCount(res.data.unreadCount)
            }
        } catch (error) {
            console.error("Failed to fetch notifications:", error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchNotifications()

        // Set up real-time subscription for new notifications
        const channel = supabase
            .channel('public:notification')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notification'
                },
                (payload) => {
                    // Check if the notification is for the current user
                    // We need the current user ID here. 
                    // For now, let's just re-fetch to be safe and simple
                    fetchNotifications()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [fetchNotifications])

    const markRead = useCallback(async (id: number) => {
        try {
            await notificationApi.markRead(id)
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, readAt: new Date().toISOString() } : n))
            setUnreadCount(prev => Math.max(0, prev - 1))
        } catch (error) {
            console.error("Failed to mark notification as read:", error)
        }
    }, [])

    const markAllRead = useCallback(async () => {
        try {
            await notificationApi.markAllRead()
            setNotifications(prev => prev.map(n => ({ ...n, readAt: new Date().toISOString() })))
            setUnreadCount(0)
        } catch (error) {
            console.error("Failed to mark all as read:", error)
        }
    }, [])

    const value = useMemo(() => ({
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markRead,
        markAllRead
    }), [notifications, unreadCount, loading, fetchNotifications, markRead, markAllRead])

    return (
        <NotificationContext.Provider value={value}>
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

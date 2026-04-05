"use client"

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react"
import { notificationApi, Notification } from "@/services/api/client"

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
        } catch {
            // Silently handle network errors
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        void fetchNotifications()

        const interval = window.setInterval(() => {
            void fetchNotifications()
        }, 30000)

        const handleWindowFocus = () => {
            void fetchNotifications()
        }

        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                void fetchNotifications()
            }
        }

        window.addEventListener("focus", handleWindowFocus)
        document.addEventListener("visibilitychange", handleVisibilityChange)

        return () => {
            window.clearInterval(interval)
            window.removeEventListener("focus", handleWindowFocus)
            document.removeEventListener("visibilitychange", handleVisibilityChange)
        }
    }, [fetchNotifications])

    const markRead = useCallback(async (id: number) => {
        try {
            const response = await notificationApi.markRead(id)
            if (!response.success) {
                return
            }

            setNotifications(prev => prev.map(n => n.id === id ? { ...n, readAt: new Date().toISOString() } : n))
            setUnreadCount(prev => Math.max(0, prev - 1))
        } catch {
            // Silently handle network errors
        }
    }, [])

    const markAllRead = useCallback(async () => {
        try {
            const response = await notificationApi.markAllRead()
            if (!response.success) {
                return
            }

            setNotifications(prev => prev.map(n => ({ ...n, readAt: new Date().toISOString() })))
            setUnreadCount(0)
        } catch {
            // Silently handle network errors
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

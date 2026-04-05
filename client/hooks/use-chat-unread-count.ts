"use client"

import { useCallback, useEffect, useState } from "react"
import { chatApi } from "@/services/api/client"

const CHAT_LAST_SEEN_EVENT = "chat-last-seen-updated"

function getStorageKey(userId: string) {
  return `chat:last-seen:${userId}`
}

function readStoredChatLastSeen(userId: string) {
  if (typeof window === "undefined" || !userId) return null
  return window.localStorage.getItem(getStorageKey(userId))
}

export function markChatSeen(userId: string, timestamp?: string) {
  if (typeof window === "undefined" || !userId) return

  const nextTimestamp = timestamp ?? new Date().toISOString()
  window.localStorage.setItem(getStorageKey(userId), nextTimestamp)
  window.dispatchEvent(
    new CustomEvent(CHAT_LAST_SEEN_EVENT, {
      detail: { userId, timestamp: nextTimestamp },
    })
  )
}

export function useChatUnreadCount(userId?: string | null, isChatActive = false) {
  const normalizedUserId = String(userId ?? "").trim()
  const [unreadCount, setUnreadCount] = useState(0)

  const refreshUnreadCount = useCallback(async () => {
    if (!normalizedUserId) {
      setUnreadCount(0)
      return
    }

    if (isChatActive) {
      markChatSeen(normalizedUserId)
      setUnreadCount(0)
      return
    }

    try {
      const response = await chatApi.getMessages(undefined, 100)
      if (!response.success || !response.data) return

      const lastSeenAt = readStoredChatLastSeen(normalizedUserId)
      if (!lastSeenAt) {
        const latestTimestamp = response.data.at(-1)?.createdAt ?? new Date().toISOString()
        markChatSeen(normalizedUserId, latestTimestamp)
        setUnreadCount(0)
        return
      }

      const lastSeenMs = new Date(lastSeenAt).getTime()
      if (!Number.isFinite(lastSeenMs)) {
        markChatSeen(normalizedUserId)
        setUnreadCount(0)
        return
      }

      const nextUnreadCount = response.data.filter((message) => {
        const messageCreatedAtMs = new Date(message.createdAt).getTime()
        return message.userId !== normalizedUserId && messageCreatedAtMs > lastSeenMs
      }).length

      setUnreadCount(nextUnreadCount)
    } catch {
      // Keep the current badge count when polling fails.
    }
  }, [isChatActive, normalizedUserId])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void refreshUnreadCount()
    }, 0)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [refreshUnreadCount])

  useEffect(() => {
    if (!normalizedUserId) return

    const interval = window.setInterval(() => {
      void refreshUnreadCount()
    }, 30000)

    const handleWindowFocus = () => {
      void refreshUnreadCount()
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void refreshUnreadCount()
      }
    }

    const handleChatLastSeenUpdated = (event: Event) => {
      const detail = (event as CustomEvent<{ userId?: string }>).detail
      if (detail?.userId === normalizedUserId) {
        void refreshUnreadCount()
      }
    }

    window.addEventListener("focus", handleWindowFocus)
    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener(CHAT_LAST_SEEN_EVENT, handleChatLastSeenUpdated as EventListener)

    return () => {
      window.clearInterval(interval)
      window.removeEventListener("focus", handleWindowFocus)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener(CHAT_LAST_SEEN_EVENT, handleChatLastSeenUpdated as EventListener)
    }
  }, [normalizedUserId, refreshUnreadCount])

  return { unreadCount, refreshUnreadCount }
}

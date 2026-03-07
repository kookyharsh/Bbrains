"use client"

import React, { useState, useCallback, useMemo, useRef, useEffect } from "react"
import { useAuth } from "@clerk/nextjs"
import { Loader2 } from "lucide-react"
import { io, Socket } from "socket.io-client"
import { getAuthedClient } from "@/lib/http"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import type { Message, ApiMessage, ApiMember } from "./data"
import { CHANNEL_NAME, API_BASE_URL } from "./data"
import { mapApiMessage, mapApiMember, groupMessagesByDate } from "./utils"
import { ChannelHeader } from "./_components/ChannelHeader"
import { MessageItem } from "./_components/MessageItem"
import { MessageInput } from "./_components/MessageInput"
import { DateSeparator } from "./_components/ChatPirmitives"
import { ProfileDialog } from "./_components/ProfileDialog"
import { Memberssidebar } from "./_components/Memberssidebar"

export default function ChatPage() {
    const { getToken, userId } = useAuth()
    const bottomRef = useRef<HTMLDivElement>(null)
    const socketRef = useRef<Socket | null>(null)

    const [messages, setMessages] = useState<Message[]>([])
    const [rawMembers, setRawMembers] = useState<ApiMember[]>([])
    const [myProfile, setMyProfile] = useState<ApiMember | null>(null)
    const [activeUserIds, setActiveUserIds] = useState<string[]>([])
    const [loading, setLoading] = useState(true)

    const [message, setMessage] = useState("")
    const [showMembers, setShowMembers] = useState(true)
    const [replyingMessage, setReplyingMessage] = useState<Message | null>(null)
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
    const [selectedProfileUserId, setSelectedProfileUserId] = useState<string | null>(null)
    const [profileOpen, setProfileOpen] = useState(false)

    useEffect(() => {
        if (!getToken) return
        let isMounted = true

        const loadData = async () => {
            try {
                const client = await getAuthedClient(getToken)
                const [msgRes, memRes, meRes] = await Promise.all([
                    client.get<{ success: boolean; data: ApiMessage[] }>("/chat/messages"),
                    client.get<{ success: boolean; data: ApiMember[] }>("/chat/members"),
                    client.get<{ success: boolean; data: ApiMember }>("/chat/me"),
                ])

                if (!isMounted) return

                if (msgRes.data.success) setMessages(msgRes.data.data.map(mapApiMessage))
                if (memRes.data.success) setRawMembers(memRes.data.data)
                if (meRes.data.success) setMyProfile(meRes.data.data)
                setLoading(false)
            } catch (error) {
                console.error("Failed to load chat data", error)
                if (isMounted) setLoading(false)
            }
        }

        loadData()
        return () => {
            isMounted = false
        }
    }, [getToken])

    useEffect(() => {
        if (!userId) return

        const s = io(API_BASE_URL, {
            withCredentials: true,
            path: "/socket.io",
            transports: ["polling", "websocket"],
        })

        s.on("connect", () => s.emit("chat:join", { userId }))
        s.on("connect_error", (error) => {
            console.error("chat socket connect_error:", error.message)
        })

        s.on("chat:presence", (activeUsers: Array<{ userId: string | number }>) => {
            setActiveUserIds(activeUsers.map((u) => String(u.userId)))
        })

        s.on("chat:new", (msg: ApiMessage) => {
            setMessages((prev) => [...prev, mapApiMessage(msg)])
        })

        s.on("chat:edited", (msg: ApiMessage) => {
            setMessages((prev) => prev.map((m) => (m.id === msg._id ? mapApiMessage(msg) : m)))
        })

        s.on("chat:deleted", (payload: { messageId: string }) => {
            setMessages((prev) => prev.filter((m) => m.id !== payload.messageId))
            setPendingDeleteId((prev) => (prev === payload.messageId ? null : prev))
        })

        socketRef.current = s
        return () => {
            s.disconnect()
        }
    }, [userId])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const liveMembers = useMemo(
        () => rawMembers.map((m) => mapApiMember(m, activeUserIds)),
        [rawMembers, activeUserIds]
    )

    const groupedMessages = useMemo(() => groupMessagesByDate(messages), [messages])

    const membersById = useMemo(() => {
        return new Map(liveMembers.map((member) => [member.id, member]))
    }, [liveMembers])

    const currentUsername =
        myProfile?.username ??
        (!userId ? null : rawMembers.find((m) => String(m.userId) === String(userId))?.username ?? null)

    const selectedProfile = useMemo(() => {
        if (!selectedProfileUserId) return null
        return membersById.get(selectedProfileUserId) ?? null
    }, [membersById, selectedProfileUserId])

    const handleSend = useCallback(() => {
        if (!message.trim() || !socketRef.current) return

        if (editingMessageId) {
            socketRef.current.emit("chat:edit", { messageId: editingMessageId, content: message })
            setEditingMessageId(null)
            setMessage("")
            return
        }

        socketRef.current.emit("chat:send", {
            content: message,
            replyToMessageId: replyingMessage?.id,
        })

        setMessage("")
        setReplyingMessage(null)
    }, [editingMessageId, message, replyingMessage])

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSend()
            }
        },
        [handleSend]
    )

    const handleEmojiSelect = useCallback(
        (emoji: { emoji: string }) => setMessage((prev) => prev + emoji.emoji),
        []
    )

    const handleCopy = useCallback(async (content: string) => {
        try {
            await navigator.clipboard.writeText(content)
        } catch (error) {
            console.error("Failed to copy message", error)
        }
    }, [])

    const handleDeleteRequest = useCallback((messageId: string, withShift: boolean) => {
        if (withShift) {
            socketRef.current?.emit("chat:delete", { messageId })
            return
        }
        setPendingDeleteId(messageId)
    }, [])

    const confirmDelete = useCallback(() => {
        if (!pendingDeleteId) return
        socketRef.current?.emit("chat:delete", { messageId: pendingDeleteId })
        setPendingDeleteId(null)
    }, [pendingDeleteId])

    const handleOpenProfile = useCallback((targetUserId: string) => {
        setSelectedProfileUserId(targetUserId)
        setProfileOpen(true)
    }, [])

    const toggleMembers = useCallback(() => setShowMembers((v) => !v), [])

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="size-8 animate-spin text-muted-foreground/50" />
            </div>
        )
    }

    return (
        <>
            <div className="relative -m-4 flex h-[calc(100%+2rem)] w-[calc(100%+2rem)] overflow-hidden bg-background md:-m-6 md:h-[calc(100%+3rem)] md:w-[calc(100%+3rem)]">
                <div className="flex flex-1 flex-col overflow-hidden bg-transparent">
                    <ChannelHeader
                        channelName={CHANNEL_NAME}
                        showMembers={showMembers}
                        onToggleMembers={toggleMembers}
                    />

                    <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-6 pb-20 space-y-6 bg-ui-light-bg dark:bg-ui-dark-bg scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                        {messages.length === 0 ? (
                            <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                                <p>No messages yet.</p>
                                <p className="text-xs">Be the first to say hello!</p>
                            </div>
                        ) : (
                            Array.from(groupedMessages.entries()).map(([date, msgs]) => (
                                <React.Fragment key={date}>
                                    <DateSeparator date={date} />
                                    {msgs.map((msg) => (
                                        <MessageItem
                                            key={msg.id}
                                            msg={msg}
                                            currentUserId={userId}
                                            currentUsername={currentUsername}
                                            onReply={(messageToReply) => {
                                                setReplyingMessage(messageToReply)
                                                setEditingMessageId(null)
                                            }}
                                            onCopy={handleCopy}
                                            onEdit={(messageToEdit) => {
                                                setEditingMessageId(messageToEdit.id)
                                                setReplyingMessage(null)
                                                setMessage(messageToEdit.content)
                                            }}
                                            onDelete={handleDeleteRequest}
                                            onOpenProfile={handleOpenProfile}
                                        />
                                    ))}
                                </React.Fragment>
                            ))
                        )}
                        <div ref={bottomRef} />
                    </div>

                    <MessageInput
                        message={message}
                        channelName={CHANNEL_NAME}
                        members={liveMembers}
                        editingMessageId={editingMessageId}
                        replyingMessage={replyingMessage}
                        onChange={setMessage}
                        onSend={handleSend}
                        onKeyDown={handleKeyDown}
                        onEmojiSelect={handleEmojiSelect}
                        onCancelEdit={() => {
                            setEditingMessageId(null)
                            setMessage("")
                        }}
                        onCancelReply={() => setReplyingMessage(null)}
                    />
                </div>

                {showMembers && (
                    <Memberssidebar
                        members={liveMembers}
                        onClose={() => setShowMembers(false)}
                        onOpenProfile={handleOpenProfile}
                    />
                )}
            </div>

            <AlertDialog open={Boolean(pendingDeleteId)} onOpenChange={(open) => !open && setPendingDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete message?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this message?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <ProfileDialog
                open={profileOpen}
                onOpenChange={setProfileOpen}
                member={selectedProfile}
            />
        </>
    )
}

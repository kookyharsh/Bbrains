"use client"

import React, { useState, useCallback, useMemo, useRef, useEffect } from "react"
import { useUser, useAuth } from "@clerk/nextjs"
import { SerializedEditorState } from "lexical"
import axios from "axios"
import { getAuthedClient } from "@/lib/http"

import type { Announcement, AnnouncementFromAPI } from "./data"
import { mapApiToAnnouncement, groupByDate } from "./utils"
import { AnnouncementsHeader } from "./_components/AnnouncementsHeader"
import { AnnouncementsFeed } from "./_components/AnnouncementsFeed"
import { PostEditor } from "./_components/PostEditor"

export default function AnnouncementsPage() {
    const { user } = useUser()
    const { getToken } = useAuth()
    const bottomRef = useRef<HTMLDivElement>(null!)

    // ── Data state ──
    const [announcements, setAnnouncements] = useState<Announcement[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // ── UI state ──
    const [searchQuery, setSearchQuery] = useState("")
    const [postTitle, setPostTitle] = useState("")
    const [editorState, setEditorState] = useState<SerializedEditorState | null>(null)
    const [posting, setPosting] = useState(false)

    const userRole = (user?.publicMetadata?.role as string) ?? "student"
    const canPost = userRole === "admin" || userRole === "teacher"

    // ── Fetch announcements ──
    useEffect(() => {
        async function fetchAnnouncements() {
            try {
                setLoading(true)
                const client = await getAuthedClient(getToken)
                const res = await client.get<{ success: boolean; data: AnnouncementFromAPI[] }>("/announcements")
                setAnnouncements(res.data.data.map(mapApiToAnnouncement))
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load announcements")
            } finally {
                setLoading(false)
            }
        }
        fetchAnnouncements()
    }, [getToken])

    // ── Auto-scroll on mount ──
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [])

    // ── Post handler ──
    const handlePostAnnouncement = useCallback(async () => {
        const trimmedTitle = postTitle.trim()
        if (!trimmedTitle) return
        try {
            setPosting(true)
            setError(null)
            let description = ""
            if (editorState) {
                const root = editorState.root
                if (root && "children" in root) {
                    description = (root.children as Array<{ children?: Array<{ text?: string }> }>)
                        .map((p) => p.children?.map((c) => c.text || "").join("") || "")
                        .join("\n")
                }
            }
            const client = await getAuthedClient(getToken)
            const res = await client.post<{ success: boolean; data: AnnouncementFromAPI }>(
                "/announcements",
                { title: trimmedTitle, description }
            )
            setAnnouncements((prev) => [mapApiToAnnouncement(res.data.data), ...prev])
            setPostTitle("")
            setEditorState(null)
        } catch (err) {
            console.error("Failed to post announcement:", err)
            const message = axios.isAxiosError(err)
                ? (err.response?.data?.message ?? err.message)
                : (err instanceof Error ? err.message : "Failed to post announcement")
            setError(message)
        } finally {
            setPosting(false)
        }
    }, [postTitle, editorState, getToken])

    // ── Derived data ──
    const groupedAnnouncements = useMemo(() => groupByDate(announcements), [announcements])

    const filteredAnnouncements = useMemo(() => {
        if (!searchQuery.trim()) return groupedAnnouncements
        const q = searchQuery.toLowerCase()
        const filtered = announcements.filter(
            (a) =>
                a.title.toLowerCase().includes(q) ||
                a.content.toLowerCase().includes(q) ||
                a.user.name.toLowerCase().includes(q)
        )
        return groupByDate(filtered)
    }, [searchQuery, groupedAnnouncements, announcements])

    // ── Render ──
    return (
        <div className="relative -m-4 flex h-[calc(100%+2rem)] w-[calc(100%+2rem)] overflow-hidden bg-background md:-m-6 md:h-[calc(100%+3rem)] md:w-[calc(100%+3rem)]">
            <div className="flex flex-1 flex-col overflow-hidden bg-transparent">
                <AnnouncementsHeader
                    count={announcements.length}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                />

                <AnnouncementsFeed
                    loading={loading}
                    error={error}
                    groupedAnnouncements={filteredAnnouncements}
                    bottomRef={bottomRef}
                />

                <PostEditor
                    userRole={userRole}
                    canPost={canPost}
                    postTitle={postTitle}
                    posting={posting}
                    onTitleChange={setPostTitle}
                    onEditorChange={setEditorState}
                    onPost={handlePostAnnouncement}
                />
            </div>
        </div>
    )
}

"use client"

import React from "react"
import { Loader2, Megaphone } from "lucide-react"
import type { Announcement } from "../data"
import { AnnouncementItem, DateSeparator } from "./AnnouncementItem"

interface AnnouncementsFeedProps {
    loading: boolean
    error: string | null
    groupedAnnouncements: Map<string, Announcement[]>
    bottomRef: React.RefObject<HTMLDivElement>
}

export function AnnouncementsFeed({
    loading, error, groupedAnnouncements, bottomRef,
}: AnnouncementsFeedProps) {
    return (
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden py-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="size-8 animate-spin text-primary" />
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                    <Megaphone className="size-10 mb-3 opacity-40" />
                    <p className="text-sm font-medium">Failed to load announcements</p>
                    <p className="text-xs mt-1">{error}</p>
                </div>
            ) : (
                <>
                    {Array.from(groupedAnnouncements.entries()).map(([date, items]) => (
                        <React.Fragment key={date}>
                            <DateSeparator date={date} />
                            {items.map((item) => (
                                <AnnouncementItem key={item.id} item={item} />
                            ))}
                        </React.Fragment>
                    ))}
                    {groupedAnnouncements.size === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                            <Megaphone className="size-10 mb-3 opacity-40" />
                            <p className="text-sm font-medium">No announcements found</p>
                            <p className="text-xs mt-1">Try adjusting your search terms</p>
                        </div>
                    )}
                </>
            )}
            <div ref={bottomRef} />
        </div>
    )
}

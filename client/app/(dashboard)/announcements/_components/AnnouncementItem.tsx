"use client"

import React from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { Announcement } from "../data"
import { getAvatarColor, getInitials } from "../utils"

// ─── Date Separator ───────────────────────────────────────────────────────────

export function DateSeparator({ date }: { date: string }) {
    return (
        <div className="my-4 flex items-center gap-2 px-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[11px] font-semibold text-muted-foreground">{date}</span>
            <div className="h-px flex-1 bg-border" />
        </div>
    )
}

// ─── Announcement Item ────────────────────────────────────────────────────────

export const AnnouncementItem = React.memo(function AnnouncementItem({ item }: { item: Announcement }) {
    return (
        <div className="group relative flex gap-4 px-4 py-3 hover:bg-muted/50 transition-colors">
            <Avatar className="mt-1 h-10 w-10 shrink-0 rounded-full border border-border shadow-sm">
                <AvatarFallback className={`text-xs font-bold text-white ${getAvatarColor(item.user.name)}`}>
                    {getInitials(item.user.name)}
                </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="cursor-pointer text-sm font-semibold text-foreground hover:underline">
                        {item.user.name}
                    </span>
                    <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold uppercase leading-none text-white ${item.user.badgeColor}`}>
                        {item.user.badge}
                    </span>
                    <span className="text-[11px] font-medium text-muted-foreground">{item.timestamp}</span>
                </div>
                <h3 className="mt-1 text-sm font-bold text-foreground">{item.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-foreground/80">{item.content}</p>
            </div>
        </div>
    )
})

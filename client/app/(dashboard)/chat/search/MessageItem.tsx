"use client"

import React, { useMemo } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { Message } from "../data"
import { getAvatarColor, getInitials } from "../utils"
import { UserBadge } from "../_components/ChatPirmitives"

export const MessageItem = React.memo(function MessageItem({ msg }: { msg: Message }) {
    const content = useMemo(() => {
        if (!msg.mentions?.length) return <>{msg.content}</>

        return (
            <>
                {msg.content.split(/(@\w+)/g).map((part, i) =>
                    part.startsWith("@") ? (
                        <span
                            key={i}
                            className="cursor-pointer rounded bg-primary/10 px-0.5 font-bold text-primary hover:bg-primary/20"
                        >
                            {part}
                        </span>
                    ) : (
                        <React.Fragment key={i}>{part}</React.Fragment>
                    )
                )}
            </>
        )
    }, [msg.content, msg.mentions])

    return (
        <div className="group relative flex gap-4 px-4 py-1.5 hover:bg-muted/50">
            <Avatar className="mt-0.5 h-10 w-10 shrink-0 rounded-full border border-border shadow-sm">
                <AvatarFallback className={`text-xs font-bold text-white ${getAvatarColor(msg.user.name)}`}>
                    {getInitials(msg.user.name)}
                </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-1">
                    <span className="cursor-pointer text-sm font-semibold text-foreground hover:underline">
                        {msg.user.name}
                    </span>
                    {msg.user.badge && (
                        <UserBadge text={msg.user.badge} color={msg.user.badgeColor!} />
                    )}
                    <span className="text-[11px] font-medium text-muted-foreground">{msg.timestamp}</span>
                </div>
                <p className="mt-0.5 text-sm leading-relaxed text-foreground/90 wrap-break-word whitespace-pre-wrap">
                    {content}
                </p>
            </div>
        </div>
    )
})
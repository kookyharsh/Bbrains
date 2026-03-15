"use client"

import React, { useMemo } from "react"
import { Copy, Pencil, Reply, Trash2 } from "lucide-react"
import type { Message } from "../data"
import { ChatImagePreview } from "@/components/chat-image-preview"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface MessageItemProps {
    msg: Message
    currentUserId?: string | null
    currentUsername?: string | null
    onReply: (message: Message) => void
    onCopy: (content: string) => void
    onEdit: (messageId: string, content: string) => void
    onDelete: (messageId: string) => void
    onOpenProfile: (userId: string, name: string, username: string) => void
}

export const MessageItem = React.memo(function MessageItem({
    msg,
    currentUserId,
    currentUsername,
    onReply,
    onCopy,
    onEdit,
    onDelete,
    onOpenProfile,
}: MessageItemProps) {
    const isOwnMessage = currentUserId === msg.user.id
    const isMentioned = Boolean(
        currentUsername &&
        msg.mentions?.some((mention) => mention.toLowerCase() === currentUsername.toLowerCase())
    )

    const content = useMemo(() => {
        if (!msg.mentions?.length) return <>{msg.content}</>

        return (
            <>
                {msg.content.split(/(@[a-zA-Z0-9_]+)/g).map((part, i) =>
                    /^@[a-zA-Z0-9_]+$/.test(part) ? (
                        <span
                            key={i}
                            className="bg-primary/20 text-primary rounded px-1 font-medium"
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

    const containerStyle = isMentioned
        ? "bg-primary/5 border-l-2 border-primary"
        : "hover:bg-muted/50"

    const isTeacher = msg.user.badge?.toLowerCase() === 'teacher' || msg.user.badge?.toLowerCase() === 'mod';
    const authorNameStyle = isTeacher ? "text-red-600 dark:text-red-400" : "text-foreground";

    // Handle attachments safely
    const attachments = useMemo(() => {
        if (!msg.attachments) return [];
        if (Array.isArray(msg.attachments)) return msg.attachments;
        try {
            return JSON.parse(msg.attachments as string);
        } catch (e) {
            return [];
        }
    }, [msg.attachments]);

    return (
        <div className={`group flex items-start gap-3 px-3 py-1.5 rounded-md transition-colors relative animate-in fade-in slide-in-from-bottom-4 duration-300 ${containerStyle}`}>
            <button onClick={() => onOpenProfile(msg.user.id, msg.user.name, msg.user.username)}>
                <Avatar className="w-9 h-9 shrink-0 mt-0.5">
                    <AvatarImage src={msg.user.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs uppercase">
                        {msg.user.name?.[0] || msg.user.username?.[0] || "U"}
                    </AvatarFallback>
                </Avatar>
            </button>
            
            <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                    <button
                        onClick={() => onOpenProfile(msg.user.id, msg.user.name, msg.user.username)}
                        className={`font-semibold text-sm hover:underline ${authorNameStyle}`}
                    >
                        {msg.user.name}
                    </button>
                    {msg.user.badge && (
                        <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                            {msg.user.badge}
                        </span>
                    )}
                    <span className="text-xs text-muted-foreground">{msg.timestamp}</span>
                    {msg.editedAt && <span className="text-[10px] text-gray-400">(edited)</span>}
                </div>

                {msg.replyTo && (
                    <p className="mb-1 text-xs text-muted-foreground border-l-2 border-primary pl-2 italic truncate">
                        Replying to @{msg.replyTo.username}: {msg.replyTo.content}
                    </p>
                )}

                <div className="text-sm text-foreground/90 wrap-break-word">
                    {content}
                </div>

                {attachments.length > 0 && (
                    <div className="mt-2 grid gap-2">
                        {attachments.map((att: any, idx: number) => (
                            <ChatImagePreview
                                key={`${msg.id}-att-${idx}`}
                                attachment={att}
                                variant="message"
                                className="w-full"
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Hover Actions */}
            <div className="absolute right-2 -top-3 hidden group-hover:flex items-center bg-card border border-border rounded-md shadow-sm z-10">
                <button 
                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors rounded-l-md" 
                    title="Reply" 
                    onClick={() => onReply(msg)}
                >
                    <Reply className="h-3.5 w-3.5" />
                </button>
                <button 
                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" 
                    title="Copy" 
                    onClick={() => onCopy(msg.content)}
                >
                    <Copy className="h-3.5 w-3.5" />
                </button>

                {isOwnMessage && (
                    <>
                        <button 
                            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" 
                            title="Edit" 
                            onClick={() => onEdit(msg.id, msg.content)}
                        >
                            <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button 
                            className="p-1.5 text-destructive hover:bg-destructive/10 transition-colors rounded-r-md" 
                            title="Delete" 
                            onClick={() => onDelete(msg.id)}
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </button>
                    </>
                )}
            </div>
        </div>
    )
})

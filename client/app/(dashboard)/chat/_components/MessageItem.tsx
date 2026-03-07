"use client"

import React, { useMemo } from "react"
import { Copy, Pencil, Reply, Trash2 } from "lucide-react"
import type { Message } from "../data"

interface MessageItemProps {
    msg: Message
    currentUserId?: string | null
    currentUsername?: string | null
    onReply: (message: Message) => void
    onCopy: (content: string) => void
    onEdit: (message: Message) => void
    onDelete: (messageId: string, withShift: boolean) => void
    onOpenProfile: (userId: string) => void
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
                            className="bg-yellow-200 dark:bg-yellow-800/50 text-yellow-800 dark:text-yellow-200 px-1 py-0.5 rounded font-medium"
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
        ? "bg-yellow-50 dark:bg-yellow-900/10 hover:bg-yellow-100 dark:hover:bg-yellow-900/20 border-l-4 border-yellow-400"
        : "hover:bg-gray-50 dark:hover:bg-gray-800/50"

    // Optional styling based on standard app badge logic if any, but mapping closely to stitch
    const isTeacher = msg.user.badge?.toLowerCase() === 'teacher';
    const authorNameStyle = isTeacher ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-white";

    return (
        <div className={`group flex gap-4 p-2 -mx-2 rounded-xl transition-colors relative ${containerStyle}`}>
            <img
                alt={msg.user.name}
                className="w-10 h-10 rounded-full mt-1 object-cover cursor-pointer hover:opacity-80"
                src={msg.user.avatar || `https://ui-avatars.com/api/?name=${msg.user.name}&background=random`}
                onClick={() => onOpenProfile(msg.user.id)}
            />
            <div className="flex-1">
                <div className="flex items-baseline gap-2 mb-1">
                    <span
                        className={`font-semibold cursor-pointer hover:underline ${authorNameStyle}`}
                        onClick={() => onOpenProfile(msg.user.id)}
                    >
                        {msg.user.name}
                    </span>

                    {msg.user.badge && (
                        <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                            {msg.user.badge}
                        </span>
                    )}

                    <span className="text-xs text-gray-500 dark:text-gray-400">{msg.timestamp}</span>
                    {msg.editedAt && <span className="text-[10px] text-gray-400">(edited)</span>}
                </div>

                {msg.replyTo && (
                    <p className="mb-1 truncate border-l-2 border-gray-300 dark:border-gray-700 pl-2 text-xs text-gray-500 italic">
                        Replying to @{msg.replyTo.username}: {msg.replyTo.content}
                    </p>
                )}

                <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap word-break-all">
                    {content}
                </p>
            </div>

            {/* Hover Actions */}
            <div className="absolute top-0 right-4 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-ui-light-surface dark:bg-ui-dark-surface border border-gray-200 dark:border-gray-700 shadow-sm rounded-lg flex items-center divide-x divide-gray-200 dark:divide-gray-700">
                <button className="p-1.5 text-gray-500 hover:text-indigo-600 dark:hover:text-white" title="Reply" onClick={() => onReply(msg)}>
                    <Reply className="h-4 w-4" />
                </button>
                <button className="p-1.5 text-gray-500 hover:text-indigo-600 dark:hover:text-white" title="Copy" onClick={() => onCopy(msg.content)}>
                    <Copy className="h-4 w-4" />
                </button>

                {isOwnMessage && (
                    <>
                        <button className="p-1.5 text-gray-500 hover:text-indigo-600 dark:hover:text-white" title="Edit" onClick={() => onEdit(msg)}>
                            <Pencil className="h-4 w-4" />
                        </button>
                        <button className="p-1.5 text-red-500 hover:text-red-600" title="Delete" onClick={(e) => onDelete(msg.id, e.shiftKey)}>
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </>
                )}
            </div>
        </div>
    )
})

"use client"

import React, { useMemo } from "react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    EmojiPicker, EmojiPickerContent, EmojiPickerFooter, EmojiPickerSearch,
} from "@/components/ui/emoji-picker"
import { PlusCircle, Send, Smile, X } from "lucide-react"
import type { Member, Message } from "../data"

interface MessageInputProps {
    message: string
    channelName: string
    members: Member[]
    editingMessageId: string | null
    replyingMessage: Message | null
    onChange: (val: string) => void
    onSend: () => void
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
    onEmojiSelect: (emoji: { emoji: string }) => void
    onCancelEdit: () => void
    onCancelReply: () => void
}

export function MessageInput({
    message, channelName, members, editingMessageId, replyingMessage, onChange, onSend, onKeyDown, onEmojiSelect, onCancelEdit, onCancelReply,
}: MessageInputProps) {
    const mentionMatch = message.match(/(?:^|\s)@([a-zA-Z0-9_]*)$/)
    const mentionQuery = mentionMatch ? mentionMatch[1].toLowerCase() : null

    const mentionCandidates = useMemo(() => {
        if (mentionQuery === null) return []
        return members
            .filter((member) => member.username.toLowerCase().startsWith(mentionQuery))
            .slice(0, 6)
    }, [mentionQuery, members])

    const insertMention = (username: string) => {
        if (mentionQuery === null) return
        onChange(message.replace(/@([a-zA-Z0-9_]*)$/, `@${username} `))
    }

    return (
        <div className="p-4 bg-ui-light-surface dark:bg-ui-dark-surface border-t border-gray-100 dark:border-gray-800 shrink-0 z-10 w-full relative">
            {replyingMessage && (
                <div className="mb-2 flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-3 py-2 text-xs w-full">
                    <span className="truncate text-gray-600 dark:text-gray-300">
                        Replying to <span className="font-semibold text-gray-900 dark:text-white">{replyingMessage.user.name}</span>: {replyingMessage.content}
                    </span>
                    <button className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" onClick={onCancelReply}>
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            {editingMessageId && (
                <div className="mb-2 flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-3 py-2 text-xs w-full">
                    <span className="text-gray-600 dark:text-gray-300">Editing message</span>
                    <button className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" onClick={onCancelEdit}>
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-2 flex items-center gap-2 w-full">
                <button
                    className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    aria-label="Attach file"
                >
                    <PlusCircle className="h-5 w-5" />
                </button>

                <input
                    value={message}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder={`Message #${channelName}...`}
                    className="flex-1 bg-transparent border-none focus:ring-0 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 outline-none text-sm"
                    aria-label="Message input"
                />

                <div className="flex items-center gap-1">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                aria-label="Open emoji picker"
                            >
                                <Smile className="h-5 w-5" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            side="top"
                            className="h-100 w-fit border-none bg-transparent p-0 shadow-none z-50 mb-2"
                        >
                            <EmojiPicker
                                className="h-full border shadow-xl bg-ui-light-surface dark:bg-ui-dark-surface rounded-lg overflow-hidden"
                                onEmojiSelect={onEmojiSelect}
                            >
                                <EmojiPickerSearch placeholder="Search emoji…" />
                                <EmojiPickerContent />
                                <EmojiPickerFooter />
                            </EmojiPicker>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <button
                        onClick={onSend}
                        disabled={!message.trim()}
                        aria-label={editingMessageId ? "Save message" : "Send message"}
                        className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        <Send className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {mentionCandidates.length > 0 && (
                <div className="mt-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-ui-light-surface dark:bg-ui-dark-surface shadow-lg absolute bottom-[80px] left-4 max-w-sm w-[90%] z-50 overflow-hidden">
                    {mentionCandidates.map((member) => (
                        <button
                            key={member.id}
                            type="button"
                            onClick={() => insertMention(member.username)}
                            className="flex items-center justify-between w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <span className="font-semibold text-gray-900 dark:text-white">{member.name}</span>
                            <span className="ml-2 text-gray-500 dark:text-gray-400">@{member.username}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

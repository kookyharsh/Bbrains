"use client"

import React, { useEffect, useMemo, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    EmojiPicker, EmojiPickerContent, EmojiPickerFooter, EmojiPickerSearch,
} from "@/components/ui/emoji-picker"
import { Send, Smile, X, ImagePlus, Loader2, Hash } from "lucide-react"
import type { Member } from "@/features/chat/data"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface MessageInputProps {
    message: string
    channelName: string
    members: Member[]
    editingMessageId: string | null
    replyingMessage: { id: string; username: string; content: string } | null
    pendingAttachments: { file: File; previewUrl: string }[]
    isUploading?: boolean
    uploadError?: string | null
    onChange: (val: string) => void
    onSend: () => void
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
    onEmojiSelect: (emoji: { emoji: string }) => void
    onCancelEdit: () => void
    onCancelReply: () => void
    onFileSelect: (files: File[]) => void
    onRemoveAttachment: (index: number) => void
    onMentionSelect: (username: string) => void
    mentionQuery: string | null
    mentionIndex: number
    setMentionIndex: (idx: number) => void
}

export function MessageInput({
    message, 
    channelName, 
    members, 
    editingMessageId, 
    replyingMessage, 
    pendingAttachments,
    isUploading = false,
    uploadError = null,
    onChange, 
    onSend, 
    onKeyDown, 
    onEmojiSelect, 
    onCancelEdit, 
    onCancelReply,
    onFileSelect,
    onRemoveAttachment,
    onMentionSelect,
    mentionQuery,
    mentionIndex,
    setMentionIndex
}: MessageInputProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const mentionSuggestions = useMemo(() => {
        if (mentionQuery === null) return []
        return members
            .filter((member) => 
                member.name.toLowerCase().includes(mentionQuery.toLowerCase()) || 
                member.username.toLowerCase().includes(mentionQuery.toLowerCase())
            )
            .slice(0, 5)
    }, [mentionQuery, members])

    useEffect(() => {
        const focusTimer = setTimeout(() => {
            inputRef.current?.focus()
        }, 120)

        return () => clearTimeout(focusTimer)
    }, [])

    return (
        <div className="px-3 pt-3 pb-24 md:pb-3 border-t border-border bg-card mt-auto relative z-40 bottom-0 md:static">
            {uploadError && (
                <div
                    role="alert"
                    className="mb-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive"
                >
                    {uploadError}
                </div>
            )}
            {/* Reply Preview */}
            {replyingMessage && (
                <div className="flex items-center justify-between mb-2 px-2 py-1.5 bg-muted/50 rounded-md text-xs">
                    <span className="text-muted-foreground truncate">
                        Replying to <span className="font-medium text-foreground">@{replyingMessage.username}</span>: {replyingMessage.content.slice(0, 50)}{replyingMessage.content.length > 50 ? '...' : ''}
                    </span>
                    <Button variant="ghost" size="icon" className="h-5 w-5" onClick={onCancelReply}>
                        <X className="w-3 h-3" />
                    </Button>
                </div>
            )}

            {/* Editing indicator if not handled in-line */}
            {editingMessageId && !replyingMessage && (
                <div className="flex items-center justify-between mb-2 px-2 py-1.5 bg-brand-purple/10 rounded-md text-xs">
                    <span className="text-brand-purple font-medium">Editing message</span>
                    <Button variant="ghost" size="icon" className="h-5 w-5 text-brand-purple" onClick={onCancelEdit}>
                        <X className="w-3 h-3" />
                    </Button>
                </div>
            )}

            <div className="flex items-end gap-1.5">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="shrink-0 h-8 w-8 mb-1" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                >
                    <ImagePlus className="w-4 h-4" />
                </Button>
                
                <input 
                    ref={fileInputRef} 
                    type="file" 
                    multiple
                    accept="image/*,video/*" 
                    className="hidden" 
                    onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        if (files.length > 0) onFileSelect(files);
                        e.target.value = '';
                    }} 
                />

                <div className="flex-1 flex flex-col gap-2 relative">
                    {/* Attachment Previews */}
                    {pendingAttachments.length > 0 && (
                        <div className="flex flex-wrap gap-2 p-2 bg-muted/30 rounded-lg animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {pendingAttachments.map((att, idx) => (
                                <div key={idx} className="relative group">
                                    {att.file.type.startsWith('image/') ? (
                                        <img
                                            src={att.previewUrl}
                                            alt="preview"
                                            className="h-16 w-16 object-cover rounded-md border border-border"
                                        />
                                    ) : (
                                        <div className="h-16 w-16 flex items-center justify-center bg-muted rounded-md border border-border">
                                            <Hash className="w-6 h-6 text-muted-foreground" />
                                        </div>
                                    )}
                                    <button
                                        onClick={() => onRemoveAttachment(idx)}
                                        className="absolute -top-1.5 -right-1.5 bg-background border border-border rounded-full p-0.5 shadow-sm hover:bg-muted transition-colors"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Input Area */}
                    <div className="flex-1 relative flex items-center bg-background border border-input rounded-full transition-all duration-300 focus-within:ring-1 focus-within:ring-ring">
                        {/* Mention Suggestions */}
                        {mentionQuery !== null && mentionSuggestions.length > 0 && (
                            <div className="absolute bottom-full left-0 mb-1 w-64 bg-popover border border-border rounded-md shadow-md overflow-hidden z-50">
                                {mentionSuggestions.map((member, i) => (
                                    <button
                                        key={member.id}
                                        className={`flex items-center gap-2 w-full px-3 py-2 text-sm transition-colors ${
                                            i === mentionIndex ? "bg-accent text-accent-foreground" : "hover:bg-muted/50 text-foreground"
                                        }`}
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            onMentionSelect(member.username);
                                        }}
                                        onMouseEnter={() => setMentionIndex(i)}
                                    >
                                        <Avatar className="w-6 h-6 shrink-0">
                                            <AvatarImage src={member.avatar} />
                                            <AvatarFallback className="bg-brand-purple/10 text-brand-purple text-[10px] font-bold">
                                                {member.name.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col items-start overflow-hidden">
                                            <span className="font-medium truncate w-full text-left">{member.name}</span>
                                            <span className="text-[10px] text-muted-foreground truncate w-full text-left">@{member.username}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        <input
                            ref={inputRef}
                            value={message}
                            onChange={(e) => onChange(e.target.value)}
                            onKeyDown={onKeyDown}
                            autoFocus
                            aria-label="Message input"
                            placeholder={`Message #${channelName}`}
                            className="flex-1 bg-transparent px-4 py-2 text-sm outline-none placeholder:text-muted-foreground"
                        />

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    className="px-2 text-muted-foreground hover:text-foreground transition-colors mr-1"
                                    aria-label="Open emoji picker"
                                >
                                    <Smile className="w-4 h-4" />
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
                    </div>
                </div>

                {/* Send Button */}
                {(message.trim() || pendingAttachments.length > 0) && (
                    <Button 
                        size="icon" 
                        onClick={onSend} 
                        disabled={isUploading}
                        className="shrink-0 h-8 w-8 mb-1 animate-in fade-in slide-in-from-right-4 duration-300"
                    >
                        {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                )}
            </div>
        </div>
    )
}

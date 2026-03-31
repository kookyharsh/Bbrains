"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Editor } from "@/components/blocks/editor-00/editor"
import { SerializedEditorState } from "lexical"
import { Loader2, Send, Shield } from "lucide-react"

interface PostEditorProps {
    userRole: string
    canPost: boolean
    postTitle: string
    posting: boolean
    onTitleChange: (val: string) => void
    onEditorChange: (state: SerializedEditorState) => void
    onPost: () => void
}

export function PostEditor({
    userRole, canPost, postTitle, posting,
    onTitleChange, onEditorChange, onPost,
}: PostEditorProps) {
    if (!canPost) {
        return (
            <div className="shrink-0 border-t border-border bg-muted/30 px-4 py-3 text-center">
                <p className="text-xs text-muted-foreground">
                    Only administrators and teachers can post announcements.
                </p>
            </div>
        )
    }

    return (
        <div className="shrink-0 border-t border-border bg-ui-light-surface dark:bg-ui-dark-surface px-4 py-3">
            <div className="mb-2 flex items-center gap-2">
                <Shield className="size-4 text-primary" />
                <span className="text-xs font-semibold text-muted-foreground">
                    Posting as <span className="text-foreground capitalize">{userRole}</span>
                </span>
            </div>
            <Input
                placeholder="Announcement title..."
                value={postTitle}
                onChange={(e) => onTitleChange(e.target.value)}
                maxLength={100}
                className="mb-2"
            />
            <Editor onSerializedChange={onEditorChange} />
            <div className="mt-2 flex justify-end">
                <Button
                    size="sm"
                    className="gap-1.5"
                    disabled={!postTitle.trim() || posting}
                    onClick={onPost}
                >
                    {posting
                        ? <Loader2 className="size-3.5 animate-spin" />
                        : <Send className="size-3.5" />
                    }
                    {posting ? "Posting..." : "Post Announcement"}
                </Button>
            </div>
        </div>
    )
}

"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Dialog,
    DialogContent,
    DialogTitle,
    VisuallyHidden,
} from "@/components/ui/dialog"
import type { Member } from "@/features/chat/data"
import { Calendar, X } from "lucide-react"

interface ProfileDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    member: Member | null
}

export function ProfileDialog({ open, onOpenChange, member }: ProfileDialogProps) {
    if (!member) return null

    const statusColors: Record<string, string> = {
        "online": "bg-green-500",
        "idle": "bg-yellow-500", 
        "offline": "bg-gray-400"
    }
    const memberStatus = member.status || "offline"

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent 
                showCloseButton={false}
                className="w-full max-w-md overflow-hidden border border-ui-light-text-secondary/15 bg-(--color-ui-light-surface) p-0 text-(--color-ui-light-text-primary) shadow-[0_24px_64px_rgba(15,23,42,0.28)] dark:border-ui-dark-text-secondary/20 dark:bg-(--color-ui-dark-surface) dark:text-(--color-ui-dark-text-primary)" 
            >
                <DialogTitle>
                    <VisuallyHidden>Profile Details for {member.name}</VisuallyHidden>
                </DialogTitle>
                
                <div className="relative w-full">
                    <button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        aria-label="Close profile dialog"
                        className="absolute right-4  z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/15 text-white backdrop-blur-sm transition-colors hover:bg-black/25 dark:border-white/10"
                    >
                        <X className="h-5 w-5" />
                    </button>

                    <div className="relative h-24 bg-gray" />
                    
                    <div className="bg-(--color-ui-light-surface) px-4 pb-4 dark:bg-(--color-ui-dark-surface)">
                        <div className="relative flex justify-between items-end -mt-12 mb-3">
                            <div className="relative">
                                <div className="relative flex h-24 w-24 items-center justify-between overflow-hidden rounded-full border-[6px] border-(--color-ui-light-surface) bg-gray-300 shadow-sm dark:border-(--color-ui-dark-surface)">
                                    <Avatar className="h-full w-full rounded-full border-none after:border-none">
                                        <AvatarImage src={member.avatar || undefined} className="object-cover" />
                                        <AvatarFallback 
                                            name={member.username}
                                            className="text-3xl font-bold text-white rounded-full flex items-center justify-center bg-brand-purple/20"
                                        >
                                            {member.username?.[0] || "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                                <div className={`absolute bottom-1 right-1 h-6 w-6 rounded-full border-4 border-(--color-ui-light-surface) ${statusColors[memberStatus] || "bg-gray-400"} dark:border-(--color-ui-dark-surface)`}></div>
                            </div>
                        </div>
                        
                        <div className="mb-3 rounded-xl border border-black/5 bg-black/[0.035] p-3 dark:border-white/8 dark:bg-white/4.5">
                            <h1 className="truncate text-xl font-bold leading-tight text-(--color-ui-light-text-primary) dark:text-(--color-ui-dark-text-primary)">
                                {member.name}
                            </h1>
                            <p className="truncate text-sm font-medium text-(--color-ui-light-text-secondary) dark:text-(--color-ui-dark-text-secondary)">@{member.username}</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                                <span className="rounded bg-black/6 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-(--color-ui-light-text-secondary) dark:bg-white/8 dark:text-(--color-ui-dark-text-secondary)">
                                    {member.pronouns || "Member"}
                                </span>
                                {member.grade && member.grade !== "N/A" && member.grade !== "NA" && (
                                    <span className="rounded bg-black/6 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-(--color-ui-light-text-secondary) dark:bg-white/8 dark:text-(--color-ui-dark-text-secondary)">
                                        {member.grade}
                                    </span>
                                )}
                                {member.type === "teacher" && (member.grade === "N/A" || member.grade === "NA") && (
                                    <span className="rounded bg-black/6 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-(--color-ui-light-text-secondary) dark:bg-white/8 dark:text-(--color-ui-dark-text-secondary)">
                                        {member.roles.find(r => /grade/i.test(r)) || "Faculty"}
                                    </span>
                                )}
                            </div>
                        </div>
                        
                        <div className="space-y-4 max-h-50 overflow-y-auto pr-1 custom-scrollbar">
                            <div className="space-y-1.5">
                                <h3 className="text-[11px] font-bold uppercase tracking-widest text-(--color-ui-light-text-secondary) dark:text-(--color-ui-dark-text-secondary)">Roles</h3>
                                <div className="flex flex-wrap gap-2">
                                    {member.roles.length > 0 ? (
                                        member.roles.map((role) => (
                                            <span key={role} className="rounded-full border border-black/8 bg-black/[0.035] px-2 py-0.5 text-[11px] font-semibold capitalize text-(--color-ui-light-text-secondary) dark:border-white/8 dark:bg-white/4.5 dark:text-(--color-ui-dark-text-secondary)">
                                                {role}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-xs capitalize text-(--color-ui-light-text-secondary) dark:text-(--color-ui-dark-text-secondary)">{member.type}</span>
                                    )}
                                </div>
                            </div>
                            
                            <div className="space-y-1.5">
                                <h3 className="text-[11px] font-bold uppercase tracking-widest text-(--color-ui-light-text-secondary) dark:text-(--color-ui-dark-text-secondary)">About Me</h3>
                                <p className="text-[13px] leading-relaxed text-(--color-ui-light-text-primary) dark:text-(--color-ui-dark-text-primary)">
                                    A vibrant member of the Bbrains community.
                                </p>
                            </div>
                            
                            <div className="space-y-1.5">
                                <h3 className="text-[11px] font-bold uppercase tracking-widest text-(--color-ui-light-text-secondary) dark:text-(--color-ui-dark-text-secondary)">Bbrains Member Since</h3>
                                <div className="flex items-center gap-2 text-xs text-(--color-ui-light-text-primary) dark:text-(--color-ui-dark-text-primary)">
                                    <Calendar className="h-4 w-4" />
                                    <span>Just Recently</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

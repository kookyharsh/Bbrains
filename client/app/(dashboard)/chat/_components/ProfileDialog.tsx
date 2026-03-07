"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    VisuallyHidden,
} from "@/components/ui/dialog"
import type { Member } from "../data"
import { getAvatarColor, getInitials } from "../utils"

interface ProfileDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    member: Member | null
}

export function ProfileDialog({ open, onOpenChange, member }: ProfileDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {member ? "Profile" : <VisuallyHidden>Profile</VisuallyHidden>}
                    </DialogTitle>
                    <DialogDescription>Member details</DialogDescription>
                </DialogHeader>
                {!member ? null : (
                    <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-16 w-16">
                                    <AvatarImage src={member.avatar || undefined} alt={member.name} />
                                    <AvatarFallback className={`text-base font-bold text-white ${getAvatarColor(member.name)}`}>
                                        {getInitials(member.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                    <p className="truncate text-lg font-semibold">{member.name}</p>
                                    <p className="truncate text-sm text-muted-foreground">@{member.username}</p>
                                </div>
                            </div>
                            <div className="grid gap-3 text-sm">
                                <div className="rounded-md border p-3">
                                    <p className="text-xs text-muted-foreground">Pronouns</p>
                                    <p className="font-medium">{member.pronouns}</p>
                                </div>
                                <div className="rounded-md border p-3">
                                    <p className="text-xs text-muted-foreground">Grade</p>
                                    <p className="font-medium">{member.grade}</p>
                                </div>
                                <div className="rounded-md border p-3">
                                    <p className="text-xs text-muted-foreground">Roles</p>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {member.roles.length > 0 ? (
                                            member.roles.map((role) => (
                                                <span key={role} className="rounded-full border px-2 py-0.5 text-xs font-medium">
                                                    {role}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-muted-foreground">{member.type}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                )}
            </DialogContent>
        </Dialog>
    )
}

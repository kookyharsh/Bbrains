"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Dialog,
    DialogContent,
    DialogTitle,
    VisuallyHidden,
} from "@/components/ui/dialog"
import type { Member } from "@/features/chat/data"
import { getAvatarColor, getInitials } from "@/features/chat/utils"
import { Shield, School, Calendar } from "lucide-react"

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
                className="p-0 border-none bg-transparent shadow-none w-fit max-w-md sm:max-w-md [&>button]:right-5 [&>button]:top-5 [&>button]:text-white [&>button]:hover:bg-white/20 [&>button]:rounded-full [&>button]:p-1.5 [&>button]:z-50 [&>button>svg]:h-5 [&>button>svg]:w-5" 
            >
                <DialogTitle>
                    <VisuallyHidden>Profile Details for {member.name}</VisuallyHidden>
                </DialogTitle>
                
                <div className="w-[340px] bg-background-light dark:bg-[#221610] rounded-xl overflow-hidden shadow-[0_8px_16px_rgba(0,0,0,0.24)] border border-gray-200 dark:border-gray-800 relative">
                    <div className="relative h-24 bg-gradient-to-r from-brand-purple to-purple-400">
                    </div>
                    
                    <div className="px-4 pb-4">
                        <div className="relative flex justify-between items-end -mt-12 mb-3">
                            <div className="relative">
                                <div className="h-24 w-24 rounded-full border-[6px] border-background-light dark:border-[#221610] bg-gray-300 overflow-hidden relative">
                                    <Avatar className="h-full w-full rounded-none">
                                        <AvatarImage src={member.avatar || undefined} className="object-cover" />
                                        <AvatarFallback className={`text-2xl font-bold text-white rounded-none flex items-center justify-center ${getAvatarColor(member.name)}`}>
                                            {getInitials(member.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                                <div className={`absolute bottom-1 right-1 h-6 w-6 rounded-full border-[4px] border-background-light dark:border-[#221610] ${statusColors[memberStatus] || "bg-gray-400"}`}></div>
                            </div>
                            
                            
                        </div>
                        
                        <div className="bg-gray-100/50 dark:bg-gray-900/50 rounded-xl p-3 mb-3 border border-gray-200/50 dark:border-gray-800/50">
                            <h1 className="text-gray-900 dark:text-gray-100 text-xl font-bold leading-tight truncate">
                                {member.name}
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium truncate">@{member.username}</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-800 px-2 py-0.5 rounded">
                                    {member.pronouns || "Member"}
                                </span>
                                {member.grade && (
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-800 px-2 py-0.5 rounded">
                                        {member.grade}
                                    </span>
                                )}
                            </div>
                        </div>
                        
                        <div className="space-y-4 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                            <div className="space-y-1.5">
                                <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Roles</h3>
                                <div className="flex flex-wrap gap-2">
                                    {member.roles.length > 0 ? (
                                        member.roles.map((role) => (
                                            <span key={role} className="rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-2 py-0.5 text-[11px] font-semibold text-gray-600 dark:text-gray-300 capitalize">
                                                {role}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-gray-500 text-xs capitalize">{member.type}</span>
                                    )}
                                </div>
                            </div>
                            
                            <div className="space-y-1.5">
                                <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">About Me</h3>
                                <p className="text-gray-700 dark:text-gray-300 text-[13px] leading-relaxed">
                                    A vibrant member of the Bbrains community.
                                </p>
                            </div>
                            
                            <div className="space-y-1.5">
                                <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Bbrains Member Since</h3>
                                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-xs">
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

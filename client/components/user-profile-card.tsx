"use client"

import React from 'react'
import { Settings, Circle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export type UserStatus = "online" | "idle" | "do-not-disturb" | "offline"

export const statusColors: Record<UserStatus, string> = {
    "online": "bg-green-500",
    "idle": "bg-yellow-500", 
    "do-not-disturb": "bg-red-500",
    "offline": "bg-gray-400"
}

export const statusLabels: Record<UserStatus, string> = {
    "online": "Online",
    "idle": "Away",
    "do-not-disturb": "Do Not Disturb",
    "offline": "Offline"
}

interface UserProfileCardProps {
    user: any;
    userStatus: UserStatus;
    setUserStatus: (status: UserStatus) => void;
}

export function UserProfileCard({ user, userStatus, setUserStatus }: UserProfileCardProps) {
    return (
        <div className="absolute bottom-20 left-6 w-[340px] bg-card rounded-xl overflow-hidden shadow-[0_8px_16px_rgba(0,0,0,0.24)] border border-border z-50">
            <div className="relative h-24 bg-gradient-to-r from-brand-purple to-purple-400">
                <div className="absolute top-2 right-2 flex gap-1.5">
                    <button className="bg-black/20 hover:bg-black/40 text-white p-1.5 rounded-full transition-colors flex items-center justify-center">
                        <Settings className="h-[18px] w-[18px]" />
                    </button>
                </div>
            </div>
            
            <div className="px-4 pb-4">
                <div className="relative flex justify-between items-end -mt-12 mb-2">
                    <div className="relative">
                        <div className="h-24 w-24 rounded-full border-[6px] border-card bg-muted overflow-hidden relative shadow-sm">
                            <Avatar className="h-full w-full rounded-none">
                                <AvatarImage src={user?.imageUrl} className="object-cover" />
                                <AvatarFallback className="bg-brand-mint/20 text-brand-mint font-bold text-2xl uppercase rounded-none flex items-center justify-center">
                                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                        <div className={`absolute bottom-1 right-1 h-6 w-6 rounded-full border-[4px] border-card ${statusColors[userStatus]}`}></div>
                    </div>
                </div>
                
                <div className="bg-muted/50 rounded-xl p-3 mb-2 border border-border/50">
                    <h1 className="text-foreground text-xl font-bold leading-tight">
                        {user?.fullName || user?.firstName ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : "Anonymous User"}
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium">@{user?.username || "user"}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded">Student</span>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded">Lvl {user?.level || 1}</span>
                        {user?.xp !== undefined && (
                            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-purple bg-brand-purple/10 px-2 py-0.5 rounded">
                                {user?.xp} XP
                            </span>
                        )}
                    </div>
                </div>
                
                <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                    <div className="space-y-1.5">
                        <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Set Status</h3>
                        <div className="flex flex-wrap gap-2">
                            {(["online", "idle", "do-not-disturb", "offline"] as UserStatus[]).map((status) => (
                                <button
                                    key={status}
                                    onClick={async (e) => {
                                        e.stopPropagation();
                                        setUserStatus(status);
                                    }}
                                    className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs transition-colors ${
                                        userStatus === status 
                                            ? "bg-brand-purple text-white border border-brand-purple" 
                                            : "bg-muted text-muted-foreground hover:bg-accent border border-transparent"
                                    }`}
                                >
                                    <Circle className={`w-2 h-2 fill-current ${statusColors[status]}`} />
                                    {statusLabels[status]}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="space-y-1">
                        <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">About Me</h3>
                        <p className="text-foreground text-sm leading-relaxed min-h-[1.25rem]">
                            {user?.bio || <span className="text-muted-foreground italic text-xs">No bio yet...</span>}
                        </p>
                    </div>
                    
                    <div className="space-y-1">
                        <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Bbrains Member Since</h3>
                        <div className="flex items-center gap-2 text-foreground text-xs">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="2" />
                                <path strokeWidth="2" d="M16 2v4M8 2v4M3 10h18" />
                            </svg>
                            <span>
                                {user?.createdAt
                                    ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
                                    : "Unknown"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="px-4 py-3 bg-muted/30 border-t border-border">
                <div className="relative">
                    <input 
                        className="w-full bg-transparent border-none focus:ring-0 text-xs text-muted-foreground p-0 placeholder:text-muted-foreground/50 italic outline-none" 
                        placeholder="Click to add a custom status note..." 
                        type="text"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            </div>
        </div>
    )
}

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
    user: {
        firstName?: string;
        lastName?: string;
        fullName?: string;
        username?: string;
        imageUrl?: string;
        level?: number;
        xp?: number;
        bio?: string;
        createdAt?: string | Date;
    } | null;
    userStatus: UserStatus;
    setUserStatus: (status: UserStatus) => void;
}

export function UserProfileCard({ user, userStatus, setUserStatus }: UserProfileCardProps) {
    return (
        <div className="absolute bottom-20 left-6 w-85 bg-background-light dark:bg-[#221610] rounded-xl overflow-hidden shadow-[0_8px_16px_rgba(0,0,0,0.24)] border border-gray-200 dark:border-gray-800 z-50">
            <div className="relative h-24 bg-linear-to-r from-brand-purple to-purple-400">
                <div className="absolute top-2 right-2 flex gap-1.5">
                    <button className="bg-black/20 hover:bg-black/40 text-white p-1.5 rounded-full transition-colors flex items-center justify-center">
                        <Settings className="h-4.5 w-4.5" />
                    </button>
                </div>
            </div>
            
            <div className="px-4 pb-4">
                <div className="relative flex justify-between items-end -mt-12 mb-2">
                    <div className="relative">
                        <div className="h-24 w-24 rounded-full border-[6px] border-background-light dark:border-[#221610] bg-gray-300 overflow-hidden relative shadow-sm">
                            <Avatar className="h-full w-full rounded-none">
                                <AvatarImage src={user?.imageUrl} className="object-cover" />
                                <AvatarFallback className="bg-brand-mint/20 text-brand-mint font-bold text-2xl uppercase rounded-none flex items-center justify-center">
                                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                        <div className={`absolute bottom-1 right-1 h-6 w-6 rounded-full border-4 border-background-light dark:border-[#221610] ${statusColors[userStatus]}`}></div>
                    </div>
                </div>
                
                <div className="bg-gray-100/50 dark:bg-gray-900/50 rounded-xl p-3 mb-2 border border-gray-200/50 dark:border-gray-800/50">
                    <h1 className="text-gray-900 dark:text-gray-100 text-xl font-bold leading-tight">
                        {user?.fullName || user?.firstName ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : "Anonymous User"}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">@{user?.username || "user"}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-800 px-2 py-0.5 rounded">Student</span>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-800 px-2 py-0.5 rounded">Lvl {user?.level || 1}</span>
                        {user?.xp !== undefined && (
                            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-purple bg-brand-purple/10 px-2 py-0.5 rounded">
                                {user?.xp} XP
                            </span>
                        )}
                    </div>
                </div>
                
                <div className="space-y-3 max-h-50 overflow-y-auto pr-1 custom-scrollbar">
                    <div className="space-y-1.5">
                        <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Set Status</h3>
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
                                            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 border border-transparent"
                                    }`}
                                >
                                    <Circle className={`w-2 h-2 fill-current ${statusColors[status]}`} />
                                    {statusLabels[status]}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="space-y-1">
                        <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">About Me</h3>
                        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed min-h-5">
                            {user?.bio || <span className="text-gray-400 italic text-xs">No bio yet...</span>}
                        </p>
                    </div>
                    
                    <div className="space-y-1">
                        <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Bbrains Member Since</h3>
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-xs">
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
            
            <div className="px-4 py-3 bg-gray-50 dark:bg-black/20 border-t border-gray-200 dark:border-gray-800">
                <div className="relative">
                    <input 
                        className="w-full bg-transparent border-none focus:ring-0 text-xs text-gray-500 dark:text-gray-400 p-0 placeholder:text-gray-400 dark:placeholder:text-gray-600 italic outline-none" 
                        placeholder="Click to add a custom status note..." 
                        type="text"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            </div>
        </div>
    )
}

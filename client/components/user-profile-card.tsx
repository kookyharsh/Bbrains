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
        <div className="absolute bottom-20 left-6 w-[340px] bg-background-light dark:bg-[#221610] rounded-xl overflow-hidden shadow-[0_8px_16px_rgba(0,0,0,0.24)] border border-gray-200 dark:border-gray-800 z-50">
            <div className="relative h-24 bg-gradient-to-r from-brand-purple to-purple-400">
                <div className="absolute top-2 right-2 flex gap-1.5">
                    <button className="bg-black/20 hover:bg-black/40 text-white p-1.5 rounded-full transition-colors flex items-center justify-center">
                        <Settings className="h-[18px] w-[18px]" />
                    </button>
                </div>
            </div>
            
            <div className="px-4 pb-4">
                <div className="relative flex justify-between items-end -mt-12 mb-3">
                    <div className="relative">
                        <div className="h-24 w-24 rounded-full border-[6px] border-background-light dark:border-[#221610] bg-gray-300 overflow-hidden relative">
                            <Avatar className="h-full w-full rounded-none">
                                <AvatarImage src={user?.imageUrl} className="object-cover" />
                                <AvatarFallback className="bg-brand-mint/20 text-brand-mint font-bold text-2xl uppercase rounded-none flex items-center justify-center">
                                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                        <div className={`absolute bottom-1 right-1 h-6 w-6 rounded-full border-[4px] border-background-light dark:border-[#221610] ${statusColors[userStatus]}`}></div>
                    </div>
                    
                    <div className="flex flex-wrap justify-end gap-1 mb-1 max-w-[120px]">
                        <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700" title="Verified Student">
                            <span className="material-symbols-outlined text-brand-purple text-[18px] block">verified</span>
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700" title="Bbrains Contributor">
                            <span className="material-symbols-outlined text-brand-orange text-[18px] block">school</span>
                        </div>
                    </div>
                </div>
                
                <div className="bg-gray-100/50 dark:bg-gray-900/50 rounded-xl p-3 mb-3 border border-gray-200/50 dark:border-gray-800/50">
                    <h1 className="text-gray-900 dark:text-gray-100 text-xl font-bold leading-tight">
                        {user?.fullName || user?.firstName ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : "Anonymous User"}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">@{user?.username || "user"}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-800 px-2 py-0.5 rounded">Student</span>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-800 px-2 py-0.5 rounded">Lvl {user?.level || 1}</span>
                    </div>
                </div>
                
                <div className="space-y-4 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
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
                    
                    <div className="space-y-1.5">
                        <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">About Me</h3>
                        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                            Aspiring learner. When I'm not studying, I'm probably grinding points on Bbrains. 🚀
                        </p>
                    </div>
                    
                    <div className="space-y-1.5">
                        <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Bbrains Member Since</h3>
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-xs">
                            <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                            <span>Sep 12, 2022</span>
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

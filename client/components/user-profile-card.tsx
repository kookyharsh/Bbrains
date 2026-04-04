"use client"

import React from 'react'
import Link from "next/link"
import { Pencil } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { usePermissions } from "@/hooks/use-permissions"

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
        createdAt?: Date | string | null;
    } | null;
}

export function UserProfileCard({ user }: UserProfileCardProps) {
    const { roles } = usePermissions();
    const joinedDate = user?.createdAt ? new Date(user.createdAt) : null
    const hasJoinedDate = Boolean(joinedDate && !Number.isNaN(joinedDate.getTime()))
    const displayName =
        user?.fullName || user?.firstName
            ? `${user?.firstName || ''} ${user?.lastName || ''}`.trim()
            : "Anonymous User"

    return (
        <div className="absolute bottom-20 left-6 z-50 w-85 overflow-hidden rounded-[28px] border border-slate-200/80 bg-slate-50 shadow-[0_18px_40px_rgba(15,23,42,0.18)] dark:border-slate-800 dark:bg-slate-950">
            <div className="relative h-24 bg-linear-to-r from-brand-purple via-violet-500 to-fuchsia-400">
                <div className="absolute top-2 right-2 flex gap-1.5">
                    <Link
                        href="/profile"
                        aria-label="Edit profile"
                        className="flex items-center justify-center rounded-full bg-white/20 p-2 text-white transition-colors hover:bg-white/30"
                    >
                        <Pencil className="h-4 w-4" />
                    </Link>
                </div>
            </div>

            <div className="px-4 pb-4">
                <div className="relative mb-3 flex justify-center -mt-12">
                    <div className="relative">
                        <div className="object-cover relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-[6px] border-slate-50 bg-slate-200 shadow-sm dark:border-slate-950 dark:bg-slate-800">
                            <Avatar 
                                key={user?.imageUrl}
                                className="h-full w-full rounded-full object-cover"
                            >
                                <AvatarImage src={user?.imageUrl || undefined} className="object-cover" />
                                <AvatarFallback
                                    name={user?.username}
                                    className="flex items-center justify-center rounded-full bg-brand-mint/20 text-2xl font-bold uppercase text-brand-mint"
                                >
                                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                    </div>
                </div>

                <div className="mb-3 rounded-2xl border border-slate-200/80 bg-white/85 p-4 dark:border-slate-800 dark:bg-slate-900/80">
                    <h1 className="text-xl font-bold leading-tight text-slate-900 dark:text-slate-100">
                        {displayName}
                    </h1>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">@{user?.username || "user"}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {roles && roles.length > 0 ? (
                            roles.map((role) => (
                                <span 
                                    key={role.id} 
                                    className="rounded px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider border"
                                    style={{ 
                                        backgroundColor: `${role.color || '#949ba4'}15`, 
                                        borderColor: `${role.color || '#949ba4'}40`,
                                        color: role.color || '#dbdee1'
                                    }}
                                >
                                    {role.name}
                                </span>
                            ))
                        ) : (
                            <span className="rounded bg-slate-200 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                User
                            </span>
                        )}
                        <span className="rounded bg-slate-200 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:bg-slate-800 dark:text-slate-300">Lvl {user?.level || 1}</span>
                        {user?.xp !== undefined && (
                            <span className="rounded bg-brand-purple/10 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-brand-purple">
                                {user?.xp} XP
                            </span>
                        )}
                    </div>
                </div>

                <div className="space-y-3 max-h-50 overflow-y-auto pr-1 custom-scrollbar">
                    <div className="space-y-1">
                        <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">About Me</h3>
                        <p className="min-h-5 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                            {user?.bio || <span className="text-xs italic text-slate-400">No bio yet...</span>}
                        </p>
                    </div>

                    <div className="space-y-1">
                        <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Bbrains Member Since</h3>
                        <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="2" />
                                <path strokeWidth="2" d="M16 2v4M8 2v4M3 10h18" />
                            </svg>
                            <span>
                                {hasJoinedDate
                                    ? joinedDate?.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
                                    : "Just recently"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-t border-slate-200 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/60">
                <div className="relative">
                    <input
                        className="w-full border-none bg-transparent p-0 text-xs italic text-slate-500 outline-none placeholder:text-slate-400 focus:ring-0 dark:text-slate-400 dark:placeholder:text-slate-600"
                        placeholder="Click to add a custom status note..."
                        type="text"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            </div>
        </div>
    )
}

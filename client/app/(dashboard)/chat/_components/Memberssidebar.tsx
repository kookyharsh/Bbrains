"use client"

import React, { useMemo } from "react"
import type { Member } from "../data"
import { ROLE_ORDER, ROLE_LABELS } from "../data"
import { Crown, ArrowLeft } from "lucide-react"

const MemberRow = React.memo(function MemberRow({
    member,
    onOpenProfile,
    isCurrentUser,
}: {
    member: Member
    onOpenProfile: (userId: string) => void
    isCurrentUser?: boolean
}) {
    const isOffline = member.status === "offline"
    const statusColor = member.status === "online"
        ? "bg-green-500"
        : member.status === "idle" ? "bg-yellow-500" : "bg-gray-400"

    return (
        <div
            className={`flex items-center gap-3 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors group ${isOffline ? "opacity-60" : ""}`}
            onClick={() => onOpenProfile(member.id)}
        >
            <div className="relative">
                <img
                    alt={`${member.name} avatar`}
                    className="w-8 h-8 rounded-full object-cover"
                    src={member.avatar || `https://ui-avatars.com/api/?name=${member.name}&background=random`}
                />
                <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 ${statusColor} border-2 border-white dark:border-gray-800 rounded-full`}></div>
            </div>
            <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                    <span
                        className={`font-medium text-sm truncate 
                        ${member.role === 'admin' ? "text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white"
                                : member.badge?.toLowerCase() === 'teacher' ? "text-red-600 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300"
                                    : "text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white"}`}
                    >
                        {member.name} {isCurrentUser ? "(You)" : ""}
                    </span>
                    {member.role === "admin" && (
                        <Crown className="h-3 w-3 shrink-0 text-yellow-500" />
                    )}
                </div>
            </div>
        </div>
    )
})

interface MembersSidebarProps {
    members: Member[]
    onClose: () => void
    onOpenProfile: (userId: string) => void
}

export const Memberssidebar = React.memo(function MembersSidebar({ members, onClose, onOpenProfile }: MembersSidebarProps) {
    const grouped = useMemo(
        () =>
            members.reduce<Record<Member["role"], Member[]>>(
                (acc, m) => { acc[m.role].push(m); return acc },
                { admin: [], moderator: [], member: [] }
            ),
        [members]
    )

    return (
        <aside className="w-full lg:w-60 bg-gray-50 dark:bg-gray-800/50 border-l border-gray-200 dark:border-gray-800 flex flex-col shrink-0 absolute inset-0 z-20 lg:relative lg:inset-auto lg:z-auto">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3">
                <button
                    onClick={onClose}
                    className="lg:hidden text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <h3 className="font-semibold text-gray-900 dark:text-white">Members</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {ROLE_ORDER.map((role) =>
                    grouped[role].length > 0 ? (
                        <div key={role}>
                            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                                {ROLE_LABELS[role]} — {grouped[role].length}
                            </h4>
                            <div className="space-y-2">
                                {grouped[role].map((member) => (
                                    <MemberRow
                                        key={member.id}
                                        member={member}
                                        onOpenProfile={onOpenProfile}
                                    />
                                ))}
                            </div>
                        </div>
                    ) : null
                )}
            </div>
        </aside>
    )
})

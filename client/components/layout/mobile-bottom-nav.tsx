"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getSidebarGroups, resolveRole } from "./sidebarData"
import type { Role } from "./sidebarData"
import React from "react"

interface MobileBottomNavProps {
    user?: {
        id?: string;
        email?: string;
        imageUrl?: string;
        firstName?: string;
        lastName?: string;
        fullName?: string;
        username?: string;
        type?: string;
        appRole?: string;
        roles?: string[];
        bio?: string;
        level?: number;
        xp?: number;
        createdAt?: string;
    } | null;
}

export function MobileBottomNav({ user }: MobileBottomNavProps) {
    const pathname = usePathname()
    const router = useRouter()

    const userRoles = user?.roles || [user?.appRole || user?.type || "student"].filter(Boolean)
    const resolvedRoles = resolveRole(userRoles) as Role[]
    const navItems = getSidebarGroups(resolvedRoles).flatMap(g => g.items)

    return (
        <div
            className="md:hidden fixed bottom-0 left-0 right-0 z-[var(--z-bottom-nav)] pb-safe"
            style={{
                background: "linear-gradient(180deg, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.92) 100%)",
                backdropFilter: "blur(24px) saturate(180%)",
                WebkitBackdropFilter: "blur(24px) saturate(180%)",
                borderTop: "1px solid rgba(0,0,0,0.06)",
                boxShadow: "0 -4px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.6)",
            }}
        >
            <div className="hidden dark:block absolute inset-0 pointer-events-none"
                style={{
                    background: "linear-gradient(180deg, rgba(30,30,40,0.85) 0%, rgba(20,20,30,0.95) 100%)",
                }}
            />

            <div className="relative z-10 flex h-16">
                <Link
                    href="/profile"
                    className="flex flex-col items-center justify-center w-16 h-full gap-0.5 shrink-0 select-none touch-manipulation"
                >
                    <div
                        className="rounded-full"
                        style={{
                            padding: "2px",
                            border: pathname.startsWith("/profile")
                                ? "2px solid #6C5CE7"
                                : "2px solid transparent",
                            transform: pathname.startsWith("/profile") ? "scale(1.1)" : "scale(1)",
                            boxShadow: pathname.startsWith("/profile")
                                ? "0 2px 8px rgba(108,92,231,0.25)"
                                : "none",
                            transition: "all 280ms cubic-bezier(0.34, 1.56, 0.64, 1)",
                        }}
                    >
                        <Avatar className="w-6 h-6 rounded-full border border-background">
                            <AvatarImage src={user?.imageUrl || undefined} className="object-cover" />
                            <AvatarFallback className="bg-brand-purple text-white font-black text-[10px] uppercase">
                                {user?.firstName?.[0] || user?.username?.[0] || "U"}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                    <span
                        className="text-[10px] font-black uppercase tracking-tighter"
                        style={{
                            color: pathname.startsWith("/profile") ? "#6C5CE7" : "var(--muted-foreground, #9ca3af)",
                            opacity: pathname.startsWith("/profile") ? 1 : 0.6,
                            transition: "all 280ms cubic-bezier(0.34, 1.56, 0.64, 1)",
                        }}
                    >You</span>
                </Link>

                <div className="w-px h-8 bg-border/40 self-center shrink-0" />

                <div className="flex-1 flex items-center overflow-x-auto scrollbar-hide"
                    style={{
                        overscrollBehaviorX: "contain",
                        WebkitOverflowScrolling: "touch",
                    }}
                >
                    {navItems.map((item) => {
                        const isActive = pathname === item.url ||
                            (item.url !== "/dashboard" && pathname.startsWith(`${item.url}/`))
                        const Icon = item.icon

                        return (
                            <button
                                key={item.url}
                                type="button"
                                className="flex flex-col items-center justify-center shrink-0 h-full gap-0.5 select-none touch-manipulation"
                                style={{ width: 64 }}
                                onClick={() => router.push(item.url)}
                            >
                                <div
                                    className="rounded-xl flex items-center justify-center"
                                    style={{
                                        padding: isActive ? "6px" : "5px",
                                        transform: isActive ? "scale(1.1)" : "scale(0.9)",
                                        opacity: isActive ? 1 : 0.45,
                                        background: isActive
                                            ? "rgba(108,92,231,0.12)"
                                            : "transparent",
                                        transition: "all 280ms cubic-bezier(0.34, 1.56, 0.64, 1)",
                                    }}
                                >
                                    <Icon
                                        style={{
                                            width: 20,
                                            height: 20,
                                            color: isActive ? "#6C5CE7" : "var(--muted-foreground, #9ca3af)",
                                            strokeWidth: isActive ? 2.5 : 2,
                                            transition: "color 200ms, stroke-width 200ms",
                                        }}
                                    />
                                </div>
                                <span
                                    className="text-[10px] font-bold truncate px-1"
                                    style={{
                                        color: isActive ? "#6C5CE7" : "var(--muted-foreground, #9ca3af)",
                                        opacity: isActive ? 1 : 0,
                                        transform: isActive ? "translateY(0)" : "translateY(2px)",
                                        transition: "all 280ms cubic-bezier(0.34, 1.56, 0.64, 1)",
                                        maxHeight: isActive ? "16px" : "0px",
                                        overflow: "hidden",
                                    }}
                                >
                                    {item.title.split('/')[0]}
                                </span>
                            </button>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

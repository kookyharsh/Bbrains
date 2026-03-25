"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getSidebarGroups, resolveSidebarRole, SidebarUserRoleContext } from "./sidebarData"
import React, { useRef, useEffect, useCallback } from "react"

interface MobileBottomNavProps {
    user?: SidebarUserRoleContext & {
        imageUrl?: string;
        firstName?: string;
        username?: string;
    };
}

export function MobileBottomNav({ user }: MobileBottomNavProps) {
    const pathname = usePathname()
    const router = useRouter()
    const scrollRef = useRef<HTMLDivElement>(null)
    const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
    const isUserScrolling = useRef(false)

    const role = resolveSidebarRole(user)
    const navItems = getSidebarGroups(role, user?.isSuperAdmin || false).flatMap(g => g.items)

    const ITEM_WIDTH = 80 // px — must match min-w below

    // Scroll to the item matching current pathname on mount / route change
    useEffect(() => {
        const container = scrollRef.current
        if (!container) return

        const index = navItems.findIndex(
            item => pathname === item.url || (item.url !== "/dashboard" && pathname.startsWith(`${item.url}/`))
        )
        if (index === -1) return

        // Center the active item
        const containerWidth = container.clientWidth
        const targetScroll = index * ITEM_WIDTH - containerWidth / 2 + ITEM_WIDTH / 2

        // Don't fight the user if they're mid-scroll
        if (!isUserScrolling.current) {
            container.scrollTo({ left: targetScroll, behavior: "smooth" })
        }
    }, [pathname, navItems])

    const getCenteredIndex = useCallback(() => {
        const container = scrollRef.current
        if (!container) return -1
        const center = container.scrollLeft + container.clientWidth / 2
        return Math.round((center - ITEM_WIDTH / 2) / ITEM_WIDTH)
    }, [])

    const handleScroll = useCallback(() => {
        isUserScrolling.current = true

        if (scrollTimeout.current) clearTimeout(scrollTimeout.current)

        // Detect scroll-stop after 120ms (camera app feel)
        scrollTimeout.current = setTimeout(() => {
            isUserScrolling.current = false
            const index = getCenteredIndex()
            if (index >= 0 && index < navItems.length) {
                const target = navItems[index]
                if (target && pathname !== target.url) {
                    router.push(target.url)
                }
            }
        }, 120)
    }, [getCenteredIndex, navItems, pathname, router])

    useEffect(() => {
        return () => {
            if (scrollTimeout.current) clearTimeout(scrollTimeout.current)
        }
    }, [])

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-[var(--z-nav)] bg-ui-light-surface/95 dark:bg-ui-dark-surface/95 border-t border-border/60 backdrop-blur pb-safe flex h-16 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">

            {/* Snap-scroll nav */}
            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex-1 flex items-center overflow-x-auto scrollbar-hide px-[calc(50%-40px)] gap-0 scroll-smooth"
                style={{ scrollSnapType: "x mandatory" }}
            >
                {navItems.map((item) => {
                    const isActive = pathname === item.url ||
                        (item.url !== "/dashboard" && pathname.startsWith(`${item.url}/`))
                    const Icon = item.icon

                    return (
                        <div
                            key={item.url}
                            className="flex flex-col items-center justify-center shrink-0 h-full gap-1 transition-all cursor-pointer"
                            style={{ minWidth: ITEM_WIDTH, scrollSnapAlign: "center" }}
                            onClick={() => router.push(item.url)}
                        >
                            <div className={`p-1.5 rounded-xl transition-all duration-200 ${
                                isActive ? "bg-brand-purple/10 dark:bg-brand-mint/10 scale-110" : "scale-90 opacity-50"
                            }`}>
                                <Icon
                                    className={`w-5 h-5 transition-colors duration-200 ${
                                        isActive ? "text-brand-purple dark:text-brand-mint" : "text-muted-foreground"
                                    }`}
                                    strokeWidth={isActive ? 2.5 : 2}
                                />
                            </div>
                            <span className={`text-[10px] font-bold truncate px-1 max-w-full transition-all duration-200 ${
                                isActive
                                    ? "text-brand-purple dark:text-brand-mint opacity-100"
                                    : "text-muted-foreground opacity-0"
                            }`}>
                                {item.title.split('/')[0]}
                            </span>
                        </div>
                    )
                })}
            </div>

            {/* Pinned Divider */}
            <div className="w-px h-8 bg-border/50 self-center mx-1 shadow-sm shrink-0" />

            {/* Pinned Profile tab */}
            <Link
                href="/profile"
                className={`flex flex-col items-center justify-center min-w-[72px] h-full gap-1 transition-all shrink-0 ${
                    pathname.startsWith("/profile")
                        ? "text-brand-purple dark:text-brand-mint bg-muted/30"
                        : "text-muted-foreground active:scale-95"
                }`}
            >
                <div className={`p-[2px] rounded-full border-2 transition-all ${
                    pathname.startsWith("/profile")
                        ? "border-brand-purple dark:border-brand-mint scale-110 shadow-sm"
                        : "border-transparent"
                }`}>
                    <Avatar className="w-6 h-6 rounded-full border border-background">
                        <AvatarImage src={user?.imageUrl} className="object-cover" />
                        <AvatarFallback className="bg-brand-purple text-white font-black text-[10px] uppercase">
                            {user?.firstName?.[0] || user?.username?.[0] || "U"}
                        </AvatarFallback>
                    </Avatar>
                </div>
                <span className={`text-[10px] font-black uppercase tracking-tighter ${
                    pathname.startsWith("/profile") ? "opacity-100" : "opacity-70"
                }`}>You</span>
            </Link>
        </div>
    )
}

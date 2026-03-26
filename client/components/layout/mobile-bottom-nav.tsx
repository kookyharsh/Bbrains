"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getSidebarGroups, resolveSidebarRole, SidebarUserRoleContext, SidebarItem } from "./sidebarData"
import React, { useRef, useEffect, useCallback, useState } from "react"

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
    const [focusedIndex, setFocusedIndex] = useState(-1)
    const [mounted, setMounted] = useState(false)

    const role = resolveSidebarRole(user)
    const groups = getSidebarGroups(role, user?.isSuperAdmin || false)
    
    // Flatten with indicators for dividers
    const navItemsWithDividers: (SidebarItem | { type: 'divider' })[] = []
    groups.forEach((group, gIdx) => {
        group.items.forEach((item, iIdx) => {
            navItemsWithDividers.push(item)
        })
        if (gIdx < groups.length - 1) {
            navItemsWithDividers.push({ type: 'divider' })
        }
    })

    const ITEM_WIDTH = 72 // Compact width for better mobile fit
    const DIVIDER_WIDTH = 24 // Width of the sectional divider

    const getCenteredIndex = useCallback(() => {
        const container = scrollRef.current
        if (!container) return -1
        const scrollLeft = container.scrollLeft
        const containerWidth = container.clientWidth
        const center = scrollLeft + containerWidth / 2
        
        let currentPos = 0
        for (let i = 0; i < navItemsWithDividers.length; i++) {
            const width = 'type' in navItemsWithDividers[i] ? DIVIDER_WIDTH : ITEM_WIDTH
            if (center >= currentPos && center < currentPos + width) {
                return i
            }
            currentPos += width
        }
        return -1
    }, [navItemsWithDividers])

    const handleScroll = useCallback(() => {
        isUserScrolling.current = true
        
        // Real-time focus highlight
        const index = getCenteredIndex()
        setFocusedIndex(index)

        if (scrollTimeout.current) clearTimeout(scrollTimeout.current)

        scrollTimeout.current = setTimeout(() => {
            isUserScrolling.current = false
            const finalIndex = getCenteredIndex()
            if (finalIndex >= 0 && finalIndex < navItemsWithDividers.length) {
                const target = navItemsWithDividers[finalIndex]
                if (target && !('type' in target) && pathname !== target.url) {
                    router.push(target.url)
                }
            }
        }, 150)
    }, [getCenteredIndex, navItemsWithDividers, pathname, router])

    useEffect(() => {
        setMounted(true)
        // Initial focus
        const index = navItemsWithDividers.findIndex(
            item => !('type' in item) && (pathname === item.url || (item.url !== "/dashboard" && pathname.startsWith(`${item.url}/`)))
        )
        setFocusedIndex(index)
    }, [pathname, navItemsWithDividers])

    // Scroll active item to center on route change
    useEffect(() => {
        if (!mounted || isUserScrolling.current) return
        const container = scrollRef.current
        if (!container) return

        const index = navItemsWithDividers.findIndex(
            item => !('type' in item) && (pathname === item.url || (item.url !== "/dashboard" && pathname.startsWith(`${item.url}/`)))
        )
        if (index === -1) return

        let targetPos = 0
        for (let i = 0; i < index; i++) {
            targetPos += 'type' in navItemsWithDividers[i] ? DIVIDER_WIDTH : ITEM_WIDTH
        }
        
        const containerWidth = container.clientWidth
        const scrollTarget = targetPos + ITEM_WIDTH / 2 - containerWidth / 2
        
        container.scrollTo({ left: scrollTarget, behavior: "smooth" })
    }, [pathname, navItemsWithDividers, mounted])

    return (
        <div className="md:hidden fixed bottom-1.5 left-4 right-4 z-[var(--z-nav)] bg-ui-light-surface/90 dark:bg-ui-dark-surface/90 border border-border/40 backdrop-blur-xl h-14 rounded-2xl shadow-lg flex items-center overflow-hidden">
            
            {/* Pinned Logo/Sidebar Trigger */}
            <div className="flex items-center justify-center min-w-[52px] h-full border-r border-border/20 z-10 transition-colors">
                <div className="w-8 h-8 rounded-full bg-brand-purple flex items-center justify-center text-white shadow-sm active:scale-95 transition-transform cursor-pointer">
                    <span className="font-black text-xs">N</span>
                </div>
            </div>

            {/* Scrollable Container Wrapper for precise centering */}
            <div className="flex-1 relative h-full flex items-center overflow-hidden">
                {/* Selection Focus indicator — now centered to the FLEX-1 area */}
                <div className="absolute left-1/2 -translate-x-1/2 top-1 bottom-1 w-[60px] border border-brand-purple/20 bg-brand-purple/5 pointer-events-none rounded-xl z-0" />

                {/* Snap-scroll nav */}
                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="flex-1 flex items-center overflow-x-auto scrollbar-hide px-[calc(50%-36px)] scroll-smooth h-full z-10"
                    style={{ scrollSnapType: "x mandatory" }}
                >
                    {navItemsWithDividers.map((item, index) => {
                        if ('type' in item) {
                            return (
                                <div 
                                    key={`divider-${index}`} 
                                    className="shrink-0 flex items-center justify-center opacity-30"
                                    style={{ width: DIVIDER_WIDTH, scrollSnapAlign: "center" }}
                                >
                                    <div className="w-[1.5px] h-6 bg-muted-foreground/30 rounded-full" />
                                </div>
                            )
                        }

                        const isActive = pathname === item.url ||
                            (item.url !== "/dashboard" && pathname.startsWith(`${item.url}/`))
                        const isFocused = focusedIndex === index
                        const Icon = item.icon

                        return (
                            <div
                                key={item.url}
                                className="flex flex-col items-center justify-center shrink-0 h-full gap-0.5 transition-all cursor-pointer relative"
                                style={{ width: ITEM_WIDTH, scrollSnapAlign: "center" }}
                                onClick={() => router.push(item.url)}
                            >
                                <div className={`p-1.5 rounded-lg transition-all duration-300 ${
                                    isFocused || isActive ? "scale-110" : "scale-90 opacity-40 grayscale-[0.8]"
                                }`}>
                                    <Icon
                                        className={`w-5 h-5 transition-colors duration-200 ${
                                            isActive || isFocused ? "text-brand-purple dark:text-brand-mint" : "text-muted-foreground"
                                        }`}
                                        strokeWidth={isActive || isFocused ? 2.5 : 2}
                                    />
                                </div>
                                <span className={`text-[9px] font-black uppercase tracking-tighter truncate px-1 max-w-full transition-all duration-300 ${
                                    isFocused || isActive
                                        ? "text-brand-purple dark:text-brand-mint opacity-100"
                                        : "opacity-0"
                                }`}>
                                    {item.title.split('/')[0]}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Profile Section */}
            <div className="flex items-center h-full border-l border-border/20 z-10">
                <Link
                    href="/profile"
                    className={`flex flex-col items-center justify-center min-w-[64px] h-full gap-0.5 transition-all shrink-0 ${
                        pathname.startsWith("/profile")
                            ? "text-brand-purple dark:text-brand-mint"
                            : "text-muted-foreground/60 active:scale-95"
                    }`}
                >
                    <div className={`p-[1.5px] rounded-full border-2 transition-all ${
                        pathname.startsWith("/profile")
                            ? "border-brand-purple dark:border-brand-mint scale-105"
                            : "border-transparent"
                    }`}>
                        <Avatar className="w-5 h-5 rounded-full border border-background">
                            <AvatarImage src={user?.imageUrl} className="object-cover" />
                            <AvatarFallback className="bg-brand-purple text-white font-black text-[8px] uppercase">
                                {user?.firstName?.[0] || user?.username?.[0] || "U"}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-tighter ${
                        pathname.startsWith("/profile") ? "opacity-100" : "opacity-0"
                    }`}>YOU</span>
                </Link>
            </div>
        </div>
    )
}

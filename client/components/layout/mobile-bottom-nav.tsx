"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { baseSidebarItems, adminExtraItems, teacherExtraItems } from "./sidebarData"
import React from "react"

interface MobileBottomNavProps {
    user?: any;
}

export function MobileBottomNav({ user }: MobileBottomNavProps) {
    const pathname = usePathname()
    
    const userType = user?.type?.toLowerCase() || 'student'
    const extraItems = userType === 'admin' ? adminExtraItems : userType === 'teacher' ? teacherExtraItems : []
    
    // Combine all items for the scrollable part
    const navItems = [...extraItems, ...baseSidebarItems]

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-[var(--z-nav)] bg-ui-light-surface/95 dark:bg-ui-dark-surface/95 border-t border-border/60 backdrop-blur pb-safe flex h-16 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
            {/* Scrollable Main Nav */}
            <div className="flex-1 flex items-center overflow-x-auto scrollbar-hide px-2 gap-1 snap-x">
                {navItems.map((item) => {
                    const isActive = pathname === item.url || (item.url !== "/dashboard" && pathname.startsWith(`${item.url}/`))
                    const Icon = item.icon
                    
                    return (
                        <Link
                            key={item.url}
                            href={item.url}
                            className={`flex flex-col items-center justify-center min-w-[72px] h-full gap-1 transition-all snap-center ${
                                isActive 
                                    ? "text-brand-purple dark:text-brand-mint" 
                                    : "text-muted-foreground active:scale-95"
                            }`}
                        >
                            <div className={`p-1.5 rounded-xl transition-colors ${isActive ? "bg-brand-purple/10 dark:bg-brand-mint/10" : ""}`}>
                                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                            <span className={`text-[10px] font-bold truncate px-1 max-w-full ${isActive ? "opacity-100" : "opacity-70"}`}>
                                {item.title.split('/')[0]}
                            </span>
                        </Link>
                    )
                })}
            </div>
            
            {/* Pinned Divider */}
            <div className="w-px h-8 bg-border/50 self-center mx-1 shadow-sm" />

            {/* Pinned Profile/You Tab */}
            <Link
                href="/profile"
                className={`flex flex-col items-center justify-center min-w-[72px] h-full gap-1 transition-all shrink-0 ${
                    pathname.startsWith("/profile")
                        ? "text-brand-purple dark:text-brand-mint bg-muted/30" 
                        : "text-muted-foreground active:scale-95"
                }`}
            >
                <div className={`p-[2px] rounded-full border-2 transition-all ${pathname.startsWith("/profile") ? "border-brand-purple dark:border-brand-mint scale-110 shadow-sm" : "border-transparent"}`}>
                    <Avatar className="w-6 h-6 rounded-full border border-background">
                        <AvatarImage src={user?.imageUrl} className="object-cover" />
                        <AvatarFallback className="bg-brand-purple text-white font-black text-[10px] uppercase">
                            {user?.firstName?.[0] || user?.username?.[0] || "U"}
                        </AvatarFallback>
                    </Avatar>
                </div>
                <span className={`text-[10px] font-black uppercase tracking-tighter ${pathname.startsWith("/profile") ? "opacity-100" : "opacity-70"}`}>You</span>
            </Link>
        </div>
    )
}

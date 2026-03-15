"use client"

import React from 'react'
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Settings
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { baseSidebarItems as navItems } from "./sidebarData"

export function MobileBottomNav({ user }: { user?: any }) {
    const pathname = usePathname()

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[var(--z-bottom-nav)] bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-t md:hidden safe-area-bottom">
            <div className="flex items-center h-16">
                {/* Scrollable Menu Items (Fix 2: Using sidebarData) */}
                <div className="flex-1 overflow-x-auto scrollbar-hide px-2">
                    <div className="flex gap-1 py-2">
                        {navItems.map((item) => {
                            const isActive = pathname === item.url || pathname.startsWith(`${item.url}/`)
                            return (
                                <Link
                                    key={item.url}
                                    href={item.url}
                                    className={`
                                        flex flex-col items-center justify-center min-w-[64px] h-11 px-3 rounded-xl transition-all duration-200
                                        ${isActive
                                            ? "text-brand-purple bg-brand-purple/10 font-medium"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted"}
                                    `}
                                >
                                    <item.icon className={`h-5 w-5 ${isActive ? "scale-110" : ""}`} />
                                    <span className="text-[10px] mt-1 line-clamp-1">{item.title}</span>
                                </Link>
                            )
                        })}
                    </div>
                </div>

                {/* Profile Button - Fixed at right (Fix 2: Using actual user data) */}
                <div className="flex items-center px-4 border-l border-border/50">
                    <Link href="/settings">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded-full"
                        >
                            {user ? (
                                <Avatar className="h-8 w-8 border border-border">
                                    <AvatarImage src={user.imageUrl} />
                                    <AvatarFallback className="text-[10px] bg-brand-mint/20 text-brand-mint">
                                        {user.firstName?.[0]}{user.lastName?.[0]}
                                    </AvatarFallback>
                                </Avatar>
                            ) : (
                                <Settings className="h-5 w-5 text-muted-foreground" />
                            )}
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}

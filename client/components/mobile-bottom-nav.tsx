"use client"

import React from 'react'
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useUser, useClerk } from "@clerk/nextjs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
    Calendar,
    Home,
    MessageSquare,
    Megaphone,
    Wallet,
    Book,
    ShoppingCart,
    Settings,
    ChevronUp
} from "lucide-react"
import { Button } from "@/components/ui/button"

const navItems = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: Home,
    },
    {
        title: "Announcements",
        url: "/announcements",
        icon: Megaphone,
    },
    {
        title: "Assignments",
        url: "/assignments",
        icon: Book,
    },
    {
        title: "Market",
        url: "/market",
        icon: ShoppingCart,
    },
    {
        title: "Wallet",
        url: "/wallet",
        icon: Wallet,
    },
    {
        title: "Chat",
        url: "/chat",
        icon: MessageSquare,
    },
    {
        title: "Calendar",
        url: "/calendar",
        icon: Calendar,
    },
]

export function MobileBottomNav() {
    const pathname = usePathname()
    const { user } = useUser()
    const { openUserProfile } = useClerk()

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden">
            <div className="flex items-center h-16">
                {/* Scrollable Menu Items */}
                <div className="flex-1 overflow-x-auto scrollbar-hide px-2">
                    <div className="flex gap-1 py-2">
                        {navItems.map((item) => {
                            const isActive = pathname === item.url
                            return (
                                <Link
                                    key={item.url}
                                    href={item.url}
                                    className={`
                                        flex flex-col items-center justify-center min-w-[60px] h-10 px-3 rounded-lg transition-colors
                                        ${isActive 
                                            ? "text-primary bg-primary/10" 
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted"}
                                    `}
                                >
                                    <item.icon className="h-5 w-5" />
                                </Link>
                            )
                        })}
                    </div>
                </div>
                
                {/* Profile Button - Fixed at right */}
                <div className="flex items-center px-3 border-l">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openUserProfile()}
                        className="h-10 w-10 rounded-full"
                    >
                        {user ? (
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={user.imageUrl} />
                                <AvatarFallback className="text-xs">
                                    {user.firstName?.[0]}{user.lastName?.[0]}
                                </AvatarFallback>
                            </Avatar>
                        ) : (
                            <Settings className="h-5 w-5" />
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}

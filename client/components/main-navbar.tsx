"use client"

import { Bell, LogOut, User, BarChart3 } from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/client"
import { useNotifications } from "./providers/notification-provider"

import { ModeToggle } from "./mode-toggle"
import { SidebarTrigger } from "./ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"

export function MainNavbar({ user }: { user?: any }) {
    const router = useRouter()
    const { unreadCount } = useNotifications()

    const handleLogout = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push("/auth/login")
    }

    return (
        <nav className="sticky top-0 z-[var(--z-nav)] flex h-16 md:h-20 w-full items-center border-b bg-ui-light-surface/95 dark:bg-ui-dark-surface/95 px-4 md:px-8 backdrop-blur supports-backdrop-filter:bg-ui-light-surface/60 dark:supports-backdrop-filter:bg-ui-dark-surface/60">
            {/* Left Section: Sidebar Trigger and Mobile Logo (Fix 4) */}
            <div className="flex flex-1 items-center gap-4">
                <SidebarTrigger className="h-9 w-9 md:h-10 md:w-10 rounded-full border border-border/60 bg-background/80 shadow-sm backdrop-blur-sm hover:bg-muted" />
                
                {/* Mobile-only identity (Fix 4) */}
                <div className="flex md:hidden items-center gap-2">
                    <div className="w-8 h-8 bg-brand-purple rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm">
                        <BarChart3 className="h-4 w-4" />
                    </div>
                    <span className="font-bold text-lg tracking-tight">Bbrains</span>
                </div>
            </div>

            {/* Center Section: College Name - Flexbox centering instead of absolute (Fix 3) */}
            <div className="hidden lg:flex flex-[2] items-center justify-center px-4">
                <span className="text-sm font-semibold tracking-wide text-foreground text-center line-clamp-1">
                    Bharati Vidyapeeth College of Engineering
                </span>
            </div>

            {/* Right Section - Notifications, Theme & Profile */}
            <div className="flex flex-1 items-center justify-end gap-2 md:gap-6">
                <div className="flex items-center gap-1 md:gap-2">
                    <ModeToggle />
                    <button className="relative w-9 h-9 md:w-10 md:h-10 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-full border border-gray-100 dark:border-gray-800 transition-colors">
                        <Bell className="h-4 w-4 md:h-5 md:w-5" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 md:top-2 md:right-2 h-3.5 w-3.5 md:h-4 md:w-4 bg-red-500 rounded-full border-2 border-white dark:border-gray-950 text-[8px] md:text-[10px] font-bold text-white flex items-center justify-center">
                                {unreadCount > 9 ? "9+" : unreadCount}
                            </span>
                        )}
                    </button>
                </div>

                <div className="flex items-center gap-2 md:gap-3 md:pl-6 md:border-l border-gray-100 dark:border-gray-800">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="h-9 w-9 md:h-10 md:w-10 outline-none rounded-full flex items-center justify-center">
                                <Avatar className="h-8 w-8 md:h-10 md:w-10 rounded-full border border-gray-100 dark:border-gray-800 shadow-sm transition-opacity hover:opacity-80">
                                    <AvatarImage src={user?.imageUrl} />
                                    <AvatarFallback className="bg-brand-mint/20 text-brand-mint font-bold text-[10px] md:text-xs uppercase">
                                        {user?.firstName?.[0] || ""}{user?.lastName?.[0] || user?.username?.[0] || "U"}
                                    </AvatarFallback>
                                </Avatar>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 mt-2 z-[var(--z-modal)]">
                            <DropdownMenuItem asChild className="cursor-pointer py-2.5">
                                <Link href="/settings" className="flex items-center">
                                    <User className="mr-2 h-4 w-4" />
                                    <span>View Profile</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-950/50 cursor-pointer py-2.5">
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Logout</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </nav>
    )
}

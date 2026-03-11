"use client"

import { Bell, LogOut, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/client"

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

    const handleLogout = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push("/auth/login")
    }
    return (
        <nav className="sticky top-0 z-40 hidden md:flex min-h-20 w-full items-center justify-between border-b bg-ui-light-surface/95 dark:bg-ui-dark-surface/95 px-8 py-4 backdrop-blur supports-backdrop-filter:bg-ui-light-surface/60 dark:supports-backdrop-filter:bg-ui-dark-surface/60">
            <SidebarTrigger className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full border border-border/60 bg-background/80 shadow-sm backdrop-blur-sm hover:bg-muted" />
            {/* Left spacer for symmetry */}
            <div className="flex-1" />

            {/* Center: College Name */}
            <div className="absolute left-1/2 -translate-x-1/2">
                <span className="text-sm font-semibold tracking-wide text-foreground">
                    Bharati Vidyapeeth College of Engineering
                </span>
            </div>

            {/* Right Section - Notifications, Theme & Profile */}
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <ModeToggle />
                    <button className="relative w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-full border border-gray-100 dark:border-gray-800 transition-colors">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-950"></span>
                    </button>
                </div>

                <div className="flex items-center gap-3 pl-6 border-l border-gray-100 dark:border-gray-800">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="h-10 w-10 outline-none rounded-full flex items-center justify-center">
                                <Avatar className="h-10 w-10 rounded-full border border-gray-100 dark:border-gray-800 shadow-sm transition-opacity hover:opacity-80">
                                    <AvatarImage src={user?.imageUrl} />
                                    <AvatarFallback className="bg-brand-mint/20 text-brand-mint font-bold text-xs uppercase">
                                        {user?.firstName?.[0] || ""}{user?.lastName?.[0] || user?.username?.[0] || "U"}
                                    </AvatarFallback>
                                </Avatar>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 mt-2">
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

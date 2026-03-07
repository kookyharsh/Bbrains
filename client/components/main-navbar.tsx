"use client"

import { UserButton } from "@clerk/nextjs"
import { Bell } from "lucide-react"

import { ModeToggle } from "./mode-toggle"
import { SidebarTrigger } from "./ui/sidebar"

export function MainNavbar() {
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
                    <UserButton
                        afterSignOutUrl="/"
                        appearance={{
                            elements: {
                                avatarBox: "h-10 w-10 rounded-full border border-gray-100 dark:border-gray-800 shadow-sm"
                            }
                        }}
                    />
                </div>
            </div>
        </nav>
    )
}

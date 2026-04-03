"use client"

import React, { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
    BarChart3,
    CalendarDays,
    ChevronRight,
    LayoutDashboard,
    LogOut,
    User,
} from "lucide-react"
import { getBaseUrl, setAuthToken } from "@/services/api/client"
import { NotificationsBell } from "@/components/shell/NotificationsBell"
import { ThemeSwitcher } from "@/components/shell/theme-switcher"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type NavbarUser = {
    imageUrl?: string
    firstName?: string
    lastName?: string
    fullName?: string
    username?: string
    type?: string
}

function toTitleCase(value: string) {
    return value
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase())
}

function buildPathLabels(pathname: string) {
    const segments = pathname
        .split("/")
        .filter(Boolean)
        .filter((segment) => segment !== "(dashboard)")

    if (segments.length === 0) {
        return ["Dashboard"]
    }

    const labels = segments.map((segment) => toTitleCase(segment))
    return labels[0] === "Dashboard" ? labels : ["Dashboard", ...labels]
}

function getPrimaryTitle(pathname: string) {
    const labels = buildPathLabels(pathname)
    return labels[labels.length - 1] || "Dashboard"
}

function getRoleLabel(type?: string) {
    if (!type) return "Workspace"
    return `${toTitleCase(type)} Panel`
}

export function MainNavbar({ user }: { user?: NavbarUser | null }) {
    const router = useRouter()
    const pathname = usePathname()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const breadcrumbLabels = useMemo(() => buildPathLabels(pathname), [pathname])
    const pageTitle = useMemo(() => getPrimaryTitle(pathname), [pathname])
    const todayLabel = useMemo(
        () =>
            new Intl.DateTimeFormat("en-IN", {
                weekday: "short",
                day: "numeric",
                month: "short",
            }).format(new Date()),
        []
    )

    const handleLogout = async () => {
        try {
            await fetch(`${getBaseUrl()}/logout`, { method: 'POST', credentials: 'include' })
        } catch (e) {
            console.error('Logout error:', e)
        }
        setAuthToken(null)
        router.push("/auth/login")
        router.refresh()
    }

    if (!mounted) {
        return (
            <nav className="sticky top-0 z-[var(--z-nav)] border-b border-border/60 bg-background/85 backdrop-blur-xl">
                <div className="mx-auto flex h-[76px] items-center gap-3 px-4 md:px-6">
                    <div className="h-11 w-11 rounded-2xl border border-border/70 bg-muted/40" />
                    <div className="min-w-0 flex-1 space-y-2">
                        <div className="h-4 w-40 rounded-full bg-muted/50" />
                        <div className="h-3 w-24 rounded-full bg-muted/40" />
                    </div>
                    <div className="h-11 w-24 rounded-2xl border border-border/70 bg-muted/40" />
                    <div className="h-11 w-11 rounded-2xl border border-border/70 bg-muted/40" />
                </div>
            </nav>
        )
    }

    return (
        <nav className="sticky top-0 z-[var(--z-nav)] border-b border-border/60 bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/65">
            <div className="mx-auto flex h-[76px] items-center gap-3 px-4 md:px-6">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                    <SidebarTrigger className="hidden md:flex h-11 w-11 rounded-2xl border border-border/70 bg-card/80 text-foreground shadow-sm transition hover:bg-card" />

                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 text-white shadow-[0_12px_30px_rgba(20,184,166,0.28)]">
                            <BarChart3 className="h-5 w-5" />
                        </div>

                        <div className="min-w-0">
                            <div className="hidden items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground md:flex">
                                <span>{getRoleLabel(user?.type)}</span>
                                <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
                                <span>{todayLabel}</span>
                            </div>

                            <div className="flex min-w-0 items-center gap-2">
                                <h1 className="truncate text-lg font-bold tracking-tight text-foreground md:text-xl">
                                    {pageTitle}
                                </h1>
                                <div className="hidden items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 md:flex dark:text-emerald-300">
                                    <LayoutDashboard className="h-3.5 w-3.5" />
                                    Live Workspace
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="hidden min-w-0 flex-[1.2] items-center justify-center xl:flex">
                    <div className="flex max-w-xl items-center gap-2 overflow-hidden rounded-2xl border border-border/70 bg-card/65 px-4 py-2.5 shadow-sm">
                        {breadcrumbLabels.map((label, index) => (
                            <React.Fragment key={`${label}-${index}`}>
                                {index > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
                                <span
                                    className={`truncate text-sm ${
                                        index === breadcrumbLabels.length - 1
                                            ? "font-semibold text-foreground"
                                            : "text-muted-foreground"
                                    }`}
                                >
                                    {label}
                                </span>
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                <div className="flex items-center justify-end gap-2 md:gap-3">
                    <div className="hidden items-center gap-2 rounded-2xl border border-border/70 bg-card/70 p-1 shadow-sm sm:flex">
                        <div className="rounded-xl bg-background/80">
                            <ThemeSwitcher />
                        </div>
                        <div className="rounded-xl bg-background/80">
                            <NotificationsBell />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:hidden">
                        <ThemeSwitcher />
                        <NotificationsBell />
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="group flex items-center gap-3 rounded-2xl border border-border/70 bg-card/80 px-2.5 py-2 shadow-sm transition hover:bg-card focus:outline-none focus:ring-2 focus:ring-ring">
                                <div className="hidden text-right md:block">
                                    <p className="max-w-[140px] truncate text-sm font-semibold text-foreground">
                                        {user?.fullName || user?.username || "Anonymous User"}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {getRoleLabel(user?.type)}
                                    </p>
                                </div>

                                <Avatar className="h-9 w-9 rounded-2xl border border-border/70 shadow-sm md:h-10 md:w-10">
                                    <AvatarImage src={user?.imageUrl || undefined} />
                                    <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-cyan-500 text-xs font-bold uppercase text-white">
                                        {user?.firstName?.[0] || ""}
                                        {user?.lastName?.[0] || user?.username?.[0] || "U"}
                                    </AvatarFallback>
                                </Avatar>
                            </button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="mt-2 w-64 rounded-2xl border-border/70 p-2">
                            <DropdownMenuLabel className="px-3 py-2">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10 rounded-2xl border border-border/70">
                                        <AvatarImage src={user?.imageUrl || undefined} />
                                        <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-cyan-500 text-xs font-bold uppercase text-white">
                                            {user?.firstName?.[0] || ""}
                                            {user?.lastName?.[0] || user?.username?.[0] || "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-foreground">
                                            {user?.fullName || user?.username || "Anonymous User"}
                                        </p>
                                        <p className="truncate text-xs text-muted-foreground">
                                            {getRoleLabel(user?.type)}
                                        </p>
                                    </div>
                                </div>
                            </DropdownMenuLabel>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem asChild className="cursor-pointer rounded-xl px-3 py-2.5">
                                <Link href="/profile" className="flex items-center">
                                    <User className="mr-2 h-4 w-4" />
                                    <span>View Profile</span>
                                </Link>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={handleLogout}
                                className="cursor-pointer rounded-xl px-3 py-2.5 text-red-600 focus:bg-red-50 focus:text-red-700 dark:focus:bg-red-950/40"
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Logout</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="border-t border-border/40 bg-gradient-to-r from-emerald-500/10 via-transparent to-cyan-500/10 px-4 py-2 md:hidden">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5" />
                    <span>{breadcrumbLabels.join(" / ")}</span>
                </div>
            </div>
        </nav>
    )
}

"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const pageTitleMap: Record<string, string> = {
    dashboard: "Dashboard",
    announcements: "Announcements",
    assignments: "Exam/Assignments",
    chat: "Chat",
    wallet: "Wallet",
    payments: "Payment History",
    calendar: "Calendar",
    market: "Market",
    tools: "Tools",
}

export function DashboardBreadcrumb() {
    const pathname = usePathname()

    // Split pathname into segments, e.g. "/dashboard" -> ["dashboard"]
    const segments = pathname.split("/").filter(Boolean)

    // Build breadcrumb items from segments
    const crumbs = segments.map((segment, index) => {
        const href = "/" + segments.slice(0, index + 1).join("/")
        const label = pageTitleMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
        const isLast = index === segments.length - 1
        return { href, label, isLast }
    })

    return (
        <div className="hidden md:flex items-center shrink-0 border-b border-border/40 bg-background/95 px-8 py-2.5">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground text-xs">
                                Home
                            </Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    {crumbs.map((crumb) => (
                        <span key={crumb.href} className="contents">
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                {crumb.isLast ? (
                                    <BreadcrumbPage className="text-xs font-medium">
                                        {crumb.label}
                                    </BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink asChild>
                                        <Link href={crumb.href} className="text-muted-foreground hover:text-foreground text-xs">
                                            {crumb.label}
                                        </Link>
                                    </BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                        </span>
                    ))}
                </BreadcrumbList>
            </Breadcrumb>
        </div>
    )
}

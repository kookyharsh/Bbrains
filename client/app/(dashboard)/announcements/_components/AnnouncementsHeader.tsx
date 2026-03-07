"use client"

import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface AnnouncementsHeaderProps {
    count: number
    searchQuery: string
    onSearchChange: (val: string) => void
}

export function AnnouncementsHeader({ count, searchQuery, onSearchChange }: AnnouncementsHeaderProps) {
    return (
        <div className="flex h-12 shrink-0 items-center justify-end gap-3 border-b border-border bg-ui-light-surface dark:bg-ui-dark-surface px-4 shadow-sm">
            <span className="text-xs font-medium text-muted-foreground">
                {count} total
            </span>
            <div className="relative">
                <Input
                    placeholder="Search announcements..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="h-7 w-40 rounded-md bg-muted px-2 pr-8 text-xs placeholder:text-muted-foreground outline-none transition-[width] focus:w-56"
                />
                <Search className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            </div>
        </div>
    )
}

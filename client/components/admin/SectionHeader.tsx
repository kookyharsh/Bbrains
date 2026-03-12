"use client"

import React from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export function SectionHeader({
    title,
    subtitle,
    action,
    actionLabel,
    actionIcon,
}: {
    title: string
    subtitle?: string
    action?: () => void
    actionLabel?: string
    actionIcon?: React.ReactNode
}) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <h2 className="text-lg font-bold text-foreground">{title}</h2>
                {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
            </div>
            {action && (
                <Button size="sm" className="gap-1.5" onClick={action}>
                    {actionIcon ?? <Plus className="size-3.5" />}
                    {actionLabel ?? "Add"}
                </Button>
            )}
        </div>
    )
}


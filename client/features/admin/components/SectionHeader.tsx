"use client"

import React from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

type ActionProps = (() => void) | { label?: string; icon?: React.ReactNode; onClick?: () => void } | undefined

export function SectionHeader({
    title,
    subtitle,
    action,
    actionLabel,
    actionIcon,
}: {
    title: string
    subtitle?: string
    action?: ActionProps
    actionLabel?: string
    actionIcon?: React.ReactNode
}) {
    // Handle action being either a function or an object
    const handleClick = () => {
        if (typeof action === 'function') {
            action();
        } else if (action?.onClick) {
            action.onClick();
        }
    };
    
    const buttonLabel = actionLabel || (typeof action === 'object' ? action.label : undefined);
    const buttonIcon = actionIcon || (typeof action === 'object' ? action.icon : undefined);

    return (
        <div className="flex items-center justify-between">
            <div>
                <h2 className="text-lg font-bold text-foreground">{title}</h2>
                {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
            </div>
            {(action || actionLabel) && (
                <Button size="sm" className="gap-1.5" onClick={handleClick}>
                    {buttonIcon ?? <Plus className="size-3.5" />}
                    {buttonLabel ?? "Add"}
                </Button>
            )}
        </div>
    )
}


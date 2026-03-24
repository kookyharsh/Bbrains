"use client"

import React from "react"
import { cn } from "@/lib/utils"

function FormField({
    label,
    children,
    required,
}: {
    label: string
    children: React.ReactNode
    required?: boolean
}) {
    return (
        <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">
                {label}
                {required && <span className="ml-0.5 text-destructive">*</span>}
            </label>
            {children}
        </div>
    )
}

export function FormSelect({
    label,
    required,
    options,
    value,
    onChange,
    disabled,
    className,
}: {
    label: string
    required?: boolean
    options: { value: string; label: string }[]
    value: string
    onChange: (v: string) => void
    disabled?: boolean
    className?: string
}) {
    return (
        <FormField label={label} required={required}>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className={cn("h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring", className)}
            >
                {options.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                ))}
            </select>
        </FormField>
    )
}


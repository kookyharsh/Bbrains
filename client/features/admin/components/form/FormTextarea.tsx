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

export function FormTextarea({
    label,
    required,
    value,
    onChange,
    rows = 3,
    placeholder,
    disabled,
    className,
}: {
    label: string
    required?: boolean
    value: string
    onChange: (v: string) => void
    rows?: number
    placeholder?: string
    disabled?: boolean
    className?: string
}) {
    return (
        <FormField label={label} required={required}>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                rows={rows}
                placeholder={placeholder}
                disabled={disabled}
                className={cn("w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none", className)}
            />
        </FormField>
    )
}


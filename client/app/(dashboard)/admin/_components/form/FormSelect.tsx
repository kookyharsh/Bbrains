"use client"

import React from "react"

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
}: {
    label: string
    required?: boolean
    options: { value: string; label: string }[]
    value: string
    onChange: (v: string) => void
}) {
    return (
        <FormField label={label} required={required}>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
                {options.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                ))}
            </select>
        </FormField>
    )
}


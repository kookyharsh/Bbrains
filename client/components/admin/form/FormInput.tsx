"use client"

import React from "react"
import { Input } from "@/components/ui/input"

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

export function FormInput(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
    const { label, required, ...rest } = props
    return (
        <FormField label={label} required={required}>
            <Input {...rest} className="h-9 text-sm" />
        </FormField>
    )
}


"use client"

import React from "react"

const roleColors: Record<string, string> = {
    admin: "bg-red-500/15 text-red-600 dark:text-red-400",
    teacher: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
    student: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    staff: "bg-green-500/15 text-green-600 dark:text-green-400",
    pending: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400",
    approved: "bg-green-500/15 text-green-600 dark:text-green-400",
    rejected: "bg-red-500/15 text-red-600 dark:text-red-400",
    success: "bg-green-500/15 text-green-600 dark:text-green-400",
    failed: "bg-red-500/15 text-red-600 dark:text-red-400",
    credit: "bg-green-500/15 text-green-600 dark:text-green-400",
    debit: "bg-red-500/15 text-red-600 dark:text-red-400",
    salary: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    fee: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    transfer: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
    other: "bg-muted text-muted-foreground",
}

export function RoleBadge({ value }: { value: string }) {
    const cls = roleColors[value?.toLowerCase()] ?? "bg-muted text-muted-foreground"
    return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${cls}`}>
            {value?.replace(/_/g, " ")}
        </span>
    )
}


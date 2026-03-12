"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"

export function StatCard({
    label,
    value,
    icon,
    sub,
    color = "text-primary",
}: {
    label: string
    value: string | number
    icon: React.ReactNode
    sub?: string
    color?: string
}) {
    return (
        <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
                        <p className={`mt-1 text-3xl font-bold ${color}`}>{value}</p>
                        {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
                    </div>
                    <div className="rounded-xl bg-primary/10 p-2.5 text-primary">{icon}</div>
                </div>
            </CardContent>
        </Card>
    )
}


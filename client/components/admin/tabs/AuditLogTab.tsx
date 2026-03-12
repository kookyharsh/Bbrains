"use client"

import React, { useState, useEffect, useCallback } from "react"
import { getAuthedClient } from "@/lib/http"
import { Button } from "@/components/ui/button"
import { DataTable } from "../DataTable"
import { SectionHeader } from "../SectionHeader"
import type { ApiAuditLog, LogCategory } from "@/lib/types/api"

type GetToken = () => Promise<string | null>

const LOG_CATEGORIES: LogCategory[] = ["AUTH", "ACADEMIC", "MARKET", "FINANCE", "USER", "SYSTEM"]

const categoryColors: Record<string, string> = {
    AUTH: "bg-blue-500/15 text-blue-600",
    ACADEMIC: "bg-green-500/15 text-green-600",
    MARKET: "bg-orange-500/15 text-orange-600",
    FINANCE: "bg-yellow-500/15 text-yellow-600",
    USER: "bg-purple-500/15 text-purple-600",
    SYSTEM: "bg-gray-500/15 text-gray-600",
}

export function AuditLogTab({ getToken }: { getToken: GetToken }) {
    const [logs, setLogs] = useState<ApiAuditLog[]>([])
    const [loading, setLoading] = useState(true)
    const [category, setCategory] = useState<string>("")
    const [userFilter] = useState("")

    const load = useCallback(async (cat: string, user: string) => {
        try {
            setLoading(true)
            const c = await getAuthedClient(getToken)
            const params = new URLSearchParams({ limit: "100" })
            if (cat) params.set("category", cat)
            if (user) params.set("userId", user)
            const res = await c.get<{ success: boolean; data: ApiAuditLog[] }>(`/logs?${params.toString()}`)
            setLogs(res.data.data)
        } catch (e) { console.error(e) } finally { setLoading(false) }
    }, [getToken])

    useEffect(() => { load(category, userFilter) }, [load, category, userFilter])

    return (
        <div className="space-y-4">
            <SectionHeader title="Audit Log" subtitle="System-wide activity history" />

            <div className="flex flex-wrap items-center gap-2">
                <div className="flex gap-1.5 flex-wrap">
                    <Button variant={category === "" ? "default" : "outline"} size="sm" className="h-7 rounded-full text-xs" onClick={() => setCategory("")}>All</Button>
                    {LOG_CATEGORIES.map((cat) => (
                        <Button key={cat} variant={category === cat ? "default" : "outline"} size="sm" className="h-7 rounded-full text-xs" onClick={() => setCategory(cat)}>
                            {cat}
                        </Button>
                    ))}
                </div>
            </div>

            <DataTable<ApiAuditLog>
                loading={loading} data={logs} searchKeys={["action", "entity", "entityId"]}
                columns={[
                    {
                        key: "category", label: "Category",
                        render: (r) => <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${categoryColors[r.category] ?? ""}`}>{r.category}</span>,
                    },
                    { key: "user", label: "User", render: (r) => r.user?.username ?? r.userId ?? "System" },
                    { key: "action", label: "Action" },
                    { key: "entity", label: "Entity" },
                    { key: "entityId", label: "Entity ID" },
                    { key: "createdAt", label: "Time", render: (r) => new Date(r.createdAt).toLocaleString("en-IN") },
                ]}
                emptyText="No logs found"
            />
        </div>
    )
}



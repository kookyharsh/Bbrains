"use client"

import React, { useState, useEffect } from "react"
import { getAuthedClient } from "@/lib/http"
import { Loader2 } from "lucide-react"
import { DataTable } from "@/components/admin/DataTable"
import { SectionHeader } from "@/components/admin/SectionHeader"
import type { ApiAuditLog } from "@/lib/types/api"

type GetToken = () => Promise<string | null>

function fmtDate(s: string) {
    return new Date(s).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}

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

    useEffect(() => {
        async function load() {
            try {
                setLoading(true)
                const c = await getAuthedClient(getToken)
                const res = await c.get<{ success: boolean; data: ApiAuditLog[]; pagination: unknown }>("/logs/me?limit=100")
                setLogs(res.data.data)
            } catch (e) { console.error(e) } finally { setLoading(false) }
        }
        load()
    }, [getToken])

    return (
        <div className="space-y-4">
            <SectionHeader title="My Activity Log" subtitle="Your recent actions" />
            <DataTable<ApiAuditLog>
                loading={loading} data={logs} searchKeys={["action", "entity"]}
                columns={[
                    {
                        key: "category", label: "Category",
                        render: (r) => <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${categoryColors[r.category] ?? ""}`}>{r.category}</span>,
                    },
                    { key: "action", label: "Action" },
                    { key: "entity", label: "Entity" },
                    { key: "entityId", label: "Entity ID" },
                    { key: "createdAt", label: "Time", render: (r) => fmtDate(r.createdAt) },
                ]}
            />
        </div>
    )
}


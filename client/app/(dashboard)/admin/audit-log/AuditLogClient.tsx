"use client"

import React, { useState, useEffect, useCallback } from "react"
import { SectionHeader } from "@/app/(dashboard)/admin/_components/SectionHeader"
import { DataTable } from "@/app/(dashboard)/admin/_components/DataTable"
import { CategoryFilter } from "./_components/CategoryFilter"
import { fetchAuditLogs } from "./data"
import { categoryColors } from "./_types"
import type { ApiAuditLog } from "./_types"

interface AuditLogClientProps {
    initialLogs: ApiAuditLog[]
}

export function AuditLogClient({ initialLogs }: AuditLogClientProps) {
    const [logs, setLogs] = useState<ApiAuditLog[]>(initialLogs)
    const [loading, setLoading] = useState(false)
    const [category, setCategory] = useState("")

    const load = useCallback(async (cat: string) => {
        try {
            setLoading(true)
            const data = await fetchAuditLogs({ category: cat || undefined })
            setLogs(data)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        load(category)
    }, [load, category])

    return (
        <div className="space-y-4">
            <SectionHeader title="Audit Log" subtitle="System-wide activity history" />

            <CategoryFilter
                selectedCategory={category}
                onCategoryChange={setCategory}
            />

            <DataTable<ApiAuditLog>
                loading={loading}
                data={logs}
                searchKeys={["action", "entity", "entityId"]}
                columns={[
                    {
                        key: "category",
                        label: "Category",
                        render: (r) => (
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${categoryColors[r.category] ?? ""}`}>
                                {r.category}
                            </span>
                        ),
                    },
                    { key: "user", label: "User", render: (r) => r.user?.username ?? r.userId ?? "System" },
                    { key: "action", label: "Action" },
                    { key: "entity", label: "Entity" },
                    { key: "entityId", label: "Entity ID" },
                    {
                        key: "createdAt",
                        label: "Time",
                        render: (r) => new Date(r.createdAt).toLocaleString("en-IN"),
                    },
                ]}
                emptyText="No logs found"
            />
        </div>
    )
}

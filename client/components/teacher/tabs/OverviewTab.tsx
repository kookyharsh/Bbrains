"use client"

import React, { useState, useEffect } from "react"
import { getAuthedClient } from "@/lib/http"
import { Loader2, Users, BookOpen, CheckCircle, Award } from "lucide-react"
import { StatCard } from "@/components/admin/StatCard"

type GetToken = () => Promise<string | null>

export function OverviewTab({ getToken }: { getToken: GetToken }) {
    const [stats, setStats] = useState({ students: 0, assignments: 0, pendingProducts: 0, announcements: 0 })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            try {
                setLoading(true)
                const c = await getAuthedClient(getToken)
                const [sRes, aRes, pRes, anRes] = await Promise.all([
                    c.get<{ success: boolean; data: unknown[] }>("/user/students"),
                    c.get<{ success: boolean; data: unknown[] }>("/academic/assignments"),
                    c.get<{ success: boolean; data: unknown[] }>("/market/pending"),
                    c.get<{ success: boolean; data: unknown[] }>("/announcements"),
                ])
                setStats({
                    students: sRes.data.data.length,
                    assignments: aRes.data.data.length,
                    pendingProducts: pRes.data.data.length,
                    announcements: anRes.data.data.length,
                })
            } catch (e) { console.error(e) } finally { setLoading(false) }
        }
        load()
    }, [getToken])

    if (loading) return <div className="flex justify-center py-12"><Loader2 className="size-6 animate-spin text-muted-foreground/50" /></div>

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Students" value={stats.students} icon={<Users className="size-5" />} />
            <StatCard label="Assignments" value={stats.assignments} icon={<BookOpen className="size-5" />} />
            <StatCard label="Pending Approvals" value={stats.pendingProducts} icon={<CheckCircle className="size-5" />} color={stats.pendingProducts > 0 ? "text-yellow-500" : "text-primary"} />
            <StatCard label="Announcements" value={stats.announcements} icon={<Award className="size-5" />} />
        </div>
    )
}


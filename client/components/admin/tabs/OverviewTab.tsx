"use client"

import React, { useState, useEffect } from "react"
import { Loader2, UserCheck, Users, ShoppingBag, CheckCircle, BookOpen, FileText, Shield, Trophy } from "lucide-react"
import { getAuthedClient } from "@/lib/http"
import { StatCard } from "../StatCard"

export function OverviewTab() {
    const [stats, setStats] = useState({
        teachers: 0, students: 0, products: 0, pending: 0,
        roles: 0, achievements: 0, announcements: 0, assignments: 0,
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            try {
                setLoading(true)
                const c = await getAuthedClient()
                const results = await Promise.allSettled([
                    c.get<{ data: unknown[] }>("/user/teachers"),
                    c.get<{ data: unknown[] }>("/user/students"),
                    c.get<{ data: unknown[] }>("/market/products"),
                    c.get<{ data: unknown[] }>("/market/pending"),
                    c.get<{ data: unknown[] }>("/roles"),
                    c.get<{ data: unknown[] }>("/achievements"),
                    c.get<{ data: unknown[] }>("/announcements"),
                    c.get<{ data: unknown[] }>("/academic/assignments"),
                ])
                const get = (i: number) => results[i].status === "fulfilled" ? (results[i] as PromiseFulfilledResult<{ data: { data: unknown[] } }>).value.data.data.length : 0
                setStats({ teachers: get(0), students: get(1), products: get(2), pending: get(3), roles: get(4), achievements: get(5), announcements: get(6), assignments: get(7) })
            } catch (e) { console.error(e) } finally { setLoading(false) }
        }
        load()
    }, [])

    if (loading) return <div className="flex justify-center py-12"><Loader2 className="size-6 animate-spin text-muted-foreground/50" /></div>

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Teachers" value={stats.teachers} icon={<UserCheck className="size-5" />} />
            <StatCard label="Students" value={stats.students} icon={<Users className="size-5" />} />
            <StatCard label="Products" value={stats.products} icon={<ShoppingBag className="size-5" />} />
            <StatCard label="Pending Products" value={stats.pending} icon={<CheckCircle className="size-5" />} color={stats.pending > 0 ? "text-yellow-500" : "text-primary"} />
            <StatCard label="Assignments" value={stats.assignments} icon={<BookOpen className="size-5" />} />
            <StatCard label="Announcements" value={stats.announcements} icon={<FileText className="size-5" />} />
            <StatCard label="Roles" value={stats.roles} icon={<Shield className="size-5" />} />
            <StatCard label="Achievements" value={stats.achievements} icon={<Trophy className="size-5" />} />
        </div>
    )
}


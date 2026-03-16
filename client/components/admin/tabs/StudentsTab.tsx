"use client"

import React, { useState, useEffect, useCallback } from "react"
import { getAuthedClient } from "@/lib/http"
import { DataTable } from "../DataTable"
import { ConfirmDialog } from "../ConfirmDialog"
import { SectionHeader } from "../SectionHeader"
import { RoleBadge } from "../RoleBadge"
import type { ApiUser } from "@/lib/types/api"

type GetToken = () => Promise<string | null>

function fmtCurrency(n: number | string) {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(Number(n))
}

function fullName(u?: { firstName?: string; lastName?: string } | null) {
    if (!u) return "—"
    return `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || "—"
}

export function StudentsTab({ getToken }: { getToken: GetToken }) {
    const [students, setStudents] = useState<ApiUser[]>([])
    const [loading, setLoading] = useState(true)
    const [deleteTarget, setDeleteTarget] = useState<ApiUser | null>(null)
    const [deleting, setDeleting] = useState(false)

    const load = useCallback(async () => {
        try {
            setLoading(true)
            const c = await getAuthedClient(getToken)
            const res = await c.get<{ success: boolean; data: ApiUser[] }>("/user/students")
            setStudents(res.data.data)
        } catch (e) { console.error(e) } finally { setLoading(false) }
    }, [getToken])

    useEffect(() => { load() }, [load])

    async function handleDelete() {
        if (!deleteTarget) return
        try {
            setDeleting(true)
            const c = await getAuthedClient(getToken)
            await c.delete(`/user/delete/${deleteTarget.id}`)
            setStudents((prev) => prev.filter((s) => s.id !== deleteTarget.id))
            setDeleteTarget(null)
        } catch (e) { console.error(e) } finally { setDeleting(false) }
    }

    return (
        <div className="space-y-4">
            <SectionHeader title="Students" subtitle={`${students.length} total students`} />
            <DataTable<ApiUser>
                loading={loading} data={students} searchKeys={["username", "email"]}
                columns={[
                    { key: "username", label: "Username" },
                    { key: "email", label: "Email" },
                    { key: "userDetails", label: "Name", render: (r) => fullName(r.userDetails) },
                    { key: "xp", label: "Level", render: (r) => r.xp ? `Lv ${r.xp?.level ?? 1} (${r.xp?.xp ?? 0} XP)` : "—" },
                    { key: "wallet", label: "Balance", render: (r) => r.wallet ? fmtCurrency(r.wallet.balance) : "—" },
                ]}
                onDelete={setDeleteTarget}
            />
            <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} confirming={deleting}
                title="Delete Student" description={`Permanently delete student "${deleteTarget?.username}"? This will remove all their data.`} />
        </div>
    )
}

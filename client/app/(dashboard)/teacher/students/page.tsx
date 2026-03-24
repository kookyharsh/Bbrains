"use client"

import React, { useState, useEffect, useCallback } from "react"
import { getAuthedClient } from "@/services/api/client"
import { Loader2, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { DataTable } from "@/features/admin/components/DataTable"
import { SectionHeader } from "@/features/admin/components/SectionHeader"
import { RoleBadge } from "@/features/admin/components/RoleBadge"
import type { ApiUser } from "@/lib/types/api"


function fmtCurrency(n: number | string) {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(Number(n))
}

function fullName(u?: { firstName?: string; lastName?: string } | null) {
    if (!u) return "—"
    return `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || "—"
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div>
            <p className="text-[10px] font-semibold uppercase text-muted-foreground">{label}</p>
            <p className="mt-0.5 text-sm text-foreground">{value}</p>
        </div>
    )
}

export default function StudentsPage() {
    const [students, setStudents] = useState<ApiUser[]>([])
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] = useState<ApiUser | null>(null)
    const [detailOpen, setDetailOpen] = useState(false)

    const load = useCallback(async () => {
        try {
            setLoading(true)
            const c = await getAuthedClient()
            const res = await c.get<{ success: boolean; data: ApiUser[] }>("/user/students")
            setStudents(res.data.data)
        } catch (e) { console.error(e) } finally { setLoading(false) }
    }, [])

    useEffect(() => { load() }, [load])

    const viewDetails = async (s: ApiUser) => {
        try {
            const c = await getAuthedClient()
            const res = await c.get<{ success: boolean; data: ApiUser }>(`/user/${s.username}`)
            setSelected(res.data.data)
            setDetailOpen(true)
        } catch { setSelected(s); setDetailOpen(true) }
    }

    return (
        <div className="space-y-4">
            <SectionHeader title="Students" subtitle={`${students.length} total students`} />
            <DataTable<ApiUser>
                loading={loading}
                data={students}
                searchKeys={["username", "email"]}
                columns={[
                    { key: "username", label: "Username" },
                    { key: "email", label: "Email" },
                    {
                        key: "userDetails", label: "Name",
                        render: (r) => fullName(r.userDetails),
                    },
                    {
                        key: "xp", label: "Level",
                        render: (r) => r.xp ? `Lv ${r.xp?.level ?? 1}` : "—",
                    },
                    {
                        key: "wallet", label: "Balance",
                        render: (r) => r.wallet ? fmtCurrency(r.wallet.balance) : "—",
                    },
                ]}
                extraActions={(row) => (
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => viewDetails(row)}>
                        <Eye className="size-3.5" />
                    </Button>
                )}
            />

            <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
                <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-md">
                    <DialogHeader><DialogTitle>Student Details</DialogTitle></DialogHeader>
                    {selected && (
                        <div className="space-y-4 text-sm">
                            <div className="grid grid-cols-2 gap-3">
                                <InfoRow label="Username" value={selected.username} />
                                <InfoRow label="Email" value={selected.email} />
                                <InfoRow label="Name" value={fullName(selected.userDetails)} />
                                <InfoRow label="Type" value={<RoleBadge value={selected.type} />} />
                                {selected.userDetails?.phone && <InfoRow label="Phone" value={selected.userDetails.phone} />}
                                {selected.userDetails?.sex && <InfoRow label="Sex" value={selected.userDetails.sex} />}
                                {selected.xp && <>
                                    <InfoRow label="XP" value={String(selected.xp?.xp ?? 0)} />
                                    <InfoRow label="Level" value={String(selected.xp?.level ?? 1)} />
                                </>}
                                {selected.wallet && <>
                                    <InfoRow label="Wallet ID" value={selected.wallet.id} />
                                    <InfoRow label="Balance" value={fmtCurrency(selected.wallet.balance)} />
                                </>}
                            </div>
                            {selected.enrollments && selected.enrollments.length > 0 && (
                                <div>
                                    <p className="font-semibold mb-2">Enrolled Courses</p>
                                    <ul className="space-y-1">
                                        {selected.enrollments.map((e) => (
                                            <li key={e.courseId} className="rounded bg-muted px-2 py-1 text-xs">
                                                {e.course.name}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}


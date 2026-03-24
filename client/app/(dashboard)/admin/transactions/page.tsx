"use client"

import React, { useState, useEffect } from "react"
import { api } from "@/services/api/client"
import { Loader2, ArrowUpDown } from "lucide-react"
import { SectionHeader } from "@/features/admin/components/SectionHeader"
import { DataTable } from "@/features/admin/components/DataTable"
import { RoleBadge } from "@/features/admin/components/RoleBadge"
import type { ApiUser, ApiTransaction } from "@/lib/types/api"
import { toast } from "sonner"

function fmtDate(s: string) {
    return new Date(s).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}

function fmtCurrency(n: number | string) {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(Number(n))
}

export default function TransactionsPage() {
    const [users, setUsers] = useState<ApiUser[]>([])
    const [transactions, setTransactions] = useState<ApiTransaction[]>([])
    const [loading, setLoading] = useState(true)
    const [loadingTxns, setLoadingTxns] = useState(false)
    const [selectedUserId, setSelectedUserId] = useState("")
    const [typeFilter, setTypeFilter] = useState("")
    const [statusFilter, setStatusFilter] = useState("")

    useEffect(() => {
        async function load() {
            try {
                setLoading(true)
                const [sRes, tRes] = await Promise.all([
                    api.get<ApiUser[]>("/user/students"),
                    api.get<ApiUser[]>("/user/teachers"),
                ])
                const students = sRes.success ? sRes.data || [] : []
                const teachers = tRes.success ? tRes.data || [] : []
                setUsers([...students, ...teachers])
            } catch (e) { 
                console.error(e) 
                toast.error("Failed to load users")
            } finally { 
                setLoading(false) 
            }
        }
        load()
    }, [])

    async function loadTransactions(userId: string) {
        if (!userId) { 
            setTransactions([])
            return 
        }
        try {
            setLoadingTxns(true)
            const res = await api.get<ApiTransaction[]>(`/transactions/user/${userId}?limit=100`)
            if (res.success) {
                setTransactions(res.data || [])
            } else {
                toast.error(res.message || "Failed to load transactions")
            }
        } catch (e) { 
            console.error(e) 
            toast.error("Failed to load transactions")
        } finally { 
            setLoadingTxns(false) 
        }
    }

    const filtered = transactions.filter((t) => {
        if (typeFilter && t.type !== typeFilter) return false
        if (statusFilter && t.status !== statusFilter) return false
        return true
    })

    const totalCredit = filtered.filter((t) => t.type === "credit").reduce((s, t) => s + Number(t.amount), 0)
    const totalDebit = filtered.filter((t) => t.type === "debit").reduce((s, t) => s + Number(t.amount), 0)

    return (
        <div className="space-y-4">
            <SectionHeader title="Transaction History" subtitle="View transactions for any user" />

            {loading ? <div className="flex justify-center py-4"><Loader2 className="size-5 animate-spin text-muted-foreground/50" /></div> : (
                <div className="flex flex-wrap items-center gap-3">
                    <select
                        value={selectedUserId}
                        onChange={(e) => { setSelectedUserId(e.target.value); loadTransactions(e.target.value) }}
                        className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                        <option value="">-- Select user --</option>
                        {users.map((u) => <option key={u.id} value={u.id}>{u.username} ({u.type})</option>)}
                    </select>

                    {selectedUserId && (
                        <>
                            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
                                className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                                <option value="">All types</option>
                                <option value="credit">Credit</option>
                                <option value="debit">Debit</option>
                            </select>
                            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                                className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                                <option value="">All statuses</option>
                                <option value="success">Success</option>
                                <option value="failed">Failed</option>
                                <option value="pending">Pending</option>
                            </select>
                        </>
                    )}
                </div>
            )}

            {selectedUserId && !loadingTxns && filtered.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-green-200 bg-green-500/5 p-3">
                        <p className="text-xs font-semibold text-muted-foreground">Total Credits</p>
                        <p className="text-xl font-bold text-green-600">{fmtCurrency(totalCredit)}</p>
                    </div>
                    <div className="rounded-lg border border-red-200 bg-red-500/5 p-3">
                        <p className="text-xs font-semibold text-muted-foreground">Total Debits</p>
                        <p className="text-xl font-bold text-red-600">{fmtCurrency(totalDebit)}</p>
                    </div>
                </div>
            )}

            {loadingTxns ? (
                <div className="flex justify-center py-8"><Loader2 className="size-6 animate-spin text-muted-foreground/50" /></div>
            ) : selectedUserId ? (
                <DataTable<ApiTransaction>
                    data={filtered} searchKeys={["note"]}
                    columns={[
                        { key: "id", label: "ID", render: (r) => `TXN-${r.id}` },
                        { key: "type", label: "Type", render: (r) => <RoleBadge value={r.type} /> },
                        { key: "status", label: "Status", render: (r) => <RoleBadge value={r.status} /> },
                        { key: "amount", label: "Amount", render: (r) => <span className={r.type === "credit" ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>{fmtCurrency(r.amount)}</span> },
                        { key: "note", label: "Note", render: (r) => <span className="text-muted-foreground text-xs line-clamp-1">{r.note ?? "—"}</span> },
                        { key: "transactionDate", label: "Date", render: (r) => fmtDate(r.transactionDate) },
                    ]}
                    emptyText="No transactions found"
                />
            ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <ArrowUpDown className="size-8 mb-2 opacity-40" />
                    <p className="text-sm">Select a user to view their transaction history</p>
                </div>
            )}
        </div>
    )
}

"use client"

import { DataTable } from "@/app/(dashboard)/admin/_components/DataTable"
import { fullName, fmtCurrency, type ApiUser } from "../_types"

interface StudentsTableProps {
    loading: boolean
    data: ApiUser[]
    onDelete: (student: ApiUser) => void
}

export function StudentsTable({ loading, data, onDelete }: StudentsTableProps) {
    const columns = [
        { key: "username", label: "Username" },
        { key: "email", label: "Email" },
        {
            key: "userDetails",
            label: "Name",
            render: (r: ApiUser) => fullName(r.userDetails),
        },
        {
            key: "xp",
            label: "Level",
            render: (r: ApiUser) =>
                r.xp ? `Lv ${r.xp?.level ?? 1} (${r.xp?.xp ?? 0} XP)` : "—",
        },
        {
            key: "wallet",
            label: "Balance",
            render: (r: ApiUser) => (r.wallet ? fmtCurrency(r.wallet.balance) : "—"),
        },
    ]

    return (
        <DataTable<ApiUser>
            loading={loading}
            data={data}
            searchKeys={["username", "email"]}
            columns={columns}
            onDelete={onDelete}
        />
    )
}

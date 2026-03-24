"use client"

import React from "react"
import { DataTable } from "@/app/(dashboard)/admin/_components/DataTable"
import { RoleBadge } from "@/app/(dashboard)/admin/_components/RoleBadge"
import { fullName, type ApiUser } from "../_types"

interface TeachersTableProps {
    loading: boolean
    data: ApiUser[]
    onEdit: (teacher: ApiUser) => void
    onDelete: (teacher: ApiUser) => void
}

export function TeachersTable({ loading, data, onEdit, onDelete }: TeachersTableProps) {
    const columns = [
        { key: "username", label: "Username" },
        { key: "email", label: "Email" },
        { key: "userDetails", label: "Name", render: (r: ApiUser) => fullName(r.userDetails) },
        { key: "type", label: "Type", render: (r: ApiUser) => <RoleBadge value={r.type} /> },
    ]

    return (
        <DataTable<ApiUser>
            loading={loading}
            data={data}
            searchKeys={["username", "email"]}
            columns={columns}
            onEdit={onEdit}
            onDelete={onDelete}
        />
    )
}

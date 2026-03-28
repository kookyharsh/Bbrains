"use client"

import React from "react"
import { DataTable } from "@/features/admin/components/DataTable"
import { RoleBadge } from "@/features/admin/components/RoleBadge"
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
        {
            key: "teacherSubjects",
            label: "Subjects",
            render: (r: ApiUser) => (r.userDetails?.teacherSubjects?.join(", ") || "—"),
        },
        {
            key: "classTeacherCourse",
            label: "Class Teacher",
            render: (r: ApiUser) => (r.classTeacherCourse ? `${r.classTeacherCourse.name}${r.classTeacherCourse.standard ? ` (${r.classTeacherCourse.standard})` : ""}` : "—"),
        },
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

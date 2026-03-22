"use client"

import { useState, useEffect, useCallback } from "react"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { SectionHeader } from "@/components/admin/SectionHeader"
import { ConfirmDialog } from "@/components/admin/ConfirmDialog"
import { StudentsTable } from "./_components/StudentsTable"
import { fetchStudents } from "./data"
import type { ApiUser } from "./_types"

interface StudentsClientProps {
    initialStudents: ApiUser[]
}

export function StudentsClient({ initialStudents }: StudentsClientProps) {
    const [students, setStudents] = useState<ApiUser[]>(initialStudents)
    const [loading, setLoading] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<ApiUser | null>(null)
    const [deleting, setDeleting] = useState(false)

    const load = useCallback(async () => {
        try {
            setLoading(true)
            const data = await fetchStudents()
            setStudents(data)
        } catch (e) {
            console.error(e)
            toast.error("Failed to load students")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        load()
    }, [load])

    async function handleDelete() {
        if (!deleteTarget) return
        try {
            setDeleting(true)
            const res = await api.delete(`/user/delete/${deleteTarget.id}`)
            if (res.success) {
                toast.success("Student deleted")
                setStudents((prev) => prev.filter((s) => s.id !== deleteTarget.id))
                setDeleteTarget(null)
            } else {
                toast.error(res.message || "Failed to delete student")
            }
        } catch (e) {
            console.error(e)
            toast.error("Failed to delete student")
        } finally {
            setDeleting(false)
        }
    }

    return (
        <div className="space-y-4">
            <SectionHeader
                title="Students"
                subtitle={`${students.length} total students enrolled`}
            />

            <StudentsTable loading={loading} data={students} onDelete={setDeleteTarget} />

            <ConfirmDialog
                open={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                confirming={deleting}
                title="Delete Student"
                description={`Are you sure you want to permanently delete student "${deleteTarget?.username}"? This will remove all their data and cannot be undone.`}
            />
        </div>
    )
}

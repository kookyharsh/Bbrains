"use client"

import React, { useState, useEffect, useCallback } from "react"
import { getAuthedClient } from "@/services/api/client"
import { DataTable } from "@/features/admin/components/DataTable"
import { CrudDrawer } from "@/features/admin/components/CrudDrawer"
import { ConfirmDialog } from "@/features/admin/components/ConfirmDialog"
import { SectionHeader } from "@/features/admin/components/SectionHeader"
import { FormInput, FormSelect, FormTextarea } from "@/features/admin/components/form"
import { toast } from "sonner"
import type { ApiAssignment, ApiCourse } from "@/lib/types/api"

function fmtDate(s: string) {
    return new Date(s).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}

interface AssignmentForm { description: string; title: string; courseId: string; dueDate: string }
const emptyAssForm: AssignmentForm = { title: "", description: "", courseId: "", dueDate: "" }

function getRequestErrorMessage(error: unknown, fallback: string) {
    if (typeof error === "object" && error !== null) {
        const maybeResponse = (error as { response?: { data?: { message?: string } } }).response
        if (typeof maybeResponse?.data?.message === "string" && maybeResponse.data.message.trim()) {
            return maybeResponse.data.message
        }
    }

    if (error instanceof Error && error.message.trim()) {
        return error.message
    }

    return fallback
}

export default function AssignmentsPage() {
    const [assignments, setAssignments] = useState<ApiAssignment[]>([])
    const [courses, setCourses] = useState<ApiCourse[]>([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [editing, setEditing] = useState<ApiAssignment | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<ApiAssignment | null>(null)
    const [form, setForm] = useState<AssignmentForm>(emptyAssForm)
    const [submitting, setSubmitting] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const load = useCallback(async () => {
        try {
            setLoading(true)
            const c = await getAuthedClient()
            const [aRes, cRes] = await Promise.all([
                c.get<{ success: boolean; data: ApiAssignment[] }>("/academic/assignments"),
                c.get<{ success: boolean; data: ApiCourse[] }>("/courses?limit=100"),
            ])

            setAssignments(Array.isArray(aRes.data.data) ? aRes.data.data : [])
            setCourses(Array.isArray(cRes.data.data) ? cRes.data.data : [])
        } catch (error) {
            console.error(error)
            toast.error(getRequestErrorMessage(error, "Failed to load assignments"))
        } finally { setLoading(false) }
    }, [])

    useEffect(() => { load() }, [load])

    function openCreate() {
        if (courses.length === 0) {
            toast.error("Create a class first before adding an assignment")
            return
        }
        setEditing(null)
        setForm(emptyAssForm)
        setModalOpen(true)
    }
    function openEdit(a: ApiAssignment) {
        setEditing(a)
        setForm({ title: a.title, description: a.description ?? "", courseId: String(a.courseId), dueDate: a.dueDate?.slice(0, 10) ?? "" })
        setModalOpen(true)
    }

    async function handleSubmit() {
        if (!form.title.trim() || !form.courseId) {
            toast.error("Assignment title and class are required")
            return
        }
        try {
            setSubmitting(true)
            const c = await getAuthedClient()
            const payload = { title: form.title, description: form.description || undefined, courseId: Number(form.courseId), dueDate: form.dueDate || undefined }
            if (editing) {
                const r = await c.put<{ success: boolean; data: ApiAssignment }>(`/academic/assignments/${editing.id}`, payload)
                setAssignments((prev) => prev.map((a) => a.id === editing.id ? r.data.data : a))
                toast.success("Assignment updated")
            } else {
                const r = await c.post<{ success: boolean; data: ApiAssignment }>("/academic/assignments", payload)
                setAssignments((prev) => [r.data.data, ...prev])
                toast.success("Assignment created")
            }
            setModalOpen(false)
        } catch (error) {
            console.error(error)
            toast.error(getRequestErrorMessage(error, editing ? "Failed to update assignment" : "Failed to create assignment"))
        } finally { setSubmitting(false) }
    }

    async function handleDelete() {
        if (!deleteTarget) return
        try {
            setDeleting(true)
            const c = await getAuthedClient()
            await c.delete(`/academic/assignments/${deleteTarget.id}`)
            setAssignments((prev) => prev.filter((a) => a.id !== deleteTarget.id))
            setDeleteTarget(null)
            toast.success("Assignment deleted")
        } catch (error) {
            console.error(error)
            toast.error(getRequestErrorMessage(error, "Failed to delete assignment"))
        } finally { setDeleting(false) }
    }

    return (
        <div className="space-y-4">
            <SectionHeader title="Assignments" subtitle={`${assignments.length} total`} action={openCreate} actionLabel="New Assignment" />
            <DataTable<ApiAssignment>
                loading={loading} data={assignments} searchKeys={["title"]}
                columns={[
                    { key: "title", label: "Title" },
                    { key: "course", label: "Course", render: (r) => r.course?.name ?? "—" },
                    { key: "dueDate", label: "Due Date", render: (r) => r.dueDate ? fmtDate(r.dueDate) : "—" },
                    { key: "_count", label: "Submissions", render: (r) => String(r._count?.submissions ?? 0) },
                ]}
                onEdit={openEdit} onDelete={setDeleteTarget}
            />
            <CrudDrawer open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Assignment" : "New Assignment"} onSubmit={handleSubmit} submitting={submitting}>
                <FormInput label="Title" required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
                <FormTextarea label="Description" value={form.description} onChange={(v) => setForm((f) => ({ ...f, description: v }))} />
                <FormSelect label="Course" required value={form.courseId} onChange={(v) => setForm((f) => ({ ...f, courseId: v }))}
                    options={[{ value: "", label: "Select course..." }, ...courses.map((c) => ({ value: String(c.id), label: c.name }))]} />
                <FormInput label="Due Date" type="date" value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} />
            </CrudDrawer>
            <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} confirming={deleting}
                title="Delete Assignment" description={`Delete "${deleteTarget?.title}"?`} />
        </div>
    )
}

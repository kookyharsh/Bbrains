"use client"

import React, { useState, useEffect, useCallback } from "react"
import { getAuthedClient } from "@/lib/http"
import { Loader2 } from "lucide-react"
import { DataTable } from "@/components/admin/DataTable"
import { SectionHeader } from "@/components/admin/SectionHeader"
import { CrudDrawer } from "@/components/admin/CrudDrawer"
import { ConfirmDialog } from "@/components/admin/ConfirmDialog"
import { FormInput } from "@/components/admin/form/FormInput"
import { FormSelect } from "@/components/admin/form/FormSelect"
import { FormTextarea } from "@/components/admin/form/FormTextarea"
import type { ApiAssignment, ApiCourse } from "@/lib/types/api"
import { useCloudinaryUpload } from "@/hooks/use-cloudinary-upload"
import { Camera } from "lucide-react"
import { toast } from "sonner"


function fmtDate(s: string) {
    return new Date(s).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}

interface AssignmentForm {
    title: string; description: string; courseId: string; dueDate: string; file: string
}
const emptyAssForm: AssignmentForm = { title: "", description: "", courseId: "", dueDate: "", file: "" }

export function AssignmentsTab() {
    const [assignments, setAssignments] = useState<ApiAssignment[]>([])
    const [courses, setCourses] = useState<ApiCourse[]>([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<ApiAssignment | null>(null)
    const [editing, setEditing] = useState<ApiAssignment | null>(null)
    const [form, setForm] = useState<AssignmentForm>(emptyAssForm)
    const [submitting, setSubmitting] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const { uploadFile, isUploading } = useCloudinaryUpload()

    const load = useCallback(async () => {
        try {
            setLoading(true)
            const c = await getAuthedClient()
            const [aRes, cRes] = await Promise.all([
                c.get<{ success: boolean; data: ApiAssignment[] }>("/academic/assignments"),
                c.get<{ success: boolean; data: ApiCourse[] }>("/courses"),
            ])
            setAssignments(aRes.data.data)
            setCourses(cRes.data.data)
        } catch (e) { console.error(e) } finally { setLoading(false) }
    }, [])

    useEffect(() => { load() }, [load])

    function openCreate() { setEditing(null); setForm(emptyAssForm); setModalOpen(true) }
    function openEdit(a: ApiAssignment) {
        setEditing(a)
        setForm({ title: a.title, description: a.description ?? "", courseId: String(a.courseId), dueDate: a.dueDate?.slice(0, 10) ?? "", file: a.file || "" })
        setModalOpen(true)
    }

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const f = e.target.files?.[0]
        if (!f) return
        try {
            const url = await uploadFile(f)
            if (url) {
                setForm(prev => ({ ...prev, file: url }))
                toast.success("File uploaded successfully")
            }
        } catch (err) { toast.error("Upload failed") }
    }

    async function handleSubmit() {
        if (!form.title.trim() || !form.courseId) return
        try {
            setSubmitting(true)
            const c = await getAuthedClient()
            const payload = { 
                title: form.title, 
                description: form.description || undefined, 
                courseId: Number(form.courseId), 
                dueDate: form.dueDate || undefined,
                file: form.file || undefined
            }
            if (editing) {
                const r = await c.put<{ success: boolean; data: ApiAssignment }>(`/academic/assignments/${editing.id}`, payload)
                setAssignments((prev) => prev.map((a) => a.id === editing.id ? r.data.data : a))
            } else {
                const r = await c.post<{ success: boolean; data: ApiAssignment }>("/academic/assignments", payload)
                setAssignments((prev) => [r.data.data, ...prev])
            }
            setModalOpen(false)
        } catch (e) { console.error(e) } finally { setSubmitting(false) }
    }

    async function handleDelete() {
        if (!deleteTarget) return
        try {
            setDeleting(true)
            const c = await getAuthedClient()
            await c.delete(`/academic/assignments/${deleteTarget.id}`)
            setAssignments((prev) => prev.filter((a) => a.id !== deleteTarget.id))
            setDeleteTarget(null)
        } catch (e) { console.error(e) } finally { setDeleting(false) }
    }

    return (
        <div className="space-y-4">
            <SectionHeader title="Assignments" subtitle={`${assignments.length} total`} action={openCreate} actionLabel="New Assignment" />
            <DataTable<ApiAssignment>
                loading={loading} data={assignments}
                searchKeys={["title"]}
                columns={[
                    { key: "title", label: "Title" },
                    { key: "course", label: "Course", render: (r) => r.course?.name ?? "—" },
                    { key: "dueDate", label: "Due", render: (r) => r.dueDate ? fmtDate(r.dueDate) : "—" },
                    { key: "_count", label: "Submissions", render: (r) => String(r._count?.submissions ?? 0) },
                ]}
                onEdit={openEdit}
                onDelete={setDeleteTarget}
            />

            <CrudDrawer open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Assignment" : "New Assignment"} onSubmit={handleSubmit} submitting={submitting}>
                <FormInput label="Title" required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Assignment title" />
                <FormTextarea label="Description" value={form.description} onChange={(v) => setForm((f) => ({ ...f, description: v }))} placeholder="Optional description" />
                <FormSelect
                    label="Course"
                    required
                    value={form.courseId}
                    onChange={(v) => setForm((f) => ({ ...f, courseId: v }))}
                    options={[{ value: "", label: "Select course..." }, ...courses.map((c) => ({ value: String(c.id), label: c.name }))]}
                />
                <FormInput label="Due Date" type="date" value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} />
                
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Attachment (Optional)</label>
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-xl cursor-pointer transition-colors border border-border/40">
                            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                            <span className="text-xs font-medium">{form.file ? "Change File" : "Upload File"}</span>
                            <input type="file" className="hidden" onChange={handleFileChange} disabled={isUploading} />
                        </label>
                        {form.file && (
                            <span className="text-[10px] text-brand-purple font-bold truncate max-w-[150px]">
                                File attached ✓
                            </span>
                        )}
                    </div>
                </div>
            </CrudDrawer>

            <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} confirming={deleting}
                title="Delete Assignment" description={`Delete "${deleteTarget?.title}"? This will also remove all submissions.`} />
        </div>
    )
}


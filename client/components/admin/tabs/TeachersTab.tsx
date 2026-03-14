"use client"

import React, { useState, useEffect, useCallback } from "react"
import { getAuthedClient } from "@/lib/http"
import { Loader2 } from "lucide-react"
import { DataTable } from "../DataTable"
import { CrudDrawer } from "../CrudDrawer"
import { ConfirmDialog } from "../ConfirmDialog"
import { SectionHeader } from "../SectionHeader"
import { RoleBadge } from "../RoleBadge"
import { FormInput, FormSelect, FormTextarea } from "../form"
import type { ApiUser } from "@/lib/types/api"


function fullName(u?: { firstName?: string; lastName?: string } | null) {
    if (!u) return "—"
    return `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || "—"
}

interface TeacherForm {
    username: string; email: string; firstName: string; lastName: string
    sex: string; dob: string; phone: string; collegeId: string
}
const emptyTeacherForm: TeacherForm = {
    username: "", email: "", firstName: "", lastName: "",
    sex: "other", dob: "", phone: "", collegeId: "45",
}

export function TeachersTab() {
    const [teachers, setTeachers] = useState<ApiUser[]>([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [editing, setEditing] = useState<ApiUser | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<ApiUser | null>(null)
    const [form, setForm] = useState<TeacherForm>(emptyTeacherForm)
    const [submitting, setSubmitting] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const load = useCallback(async () => {
        try {
            setLoading(true)
            const c = await getAuthedClient()
            const res = await c.get<{ success: boolean; data: ApiUser[] }>("/user/teachers")
            setTeachers(res.data.data)
        } catch (e) { console.error(e) } finally { setLoading(false) }
    }, [])

    useEffect(() => { load() }, [load])

    function openCreate() { setEditing(null); setForm(emptyTeacherForm); setModalOpen(true) }
    function openEdit(t: ApiUser) {
        setEditing(t)
        setForm({
            username: t.username, email: t.email,
            firstName: t.userDetails?.firstName ?? "", lastName: t.userDetails?.lastName ?? "",
            sex: t.userDetails?.sex ?? "other", dob: t.userDetails?.dob?.slice(0, 10) ?? "",
            phone: t.userDetails?.phone ?? "", collegeId: "45",
        })
        setModalOpen(true)
    }

    async function handleSubmit() {
        if (!form.username.trim() || !form.email.trim() || !form.firstName.trim()) return
        try {
            setSubmitting(true)
            const c = await getAuthedClient()
            const payload = {
                username: form.username, email: form.email,
                firstName: form.firstName, lastName: form.lastName,
                sex: form.sex, dob: form.dob || "2000-01-01",
                phone: form.phone || undefined,
                collegeId: Number(form.collegeId),
            }
            if (editing) {
                const r = await c.put<{ success: boolean; data: ApiUser }>(`/user/teachers/${editing.id}`, payload)
                setTeachers((prev) => prev.map((t) => t.id === editing.id ? r.data.data : t))
            } else {
                const r = await c.post<{ success: boolean; data: ApiUser }>("/user/teachers", payload)
                setTeachers((prev) => [r.data.data, ...prev])
            }
            setModalOpen(false)
        } catch (e) { console.error(e) } finally { setSubmitting(false) }
    }

    async function handleDelete() {
        if (!deleteTarget) return
        try {
            setDeleting(true)
            const c = await getAuthedClient()
            await c.delete(`/user/teachers/${deleteTarget.id}`)
            setTeachers((prev) => prev.filter((t) => t.id !== deleteTarget.id))
            setDeleteTarget(null)
        } catch (e) { console.error(e) } finally { setDeleting(false) }
    }

    return (
        <div className="space-y-4">
            <SectionHeader title="Teachers" subtitle={`${teachers.length} teachers`} action={openCreate} actionLabel="Add Teacher" />
            <DataTable<ApiUser>
                loading={loading} data={teachers} searchKeys={["username", "email"]}
                columns={[
                    { key: "username", label: "Username" },
                    { key: "email", label: "Email" },
                    { key: "userDetails", label: "Name", render: (r) => fullName(r.userDetails) },
                    { key: "type", label: "Type", render: (r) => <RoleBadge value={r.type} /> },
                ]}
                onEdit={openEdit} onDelete={setDeleteTarget}
            />

            <CrudDrawer open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Teacher" : "Add Teacher"} onSubmit={handleSubmit} submitting={submitting}>
                <div className="grid grid-cols-2 gap-3">
                    <FormInput label="Username" required value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} placeholder="username" disabled={!!editing} />
                    <FormInput label="Email" required type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="email@domain.com" disabled={!!editing} />
                    <FormInput label="First Name" required value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} placeholder="First" />
                    <FormInput label="Last Name" required value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} placeholder="Last" />
                    <FormSelect label="Sex" value={form.sex} onChange={(v) => setForm((f) => ({ ...f, sex: v }))}
                        options={[{ value: "male", label: "Male" }, { value: "female", label: "Female" }, { value: "other", label: "Other" }]} />
                    <FormInput label="Date of Birth" type="date" value={form.dob} onChange={(e) => setForm((f) => ({ ...f, dob: e.target.value }))} />
                    <FormInput label="Phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+91 ..." />
                    <FormInput label="College ID" value={form.collegeId} onChange={(e) => setForm((f) => ({ ...f, collegeId: e.target.value }))} />
                </div>
                {!editing && <p className="text-xs text-muted-foreground">An invite email will be sent to the teacher so they can set their password.</p>}
            </CrudDrawer>

            <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} confirming={deleting}
                title="Delete Teacher" description={`Delete teacher "${deleteTarget?.username}"? This cannot be undone.`} />
        </div>
    )
}

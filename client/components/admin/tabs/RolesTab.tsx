"use client"

import React, { useState, useEffect, useCallback } from "react"
import { getAuthedClient } from "@/lib/http"
import { DataTable } from "../DataTable"
import { CrudDrawer } from "../CrudDrawer"
import { ConfirmDialog } from "../ConfirmDialog"
import { SectionHeader } from "../SectionHeader"
import { FormInput, FormTextarea } from "../form"
import type { ApiRole } from "@/lib/types/api"

type GetToken = () => Promise<string | null>

interface RoleForm { name: string; description: string }
const emptyRoleForm: RoleForm = { name: "", description: "" }

export function RolesTab({ getToken }: { getToken: GetToken }) {
    const [roles, setRoles] = useState<ApiRole[]>([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [editing, setEditing] = useState<ApiRole | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<ApiRole | null>(null)
    const [form, setForm] = useState<RoleForm>(emptyRoleForm)
    const [submitting, setSubmitting] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const load = useCallback(async () => {
        try {
            setLoading(true)
            const c = await getAuthedClient(getToken)
            const res = await c.get<{ success: boolean; data: ApiRole[] }>("/roles")
            setRoles(res.data.data)
        } catch (e) { console.error(e) } finally { setLoading(false) }
    }, [getToken])

    useEffect(() => { load() }, [load])

    function openCreate() { setEditing(null); setForm(emptyRoleForm); setModalOpen(true) }
    function openEdit(r: ApiRole) { setEditing(r); setForm({ name: r.name, description: r.description ?? "" }); setModalOpen(true) }

    async function handleSubmit() {
        if (!form.name.trim()) return
        try {
            setSubmitting(true)
            const c = await getAuthedClient(getToken)
            const payload = { name: form.name, description: form.description || undefined }
            if (editing) {
                const r = await c.put<{ success: boolean; data: ApiRole }>(`/roles/${editing.id}`, payload)
                setRoles((prev) => prev.map((ro) => ro.id === editing.id ? r.data.data : ro))
            } else {
                const r = await c.post<{ success: boolean; data: ApiRole }>("/roles", payload)
                setRoles((prev) => [...prev, r.data.data])
            }
            setModalOpen(false)
        } catch (e) { console.error(e) } finally { setSubmitting(false) }
    }

    async function handleDelete() {
        if (!deleteTarget) return
        try {
            setDeleting(true)
            const c = await getAuthedClient(getToken)
            await c.delete(`/roles/${deleteTarget.id}`)
            setRoles((prev) => prev.filter((r) => r.id !== deleteTarget.id))
            setDeleteTarget(null)
        } catch (e) { console.error(e) } finally { setDeleting(false) }
    }

    return (
        <div className="space-y-4">
            <SectionHeader title="Roles" subtitle={`${roles.length} custom roles`} action={openCreate} actionLabel="Create Role" />
            <DataTable<ApiRole>
                loading={loading} data={roles} searchKeys={["name"]}
                columns={[
                    { key: "name", label: "Role Name" },
                    { key: "description", label: "Description", render: (r) => r.description ?? "—" },
                ]}
                onEdit={openEdit} onDelete={setDeleteTarget}
            />
            <CrudDrawer open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Role" : "Create Role"} onSubmit={handleSubmit} submitting={submitting}>
                <FormInput label="Role Name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. moderator" maxLength={50} />
                <FormTextarea label="Description" value={form.description} onChange={(v) => setForm((f) => ({ ...f, description: v }))} placeholder="What this role allows..." />
            </CrudDrawer>
            <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} confirming={deleting}
                title="Delete Role" description={`Delete role "${deleteTarget?.name}"? Users with this role will lose it.`} />
        </div>
    )
}

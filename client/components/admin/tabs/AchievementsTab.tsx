"use client"

import React, { useState, useEffect, useCallback } from "react"
import { getAuthedClient } from "@/lib/http"
import { DataTable } from "../DataTable"
import { CrudDrawer } from "../CrudDrawer"
import { ConfirmDialog } from "../ConfirmDialog"
import { SectionHeader } from "../SectionHeader"
import { FormInput, FormTextarea } from "../form"
import type { ApiAchievement } from "@/lib/types/api"

type GetToken = () => Promise<string | null>

interface AchForm { name: string; description: string; requiredXp: string; category: string; icon: string }
const emptyAchForm: AchForm = { name: "", description: "", requiredXp: "", category: "", icon: "" }

export function AchievementsTab({ getToken }: { getToken: GetToken }) {
    const [achievements, setAchievements] = useState<ApiAchievement[]>([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [editing, setEditing] = useState<ApiAchievement | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<ApiAchievement | null>(null)
    const [form, setForm] = useState<AchForm>(emptyAchForm)
    const [submitting, setSubmitting] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const load = useCallback(async () => {
        try {
            setLoading(true)
            const c = await getAuthedClient(getToken)
            const res = await c.get<{ success: boolean; data: ApiAchievement[] }>("/achievements")
            setAchievements(res.data.data)
        } catch (e) { console.error(e) } finally { setLoading(false) }
    }, [getToken])

    useEffect(() => { load() }, [load])

    function openCreate() { setEditing(null); setForm(emptyAchForm); setModalOpen(true) }
    function openEdit(a: ApiAchievement) {
        setEditing(a)
        setForm({ name: a.name, description: a.description ?? "", requiredXp: String(a.requiredXp), category: a.category ?? "", icon: a.icon ?? "" })
        setModalOpen(true)
    }

    async function handleSubmit() {
        if (!form.name.trim() || !form.requiredXp) return
        try {
            setSubmitting(true)
            const c = await getAuthedClient(getToken)
            const payload = { name: form.name, description: form.description || undefined, requiredXp: Number(form.requiredXp), category: form.category || undefined, icon: form.icon || undefined }
            if (editing) {
                const r = await c.put<{ success: boolean; data: ApiAchievement }>(`/achievements/${editing.id}`, payload)
                setAchievements((prev) => prev.map((a) => a.id === editing.id ? r.data.data : a))
            } else {
                const r = await c.post<{ success: boolean; data: ApiAchievement }>("/achievements", payload)
                setAchievements((prev) => [...prev, r.data.data])
            }
            setModalOpen(false)
        } catch (e) { console.error(e) } finally { setSubmitting(false) }
    }

    async function handleDelete() {
        if (!deleteTarget) return
        try {
            setDeleting(true)
            const c = await getAuthedClient(getToken)
            await c.delete(`/achievements/${deleteTarget.id}`)
            setAchievements((prev) => prev.filter((a) => a.id !== deleteTarget.id))
            setDeleteTarget(null)
        } catch (e) { console.error(e) } finally { setDeleting(false) }
    }

    return (
        <div className="space-y-4">
            <SectionHeader title="Achievements" subtitle={`${achievements.length} achievements`} action={openCreate} actionLabel="Create Achievement" />
            <DataTable<ApiAchievement>
                loading={loading} data={achievements} searchKeys={["name", "category"]}
                columns={[
                    { key: "name", label: "Name" },
                    { key: "category", label: "Category", render: (r) => r.category ?? "—" },
                    { key: "requiredXp", label: "Required XP", render: (r) => String(r.requiredXp) },
                    { key: "description", label: "Description", render: (r) => <span className="line-clamp-1 max-w-xs text-muted-foreground text-xs">{r.description ?? "—"}</span> },
                ]}
                onEdit={openEdit} onDelete={setDeleteTarget}
            />
            <CrudDrawer open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Achievement" : "Create Achievement"} onSubmit={handleSubmit} submitting={submitting}>
                <FormInput label="Name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} maxLength={100} />
                <FormTextarea label="Description" value={form.description} onChange={(v) => setForm((f) => ({ ...f, description: v }))} />
                <div className="grid grid-cols-2 gap-3">
                    <FormInput label="Required XP" required type="number" value={form.requiredXp} onChange={(e) => setForm((f) => ({ ...f, requiredXp: e.target.value }))} />
                    <FormInput label="Category" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} placeholder="e.g. Academic" />
                </div>
                <FormInput label="Icon URL" value={form.icon} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))} placeholder="https://..." />
            </CrudDrawer>
            <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} confirming={deleting}
                title="Delete Achievement" description={`Delete achievement "${deleteTarget?.name}"?`} />
        </div>
    )
}

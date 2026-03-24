"use client"

import React, { useState, useEffect, useCallback } from "react"
import { getAuthedClient } from "@/lib/http"
import { Loader2 } from "lucide-react"
import { DataTable } from "@/app/(dashboard)/admin/_components/DataTable"
import { SectionHeader } from "@/app/(dashboard)/admin/_components/SectionHeader"
import { CrudDrawer } from "@/app/(dashboard)/admin/_components/CrudDrawer"
import { ConfirmDialog } from "@/app/(dashboard)/admin/_components/ConfirmDialog"
import { FormInput } from "@/app/(dashboard)/admin/_components/form/FormInput"
import { FormTextarea } from "@/app/(dashboard)/admin/_components/form/FormTextarea"
import type { ApiAnnouncement } from "@/lib/types/api"


function fmtDate(s: string) {
    return new Date(s).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}

interface AnnForm { title: string; description: string }
const emptyAnnForm: AnnForm = { title: "", description: "" }

export default function AnnouncementsPage() {
    const [announcements, setAnnouncements] = useState<ApiAnnouncement[]>([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<ApiAnnouncement | null>(null)
    const [form, setForm] = useState<AnnForm>(emptyAnnForm)
    const [submitting, setSubmitting] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const load = useCallback(async () => {
        try {
            setLoading(true)
            const c = await getAuthedClient()
            const res = await c.get<{ success: boolean; data: ApiAnnouncement[] }>("/announcements")
            setAnnouncements(res.data.data)
        } catch (e) { console.error(e) } finally { setLoading(false) }
    }, [])

    useEffect(() => { load() }, [load])

    async function handleSubmit() {
        if (!form.title.trim()) return
        try {
            setSubmitting(true)
            const c = await getAuthedClient()
            const res = await c.post<{ success: boolean; data: ApiAnnouncement }>("/announcements", { title: form.title, description: form.description || undefined })
            setAnnouncements((prev) => [res.data.data, ...prev])
            setModalOpen(false); setForm(emptyAnnForm)
        } catch (e) { console.error(e) } finally { setSubmitting(false) }
    }

    async function handleDelete() {
        if (!deleteTarget) return
        try {
            setDeleting(true)
            const c = await getAuthedClient()
            await c.delete(`/announcements/${deleteTarget.id}`)
            setAnnouncements((prev) => prev.filter((a) => a.id !== deleteTarget.id))
            setDeleteTarget(null)
        } catch (e) { console.error(e) } finally { setDeleting(false) }
    }

    return (
        <div className="space-y-4">
            <SectionHeader title="Announcements" subtitle={`${announcements.length} total`} action={() => { setForm(emptyAnnForm); setModalOpen(true) }} actionLabel="Post Announcement" />
            <DataTable<ApiAnnouncement>
                loading={loading} data={announcements} searchKeys={["title"]}
                columns={[
                    { key: "title", label: "Title" },
                    { key: "user", label: "By", render: (r) => r.user?.username ?? "—" },
                    { key: "createdAt", label: "Posted", render: (r) => fmtDate(r.createdAt) },
                    { key: "description", label: "Content", render: (r) => <span className="line-clamp-1 max-w-xs text-muted-foreground">{r.description ?? "—"}</span> },
                ]}
                onDelete={setDeleteTarget}
            />

            <CrudDrawer open={modalOpen} onClose={() => setModalOpen(false)} title="Post Announcement" onSubmit={handleSubmit} submitting={submitting} submitLabel="Post">
                <FormInput label="Title" required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Announcement title" maxLength={100} />
                <FormTextarea label="Content" value={form.description} onChange={(v) => setForm((f) => ({ ...f, description: v }))} placeholder="Optional description..." rows={4} />
            </CrudDrawer>

            <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} confirming={deleting}
                title="Delete Announcement" description={`Delete "${deleteTarget?.title}"?`} />
        </div>
    )
}


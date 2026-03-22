"use client"

import React, { useState, useEffect, useCallback } from "react"
import { api } from "@/lib/api"
import { DataTable } from "@/components/admin/DataTable"
import { CrudDrawer } from "@/components/admin/CrudDrawer"
import { ConfirmDialog } from "@/components/admin/ConfirmDialog"
import { SectionHeader } from "@/components/admin/SectionHeader"
import { FormInput, FormTextarea } from "@/components/admin/form"
import type { ApiAnnouncement } from "@/lib/types/api"
import { toast } from "sonner"
import { Megaphone } from "lucide-react"

function fmtDate(s: string) {
    return new Date(s).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}

export default function AnnouncementsPage() {
    const [announcements, setAnnouncements] = useState<ApiAnnouncement[]>([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<ApiAnnouncement | null>(null)
    const [form, setForm] = useState({ title: "", description: "" })
    const [submitting, setSubmitting] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const load = useCallback(async () => {
        try {
            setLoading(true)
            const res = await api.get<ApiAnnouncement[]>("/announcements")
            if (res.success) {
                setAnnouncements(res.data || [])
            } else {
                toast.error(res.message || "Failed to load announcements")
            }
        } catch (e) { 
            console.error(e) 
            toast.error("Failed to load announcements")
        } finally { 
            setLoading(false) 
        }
    }, [])

    useEffect(() => { load() }, [load])

    async function handleSubmit() {
        if (!form.title.trim()) return
        try {
            setSubmitting(true)
            const res = await api.post<ApiAnnouncement>("/announcements", { 
                title: form.title, 
                description: form.description || undefined 
            })
            if (res.success && res.data) {
                toast.success("Announcement posted")
                setAnnouncements((prev) => [res.data as ApiAnnouncement, ...prev])
                setModalOpen(false)
                setForm({ title: "", description: "" })
            } else {
                toast.error(res.message || "Failed to post announcement")
            }
        } catch (e) { 
            console.error(e) 
            toast.error("An error occurred")
        } finally { 
            setSubmitting(false) 
        }
    }

    async function handleDelete() {
        if (!deleteTarget) return
        try {
            setDeleting(true)
            const res = await api.delete(`/announcements/${deleteTarget.id}`)
            if (res.success) {
                toast.success("Announcement deleted")
                setAnnouncements((prev) => prev.filter((a) => a.id !== deleteTarget.id))
                setDeleteTarget(null)
            } else {
                toast.error(res.message || "Failed to delete announcement")
            }
        } catch (e) { 
            console.error(e) 
            toast.error("Failed to delete announcement")
        } finally { 
            setDeleting(false) 
        }
    }

    return (
        <div className="space-y-4">
            <SectionHeader 
                title="Announcements" 
                subtitle={`${announcements.length} total`} 
                action={{
                    label: "Post",
                    icon: <Megaphone className="size-4" />,
                    onClick: () => { setForm({ title: "", description: "" }); setModalOpen(true) }
                }}
            />
            <DataTable<ApiAnnouncement>
                loading={loading} data={announcements} searchKeys={["title"]}
                columns={[
                    { key: "title", label: "Title" },
                    { key: "user", label: "Posted By", render: (r) => r.user?.username ?? "—" },
                    { key: "createdAt", label: "Date", render: (r) => fmtDate(r.createdAt) },
                    { key: "description", label: "Content", render: (r) => <span className="line-clamp-1 max-w-xs text-muted-foreground text-xs">{r.description ?? "—"}</span> },
                ]}
                onDelete={setDeleteTarget}
            />
            <CrudDrawer open={modalOpen} onClose={() => setModalOpen(false)} title="Post Announcement" onSubmit={handleSubmit} submitting={submitting} submitLabel="Post">
                <FormInput label="Title" required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} maxLength={100} disabled={submitting} />
                <FormTextarea label="Content" value={form.description} onChange={(v) => setForm((f) => ({ ...f, description: v }))} rows={4} disabled={submitting} />
            </CrudDrawer>
            <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} confirming={deleting}
                title="Delete Announcement" description={`Delete "${deleteTarget?.title}"?`} />
        </div>
    )
}

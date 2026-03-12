"use client"

import React, { useState, useEffect, useCallback } from "react"
import { getAuthedClient } from "@/lib/http"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DataTable } from "../DataTable"
import { CrudDrawer } from "../CrudDrawer"
import { ConfirmDialog } from "../ConfirmDialog"
import { SectionHeader } from "../SectionHeader"
import { RoleBadge } from "../RoleBadge"
import { FormInput, FormTextarea } from "../form"
import type { ApiProduct } from "@/lib/types/api"

type GetToken = () => Promise<string | null>

function fmtCurrency(n: number | string) {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(Number(n))
}

export function ProductsTab({ getToken }: { getToken: GetToken }) {
    const [products, setProducts] = useState<ApiProduct[]>([])
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState<ApiProduct | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<ApiProduct | null>(null)
    const [form, setForm] = useState({ name: "", description: "", price: "", stock: "", imageUrl: "" })
    const [submitting, setSubmitting] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [approvalLoading, setApprovalLoading] = useState<number | null>(null)

    const load = useCallback(async () => {
        try {
            setLoading(true)
            const c = await getAuthedClient(getToken)
            const [allRes, pendRes] = await Promise.all([
                c.get<{ success: boolean; data: ApiProduct[] }>("/market/products"),
                c.get<{ success: boolean; data: ApiProduct[] }>("/market/pending"),
            ])
            const all = allRes.data.data
            const pending = pendRes.data.data
            const merged = [...pending, ...all.filter((p) => !pending.some((q) => q.id === p.id))]
            setProducts(merged)
        } catch (e) { console.error(e) } finally { setLoading(false) }
    }, [getToken])

    useEffect(() => { load() }, [load])

    function openEdit(p: ApiProduct) {
        setEditing(p)
        setForm({ name: p.name, description: p.description ?? "", price: String(p.price), stock: String(p.stock), imageUrl: p.image ?? "" })
    }

    async function handleUpdate() {
        if (!editing || !form.name.trim()) return
        try {
            setSubmitting(true)
            const c = await getAuthedClient(getToken)
            const r = await c.put<{ success: boolean; data: ApiProduct }>(`/market/products/${editing.id}`, {
                name: form.name, description: form.description || undefined,
                price: Number(form.price), stock: Number(form.stock), imageUrl: form.imageUrl || undefined,
            })
            setProducts((prev) => prev.map((p) => p.id === editing.id ? r.data.data : p))
            setEditing(null)
        } catch (e) { console.error(e) } finally { setSubmitting(false) }
    }

    async function handleDelete() {
        if (!deleteTarget) return
        try {
            setDeleting(true)
            const c = await getAuthedClient(getToken)
            await c.delete(`/market/products/${deleteTarget.id}`)
            setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id))
            setDeleteTarget(null)
        } catch (e) { console.error(e) } finally { setDeleting(false) }
    }

    async function handleApproval(id: number, status: "approved" | "rejected") {
        try {
            setApprovalLoading(id)
            const c = await getAuthedClient(getToken)
            const r = await c.patch<{ success: boolean; data: ApiProduct }>(`/market/products/${id}/approval`, { status })
            setProducts((prev) => prev.map((p) => p.id === id ? r.data.data : p))
        } catch (e) { console.error(e) } finally { setApprovalLoading(null) }
    }

    return (
        <div className="space-y-4">
            <SectionHeader title="Products" subtitle={`${products.length} total`} />
            <DataTable<ApiProduct>
                loading={loading} data={products} searchKeys={["name"]}
                columns={[
                    { key: "name", label: "Product" },
                    { key: "creator", label: "By", render: (r) => r.creator?.username ?? "—" },
                    { key: "price", label: "Price", render: (r) => fmtCurrency(r.price) },
                    { key: "stock", label: "Stock" },
                    { key: "approval", label: "Status", render: (r) => <RoleBadge value={r.approval} /> },
                ]}
                onEdit={openEdit} onDelete={setDeleteTarget}
                extraActions={(row) => row.approval === "pending" ? (
                    <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600" disabled={approvalLoading === row.id} onClick={() => handleApproval(row.id, "approved")}>
                            {approvalLoading === row.id ? <Loader2 className="size-3 animate-spin" /> : <CheckCircle className="size-3.5" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600" disabled={approvalLoading === row.id} onClick={() => handleApproval(row.id, "rejected")}>
                            <XCircle className="size-3.5" />
                        </Button>
                    </div>
                ) : null}
            />
            <CrudDrawer open={!!editing} onClose={() => setEditing(null)} title="Edit Product" onSubmit={handleUpdate} submitting={submitting}>
                <FormInput label="Name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                <FormTextarea label="Description" value={form.description} onChange={(v) => setForm((f) => ({ ...f, description: v }))} />
                <div className="grid grid-cols-2 gap-3">
                    <FormInput label="Price" required type="number" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
                    <FormInput label="Stock" required type="number" value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))} />
                </div>
                <FormInput label="Image URL" value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} placeholder="https://..." />
            </CrudDrawer>
            <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} confirming={deleting}
                title="Delete Product" description={`Delete "${deleteTarget?.name}"?`} />
        </div>
    )
}

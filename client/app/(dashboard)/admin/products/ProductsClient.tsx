"use client"

import React, { useState, useEffect, useCallback } from "react"
import { api } from "@/services/api/client"
import { toast } from "sonner"
import { SectionHeader } from "@/features/admin/components/SectionHeader"
import { CrudDrawer } from "@/features/admin/components/CrudDrawer"
import { ConfirmDialog } from "@/features/admin/components/ConfirmDialog"
import { ProductTable } from "./_components/ProductTable"
import { ProductEditForm } from "./_components/ProductEditForm"
import { fetchProducts } from "./data"
import { initForm, type ProductFormData } from "./_types"
import type { ApiProduct } from "./_types"

interface ProductsClientProps {
    initialProducts: ApiProduct[]
}

export function ProductsClient({ initialProducts }: ProductsClientProps) {
    const [products, setProducts] = useState<ApiProduct[]>(initialProducts)
    const [loading, setLoading] = useState(false)
    const [editing, setEditing] = useState<ApiProduct | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<ApiProduct | null>(null)
    const [form, setForm] = useState<ProductFormData>(initForm())
    const [submitting, setSubmitting] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [approvalLoading, setApprovalLoading] = useState<number | null>(null)

    const load = useCallback(async () => {
        try {
            setLoading(true)
            const data = await fetchProducts()
            setProducts(data)
        } catch (e) {
            console.error(e)
            toast.error("Failed to load products")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        load()
    }, [load])

    function openEdit(p: ApiProduct) {
        setEditing(p)
        setForm(initForm(p))
    }

    async function handleUpdate() {
        if (!editing || !form.name.trim()) return
        try {
            setSubmitting(true)
            const r = await api.put<ApiProduct>(`/market/products/${editing.id}`, {
                name: form.name,
                description: form.description || undefined,
                price: Number(form.price),
                stock: Number(form.stock),
                imageUrl: form.imageUrl || undefined,
            })
            if (r.success) {
                toast.success("Product updated")
                setProducts((prev) => prev.map((p) => (p.id === editing.id ? (r.data as ApiProduct) : p)))
                setEditing(null)
            } else {
                toast.error(r.message || "Failed to update product")
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
            const res = await api.delete(`/market/products/${deleteTarget.id}`)
            if (res.success) {
                toast.success("Product deleted")
                setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id))
                setDeleteTarget(null)
            } else {
                toast.error(res.message || "Failed to delete product")
            }
        } catch (e) {
            console.error(e)
            toast.error("Failed to delete product")
        } finally {
            setDeleting(false)
        }
    }

    async function handleApproval(id: number, status: "approved" | "rejected") {
        try {
            setApprovalLoading(id)
            const r = await api.patch<ApiProduct>(`/market/products/${id}/approval`, { status })
            if (r.success) {
                toast.success(`Product ${status}`)
                setProducts((prev) => prev.map((p) => (p.id === id ? (r.data as ApiProduct) : p)))
            } else {
                toast.error(r.message || "Approval failed")
            }
        } catch (e) {
            console.error(e)
            toast.error("Approval failed")
        } finally {
            setApprovalLoading(null)
        }
    }

    return (
        <div className="space-y-4">
            <SectionHeader title="Products" subtitle={`${products.length} total items in market`} />

            <ProductTable
                loading={loading}
                data={products}
                approvalLoading={approvalLoading}
                onEdit={openEdit}
                onDelete={setDeleteTarget}
                onApproval={handleApproval}
            />

            <CrudDrawer
                open={!!editing}
                onClose={() => setEditing(null)}
                title="Edit Product"
                onSubmit={handleUpdate}
                submitting={submitting}
            >
                <ProductEditForm form={form} onChange={setForm} />
            </CrudDrawer>

            <ConfirmDialog
                open={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                confirming={deleting}
                title="Delete Product"
                description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
            />
        </div>
    )
}

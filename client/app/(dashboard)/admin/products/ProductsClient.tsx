"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { api } from "@/services/api/client"
import { toast } from "sonner"
import { SectionHeader } from "@/features/admin/components/SectionHeader"
import { CrudDrawer } from "@/features/admin/components/CrudDrawer"
import { ConfirmDialog } from "@/features/admin/components/ConfirmDialog"
import { ProductEditForm } from "./_components/ProductEditForm"
import { fetchProducts, fmtCurrency } from "./data"
import { initForm, type ProductFormData } from "./_types"
import type { ApiProduct } from "./_types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Pencil, Trash2, CheckCircle, XCircle, Package, Loader2, ImageIcon } from "lucide-react"

interface ProductsClientProps {
    initialProducts: ApiProduct[]
}

const approvalColors: Record<string, string> = {
    approved: "bg-green-500/15 text-green-600",
    rejected: "bg-red-500/15 text-red-600",
    pending: "bg-yellow-500/15 text-yellow-600",
}

function fmtDate(value: string) {
    return new Date(value).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    })
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
    const [searchQuery, setSearchQuery] = useState("")

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

    const filteredProducts = useMemo(() => {
        if (!searchQuery.trim()) return products
        const query = searchQuery.toLowerCase()
        return products.filter(
            (p) =>
                p.name.toLowerCase().includes(query) ||
                p.description?.toLowerCase().includes(query) ||
                p.creator?.username?.toLowerCase().includes(query)
        )
    }, [products, searchQuery])

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

    if (loading) {
        return (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading products...
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <SectionHeader title="Products" subtitle={`${products.length} total items in market`} />

            <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    className="rounded-xl pl-9"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {filteredProducts.length === 0 ? (
                <Card className="border-dashed border-border/70">
                    <CardContent className="flex flex-col items-center justify-center py-10 text-center text-sm text-muted-foreground">
                        <Package className="size-8 mb-2 opacity-40" />
                        {searchQuery ? "No products match your search." : "No products found."}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredProducts.map((product) => (
                        <Card key={product.id} className="border-border/60 overflow-hidden">
                            <div className="aspect-video relative bg-muted">
                                {product.image ? (
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <ImageIcon className="size-10 text-muted-foreground/50" />
                                    </div>
                                )}
                                <Badge className={`absolute top-2 right-2 text-[10px] font-semibold ${approvalColors[product.approval]}`}>
                                    {product.approval}
                                </Badge>
                            </div>
                            <CardContent className="flex flex-col gap-2 p-4">
                                <div className="space-y-1 flex-1">
                                    <h3 className="font-semibold text-foreground line-clamp-1">{product.name}</h3>
                                    {product.description && (
                                        <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                                    )}
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-semibold text-brand-purple">{fmtCurrency(product.price)}</span>
                                        <span className="text-muted-foreground">Stock: {product.stock}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span>By {product.creator?.username ?? "Unknown"}</span>
                                        <span>{fmtDate(product.createdAt)}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                                    {product.approval === "pending" && (
                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-500/10"
                                                disabled={approvalLoading === product.id}
                                                onClick={() => handleApproval(product.id, "approved")}
                                            >
                                                {approvalLoading === product.id ? (
                                                    <Loader2 className="size-4 animate-spin" />
                                                ) : (
                                                    <CheckCircle className="size-4" />
                                                )}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-500/10"
                                                disabled={approvalLoading === product.id}
                                                onClick={() => handleApproval(product.id, "rejected")}
                                            >
                                                <XCircle className="size-4" />
                                            </Button>
                                        </div>
                                    )}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 gap-1.5 text-xs"
                                        onClick={() => openEdit(product)}
                                    >
                                        <Pencil className="size-3.5" />
                                        Edit
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => setDeleteTarget(product)}
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

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

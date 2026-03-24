"use client"

import React, { useState, useEffect, useCallback } from "react"
import { getAuthedClient } from "@/services/api/client"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/features/admin/components/DataTable"
import { SectionHeader } from "@/features/admin/components/SectionHeader"
import { RoleBadge } from "@/features/admin/components/RoleBadge"
import type { ApiProduct } from "@/lib/types/api"


function fmtCurrency(n: number | string) {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(Number(n))
}

export default function ProductsPage() {
    const [products, setProducts] = useState<ApiProduct[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<number | null>(null)

    const load = useCallback(async () => {
        try {
            setLoading(true)
            const c = await getAuthedClient()
            const res = await c.get<{ success: boolean; data: ApiProduct[] }>("/market/pending")
            setProducts(res.data.data)
        } catch (e) { console.error(e) } finally { setLoading(false) }
    }, [])

    useEffect(() => { load() }, [load])

    async function approve(id: number, status: "approved" | "rejected") {
        try {
            setActionLoading(id)
            const c = await getAuthedClient()
            await c.patch(`/market/products/${id}/approval`, { status })
            setProducts((prev) => prev.filter((p) => p.id !== id))
        } catch (e) { console.error(e) } finally { setActionLoading(null) }
    }

    return (
        <div className="space-y-4">
            <SectionHeader title="Product Approvals" subtitle={`${products.length} pending approval`} />
            <DataTable<ApiProduct>
                loading={loading} data={products} searchKeys={["name"]}
                columns={[
                    { key: "name", label: "Product" },
                    { key: "creator", label: "By", render: (r) => r.creator?.username ?? "—" },
                    { key: "price", label: "Price", render: (r) => fmtCurrency(r.price) },
                    { key: "stock", label: "Stock" },
                    { key: "approval", label: "Status", render: (r) => <RoleBadge value={r.approval} /> },
                ]}
                extraActions={(row) => (
                    <div className="flex gap-1">
                        <Button variant="outline" size="sm" className="h-7 gap-1 text-xs text-green-600 hover:text-green-600 border-green-200"
                            disabled={actionLoading === row.id} onClick={() => approve(row.id, "approved")}>
                            {actionLoading === row.id ? <Loader2 className="size-3 animate-spin" /> : <CheckCircle className="size-3" />}
                            Approve
                        </Button>
                        <Button variant="outline" size="sm" className="h-7 gap-1 text-xs text-red-600 hover:text-red-600 border-red-200"
                            disabled={actionLoading === row.id} onClick={() => approve(row.id, "rejected")}>
                            <XCircle className="size-3" />
                            Reject
                        </Button>
                    </div>
                )}
                emptyText="No products pending approval"
            />
        </div>
    )
}


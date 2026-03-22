"use client"

import React from "react"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/admin/DataTable"
import { RoleBadge } from "@/components/admin/RoleBadge"
import { fmtCurrency } from "../_types"
import type { ApiProduct } from "../_types"

interface ProductTableProps {
    loading: boolean
    data: ApiProduct[]
    approvalLoading: number | null
    onEdit: (product: ApiProduct) => void
    onDelete: (product: ApiProduct) => void
    onApproval: (id: number, status: "approved" | "rejected") => void
}

export function ProductTable({
    loading,
    data,
    approvalLoading,
    onEdit,
    onDelete,
    onApproval,
}: ProductTableProps) {
    const columns = [
        { key: "name", label: "Product" },
        { key: "creator", label: "By", render: (r: ApiProduct) => r.creator?.username ?? "—" },
        { key: "price", label: "Price", render: (r: ApiProduct) => fmtCurrency(r.price) },
        { key: "stock", label: "Stock" },
        { key: "approval", label: "Status", render: (r: ApiProduct) => <RoleBadge value={r.approval} /> },
    ]

    return (
        <DataTable<ApiProduct>
            loading={loading}
            data={data}
            searchKeys={["name"]}
            columns={columns}
            onEdit={onEdit}
            onDelete={onDelete}
            extraActions={(row) =>
                row.approval === "pending" ? (
                    <div className="flex gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-green-600"
                            disabled={approvalLoading === row.id}
                            onClick={() => onApproval(row.id, "approved")}
                        >
                            {approvalLoading === row.id ? (
                                <Loader2 className="size-3 animate-spin" />
                            ) : (
                                <CheckCircle className="size-3.5" />
                            )}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-red-600"
                            disabled={approvalLoading === row.id}
                            onClick={() => onApproval(row.id, "rejected")}
                        >
                            <XCircle className="size-3.5" />
                        </Button>
                    </div>
                ) : null
            }
        />
    )
}

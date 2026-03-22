"use client"

import { Pencil, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/admin/DataTable"
import { getTypeIcon, type SystemConfig } from "../_types"

interface ConfigTableProps {
    loading: boolean
    data: SystemConfig[]
    onEdit: (config: SystemConfig) => void
    onDelete: (config: SystemConfig) => void
}

export function ConfigTable({ loading, data, onEdit, onDelete }: ConfigTableProps) {
    const columns = [
        {
            key: "key",
            label: "Configuration Key",
            render: (row: SystemConfig) => (
                <div className="flex flex-col">
                    <span className="font-bold text-foreground">{row.key}</span>
                    <span className="text-[10px] text-muted-foreground line-clamp-1">
                        {row.description}
                    </span>
                </div>
            ),
        },
        {
            key: "type",
            label: "Type",
            render: (row: SystemConfig) => (
                <Badge
                    variant="outline"
                    className="text-[10px] uppercase font-bold px-1.5 py-0 flex items-center w-fit"
                >
                    {getTypeIcon(row.type)}
                    {row.type}
                </Badge>
            ),
        },
        {
            key: "value",
            label: "Value",
            render: (row: SystemConfig) => (
                <code className="text-[11px] bg-muted px-1.5 py-0.5 rounded border border-border/50 max-w-[200px] truncate block">
                    {row.value}
                </code>
            ),
        },
    ]

    return (
        <DataTable
            columns={columns}
            data={data}
            isLoading={loading}
            searchKeys={["key", "description"]}
            actions={(row) => (
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={() => onEdit(row)}
                        className="p-2 text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                    >
                        <Pencil className="size-4" />
                    </button>
                    <button
                        onClick={() => onDelete(row)}
                        className="p-2 text-red-500/80 hover:text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"
                    >
                        <Trash2 className="size-4" />
                    </button>
                </div>
            )}
        />
    )
}

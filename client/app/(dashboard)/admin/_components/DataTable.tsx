"use client"

import React, { useState } from "react"
import { Loader2, Trash2, Pencil, ChevronLeft, ChevronRight, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export interface Column<T> {
    key: string
    label: string
    render?: (row: T) => React.ReactNode
    width?: string
}

interface DataTableProps<T extends { id: number | string }> {
    columns: Column<T>[]
    data: T[]
    loading?: boolean
    onEdit?: (row: T) => void
    onDelete?: (row: T) => void
    extraActions?: (row: T) => React.ReactNode
    searchable?: boolean
    searchKeys?: (keyof T)[]
    pageSize?: number
    emptyText?: string
}

export function DataTable<T extends { id: number | string }>({
    columns,
    data,
    loading,
    onEdit,
    onDelete,
    extraActions,
    searchable = true,
    searchKeys = [],
    pageSize = 10,
    emptyText = "No records found",
}: DataTableProps<T>) {
    const [search, setSearch] = useState("")
    const [page, setPage] = useState(1)

    const filtered = search.trim()
        ? data.filter((row) =>
            searchKeys.some((k) => String(row[k] ?? "").toLowerCase().includes(search.toLowerCase()))
        )
        : data

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
    const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

    return (
        <div className="flex flex-col gap-3">
            {searchable && (
                <div className="relative max-w-xs">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                        className="h-8 pl-8 text-sm"
                    />
                </div>
            )}

            <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                        <tr>
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
                                    style={{ width: col.width }}
                                >
                                    {col.label}
                                </th>
                            ))}
                            {(onEdit || onDelete || extraActions) && (
                                <th className="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-24">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {loading ? (
                            <tr>
                                <td colSpan={columns.length + 1} className="py-12 text-center">
                                    <Loader2 className="mx-auto size-6 animate-spin text-muted-foreground/50" />
                                </td>
                            </tr>
                        ) : paged.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + 1} className="py-12 text-center text-sm text-muted-foreground">
                                    {emptyText}
                                </td>
                            </tr>
                        ) : (
                            paged.map((row) => (
                                <tr key={row.id} className="bg-background hover:bg-muted/30 transition-colors">
                                    {columns.map((col) => (
                                        <td key={col.key} className="px-3 py-2.5 text-foreground">
                                            {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? "—")}
                                        </td>
                                    ))}
                                    {(onEdit || onDelete || extraActions) && (
                                        <td className="px-3 py-2.5">
                                            <div className="flex items-center justify-end gap-1">
                                                {extraActions?.(row)}
                                                {onEdit && (
                                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(row)}>
                                                        <Pencil className="size-3.5" />
                                                    </Button>
                                                )}
                                                {onDelete && (
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => onDelete(row)}>
                                                        <Trash2 className="size-3.5" />
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{filtered.length} record{filtered.length !== 1 ? "s" : ""}</span>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                            <ChevronLeft className="size-3.5" />
                        </Button>
                        <span className="px-2">Page {page} of {totalPages}</span>
                        <Button variant="ghost" size="icon" className="h-7 w-7" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                            <ChevronRight className="size-3.5" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}


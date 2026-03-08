"use client"

import React, { useState } from "react"
import { Loader2, Trash2, Pencil, Plus, ChevronLeft, ChevronRight, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
    Sheet,
    SheetContent,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet"

// ─── StatCard ────────────────────────────────────────────────────────────────

export function StatCard({
    label, value, icon, sub, color = "text-primary",
}: {
    label: string
    value: string | number
    icon: React.ReactNode
    sub?: string
    color?: string
}) {
    return (
        <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
                        <p className={`mt-1 text-3xl font-bold ${color}`}>{value}</p>
                        {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
                    </div>
                    <div className="rounded-xl bg-primary/10 p-2.5 text-primary">{icon}</div>
                </div>
            </CardContent>
        </Card>
    )
}

// ─── DataTable ────────────────────────────────────────────────────────────────

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
    columns, data, loading, onEdit, onDelete, extraActions,
    searchable = true, searchKeys = [], pageSize = 10, emptyText = "No records found",
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

// ─── CrudModal ────────────────────────────────────────────────────────────────

interface CrudModalProps {
    open: boolean
    onClose: () => void
    title: string
    onSubmit: () => Promise<void>
    submitting?: boolean
    children: React.ReactNode
    submitLabel?: string
}

export function CrudModal({ open, onClose, title, onSubmit, submitting, children, submitLabel = "Save" }: CrudModalProps) {
    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 py-2">{children}</div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={submitting}>Cancel</Button>
                    <Button onClick={onSubmit} disabled={submitting}>
                        {submitting && <Loader2 className="mr-2 size-3.5 animate-spin" />}
                        {submitting ? "Saving..." : submitLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// ─── CrudDrawer (bottom sheet for forms) ────────────────────────────────────────

interface CrudDrawerProps {
    open: boolean
    onClose: () => void
    title: string
    description?: string
    onSubmit: () => Promise<void>
    submitting?: boolean
    children: React.ReactNode
    submitLabel?: string
}

export function CrudDrawer({
    open,
    onClose,
    title,
    description,
    onSubmit,
    submitting,
    children,
    submitLabel = "Save",
}: CrudDrawerProps) {
    return (
        <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
            <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
                <SheetHeader className="pb-2">
                    <SheetTitle>{title}</SheetTitle>
                    {description && <SheetDescription>{description}</SheetDescription>}
                </SheetHeader>
                <div className="space-y-3 px-6 pb-4 pt-2">
                    {children}
                </div>
                <SheetFooter className="flex-row items-center justify-end gap-3 border-t border-border bg-muted/40 px-6 py-3">
                    <Button variant="outline" onClick={onClose} disabled={submitting}>
                        Cancel
                    </Button>
                    <Button onClick={onSubmit} disabled={submitting}>
                        {submitting && <Loader2 className="mr-2 size-3.5 animate-spin" />}
                        {submitting ? "Saving..." : submitLabel}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}

// ─── ConfirmDialog ────────────────────────────────────────────────────────────

interface ConfirmDialogProps {
    open: boolean
    onClose: () => void
    onConfirm: () => Promise<void>
    title: string
    description?: string
    confirming?: boolean
}

export function ConfirmDialog({ open, onClose, onConfirm, title, description, confirming }: ConfirmDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={(v) => !v && onClose()}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    {description && <AlertDialogDescription>{description}</AlertDialogDescription>}
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={confirming}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => { e.preventDefault(); onConfirm() }}
                        disabled={confirming}
                        className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                    >
                        {confirming && <Loader2 className="mr-2 size-3.5 animate-spin" />}
                        {confirming ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

// ─── SectionHeader ────────────────────────────────────────────────────────────

export function SectionHeader({
    title, subtitle, action, actionLabel, actionIcon,
}: {
    title: string
    subtitle?: string
    action?: () => void
    actionLabel?: string
    actionIcon?: React.ReactNode
}) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <h2 className="text-lg font-bold text-foreground">{title}</h2>
                {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
            </div>
            {action && (
                <Button size="sm" className="gap-1.5" onClick={action}>
                    {actionIcon ?? <Plus className="size-3.5" />}
                    {actionLabel ?? "Add"}
                </Button>
            )}
        </div>
    )
}

// ─── RoleBadge ────────────────────────────────────────────────────────────────

const roleColors: Record<string, string> = {
    admin: "bg-red-500/15 text-red-600 dark:text-red-400",
    teacher: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
    student: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    staff: "bg-green-500/15 text-green-600 dark:text-green-400",
    pending: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400",
    approved: "bg-green-500/15 text-green-600 dark:text-green-400",
    rejected: "bg-red-500/15 text-red-600 dark:text-red-400",
    success: "bg-green-500/15 text-green-600 dark:text-green-400",
    failed: "bg-red-500/15 text-red-600 dark:text-red-400",
    credit: "bg-green-500/15 text-green-600 dark:text-green-400",
    debit: "bg-red-500/15 text-red-600 dark:text-red-400",
}

export function RoleBadge({ value }: { value: string }) {
    const cls = roleColors[value?.toLowerCase()] ?? "bg-muted text-muted-foreground"
    return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${cls}`}>
            {value}
        </span>
    )
}

// ─── FormField ────────────────────────────────────────────────────────────────

export function FormField({
    label, children, required,
}: {
    label: string
    children: React.ReactNode
    required?: boolean
}) {
    return (
        <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">
                {label}
                {required && <span className="ml-0.5 text-destructive">*</span>}
            </label>
            {children}
        </div>
    )
}

export function FormInput(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
    const { label, required, ...rest } = props
    return (
        <FormField label={label} required={required}>
            <Input {...rest} className="h-9 text-sm" />
        </FormField>
    )
}

export function FormSelect({
    label, required, options, value, onChange,
}: {
    label: string
    required?: boolean
    options: { value: string; label: string }[]
    value: string
    onChange: (v: string) => void
}) {
    return (
        <FormField label={label} required={required}>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
                {options.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                ))}
            </select>
        </FormField>
    )
}

export function FormTextarea({
    label, required, value, onChange, rows = 3, placeholder,
}: {
    label: string
    required?: boolean
    value: string
    onChange: (v: string) => void
    rows?: number
    placeholder?: string
}) {
    return (
        <FormField label={label} required={required}>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                rows={rows}
                placeholder={placeholder}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
        </FormField>
    )
}

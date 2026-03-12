"use client"

import React from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"

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


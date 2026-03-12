"use client"

import React from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet"

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


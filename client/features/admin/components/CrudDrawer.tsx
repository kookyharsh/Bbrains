"use client"

import React from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

interface CrudDrawerProps {
    open: boolean
    onClose: () => void
    title: string
    description?: string
    onSubmit: () => Promise<void>
    submitting?: boolean
    children: React.ReactNode
    submitLabel?: string
    maxWidth?: string
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
    maxWidth = "sm:max-w-2xl"
}: CrudDrawerProps) {
    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className={cn("max-h-[90vh] overflow-y-auto flex flex-col p-0 gap-0 border-none bg-card", maxWidth)}>
                <DialogHeader className="px-6 pt-6 pb-2">
                    <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
                    {description && <DialogDescription className="text-sm text-muted-foreground">{description}</DialogDescription>}
                </DialogHeader>
                
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    {children}
                </div>

                <DialogFooter className="flex-row items-center justify-end gap-3 border-t border-border bg-muted/30 px-6 py-4 mt-auto">
                    <Button variant="ghost" onClick={onClose} disabled={submitting} className="font-medium">
                        Cancel
                    </Button>
                    <Button 
                        onClick={onSubmit} 
                        disabled={submitting}
                        className="bg-brand-purple hover:bg-brand-purple/90 text-white min-w-[100px] font-semibold shadow-lg shadow-brand-purple/20 transition-all active:scale-95"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            submitLabel
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}


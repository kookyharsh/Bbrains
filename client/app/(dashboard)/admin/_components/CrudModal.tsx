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
            <DialogContent className="max-h-[90vh] sm:max-w-lg p-0 border-none bg-card shadow-2xl overflow-hidden flex flex-col rounded-2xl">
                <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/50 bg-muted/20">
                    <DialogTitle className="text-xl font-bold tracking-tight">{title}</DialogTitle>
                </DialogHeader>
                
                <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
                    {children}
                </div>

                <DialogFooter className="px-6 py-4 border-t border-border/50 flex items-center justify-end gap-3 bg-muted/20">
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


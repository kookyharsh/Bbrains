"use client"

import React, { useState, useEffect } from "react"
import { CheckCircle2, Search, XCircle, Clock, Trash2, Eye, Lock } from "lucide-react"
import { suggestionApi, Suggestion } from "@/services/api/client"
import { SectionHeader } from "@/features/admin/components/SectionHeader"
import { DataTable } from "@/features/admin/components/DataTable"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useHasPermission } from "@/components/providers/permissions-provider"

function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
    })
}

export default function SuggestionsPage() {
    const canManageSuggestions = useHasPermission("manage_suggestions")
    const [suggestions, setSuggestions] = useState<Suggestion[]>([])
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] = useState<Suggestion | null>(null)
    const [viewOpen, setViewOpen] = useState(false)

    if (!canManageSuggestions) {
        return (
            <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-3 text-muted-foreground">
                <Lock className="size-10 opacity-40" />
                <p className="text-sm font-medium">Access Denied</p>
                <p className="text-xs">You need the "Manage Suggestions" permission to view this page.</p>
            </div>
        )
    }

    const fetchSuggestions = async () => {
        setLoading(true)
        try {
            const res = await suggestionApi.getSuggestions()
            if (res.success) {
                setSuggestions(res.data || [])
            } else {
                toast.error(res.message || "Failed to load suggestions")
            }
        } catch (error) {
            toast.error("Failed to load suggestions")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSuggestions()
    }, [])

    const handleUpdateStatus = async (id: number, status: string) => {
        try {
            const res = await suggestionApi.updateStatus(id, status)
            if (res.success) {
                toast.success(`Status updated to ${status}`)
                fetchSuggestions()
                if (selected?.id === id) setViewOpen(false)
            } else {
                toast.error(res.message || "Failed to update status")
            }
        } catch (error) {
            toast.error("Failed to update status")
        }
    }

    const handleDelete = async (id: number) => {
        try {
            const res = await suggestionApi.deleteSuggestion(id)
            if (res.success) {
                toast.success("Suggestion deleted")
                fetchSuggestions()
            } else {
                toast.error(res.message || "Failed to delete")
            }
        } catch (error) {
            toast.error("Failed to delete")
        }
    }

    const columns = [
        {
            key: "user",
            label: "User",
            render: (row: Suggestion) => (
                <div className="flex flex-col">
                    <span className="font-bold text-foreground">
                        {row.user?.userDetails?.firstName} {row.user?.userDetails?.lastName}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">@{row.user?.username}</span>
                </div>
            )
        },
        {
            key: "title",
            label: "Suggestion",
            render: (row: Suggestion) => (
                <div className="flex flex-col max-w-[300px]">
                    <span className="font-medium text-sm truncate">{row.title}</span>
                    <span className="text-[10px] text-muted-foreground line-clamp-1">{row.content}</span>
                </div>
            )
        },
        {
            key: "status",
            label: "Status",
            render: (row: Suggestion) => {
                const config: Record<string, any> = {
                    pending: { icon: <Clock className="size-3 mr-1" />, class: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
                    reviewed: { icon: <Search className="size-3 mr-1" />, class: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
                    implemented: { icon: <CheckCircle2 className="size-3 mr-1" />, class: "bg-green-500/10 text-green-500 border-green-500/20" },
                    rejected: { icon: <XCircle className="size-3 mr-1" />, class: "bg-red-500/10 text-red-500 border-red-500/20" },
                }
                const c = config[row.status] || config.pending
                return (
                    <Badge variant="outline" className={cn("text-[10px] uppercase font-black px-2 py-0", c.class)}>
                        {c.icon} {row.status}
                    </Badge>
                )
            }
        }
    ]

    return (
        <div className="space-y-6">
            <SectionHeader 
                title="User Suggestions" 
                subtitle="Review and manage feedback from students"
            />

            <DataTable 
                columns={columns}
                data={suggestions}
                isLoading={loading}
                searchKeys={["title", "content"]}
                extraActions={(row) => (
                    <div className="flex items-center justify-end gap-2">
                        <button 
                            onClick={() => { setSelected(row); setViewOpen(true); }} 
                            className="p-2 text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                        >
                            <Eye className="size-4" />
                        </button>
                        <button 
                            onClick={() => handleDelete(row.id)} 
                            className="p-2 text-red-500/80 hover:text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"
                        >
                            <Trash2 className="size-4" />
                        </button>
                    </div>
                )}
            />

            <Dialog open={viewOpen} onOpenChange={setViewOpen}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-[10px] uppercase font-bold">
                                Suggestion #{selected?.id}
                            </Badge>
                        </div>
                        <DialogTitle className="text-xl font-bold">{selected?.title}</DialogTitle>
                        <DialogDescription className="text-muted-foreground text-xs">
                            Submitted by {selected?.user?.username} on {selected && formatDate(selected.createdAt)}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-4 p-4 bg-muted/30 rounded-2xl border border-border/50 text-sm whitespace-pre-wrap leading-relaxed">
                        {selected?.content}
                    </div>

                    <div className="mt-6 flex flex-col gap-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Update Status</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className={cn("text-[10px] font-bold h-9", selected?.status === 'pending' && "bg-yellow-50 border-yellow-200 text-yellow-700")}
                                onClick={() => selected && handleUpdateStatus(selected.id, 'pending')}
                            >
                                Pending
                            </Button>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className={cn("text-[10px] font-bold h-9", selected?.status === 'reviewed' && "bg-blue-50 border-blue-200 text-blue-700")}
                                onClick={() => selected && handleUpdateStatus(selected.id, 'reviewed')}
                            >
                                Reviewed
                            </Button>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className={cn("text-[10px] font-bold h-9", selected?.status === 'implemented' && "bg-green-50 border-green-200 text-green-700")}
                                onClick={() => selected && handleUpdateStatus(selected.id, 'implemented')}
                            >
                                Done
                            </Button>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className={cn("text-[10px] font-bold h-9", selected?.status === 'rejected' && "bg-red-50 border-red-200 text-red-700")}
                                onClick={() => selected && handleUpdateStatus(selected.id, 'rejected')}
                            >
                                Reject
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

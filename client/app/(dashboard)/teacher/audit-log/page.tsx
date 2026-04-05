"use client"

import React, { useState, useEffect, useMemo } from "react"
import { getAuthedClient } from "@/services/api/client"
import { Loader2, Search, FileText, Clock, ArrowRight } from "lucide-react"
import { SectionHeader } from "@/features/admin/components/SectionHeader"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import type { ApiAuditLog } from "@/lib/types/api"


function getInitials(username: string) {
    if (!username) return "?"
    return username.slice(0, 2).toUpperCase()
}

function fmtDate(value: string) {
    return new Date(value).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    })
}

function formatChange(change?: Record<string, unknown>) {
    if (!change) return null
    const before = change.before
    const after = change.after
    if (!before && !after) return null
    return { before, after }
}

const categoryColors: Record<string, string> = {
    AUTH: "bg-blue-500/15 text-blue-600",
    ACADEMIC: "bg-green-500/15 text-green-600",
    MARKET: "bg-orange-500/15 text-orange-600",
    FINANCE: "bg-yellow-500/15 text-yellow-600",
    USER: "bg-purple-500/15 text-purple-600",
    SYSTEM: "bg-gray-500/15 text-gray-600",
}

export default function AuditLogPage() {
    const [logs, setLogs] = useState<ApiAuditLog[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        async function load() {
            try {
                setLoading(true)
                const c = await getAuthedClient()
                const res = await c.get<{ success: boolean; data: ApiAuditLog[]; pagination: unknown }>("/logs/me?limit=100")
                setLogs(res.data.data)
            } catch (e) { console.error(e) } finally { setLoading(false) }
        }
        load()
    }, [])

    const filteredLogs = useMemo(() => {
        if (!searchQuery.trim()) return logs
        const query = searchQuery.toLowerCase()
        return logs.filter(
            (log) =>
                log.action.toLowerCase().includes(query) ||
                log.entity.toLowerCase().includes(query) ||
                log.entityId?.toLowerCase().includes(query)
        )
    }, [logs, searchQuery])

    if (loading) {
        return (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading activity logs...
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <SectionHeader title="My Activity Log" subtitle="Your recent actions" />

            <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    className="rounded-xl pl-9"
                    placeholder="Search logs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {filteredLogs.length === 0 ? (
                <Card className="border-dashed border-border/70">
                    <CardContent className="flex flex-col items-center justify-center py-10 text-center text-sm text-muted-foreground">
                        <FileText className="size-8 mb-2 opacity-40" />
                        {searchQuery ? "No logs match your search." : "No activity logs found."}
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {filteredLogs.map((log) => {
                        const change = formatChange(log.change)
                        return (
                            <Card key={log.id} className="border-border/60">
                                <CardContent className="p-4">
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={log.user?.avatar ?? undefined} className="object-cover" />
                                                    <AvatarFallback className="bg-brand-purple/10 text-brand-purple text-sm font-semibold">
                                                        {getInitials(log.user?.username ?? log.userId ?? "S")}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium text-foreground">
                                                        {log.user?.username ?? log.userId ?? "System"}
                                                    </p>
                                                    <Badge className={`text-[10px] font-semibold ${categoryColors[log.category] ?? ""}`}>
                                                        {log.category}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                                                <Clock className="size-3.5" />
                                                {fmtDate(log.createdAt)}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="font-semibold text-foreground">{log.action}</span>
                                            <span className="text-muted-foreground">on</span>
                                            <span className="font-medium text-foreground">{log.entity}</span>
                                            {log.entityId && (
                                                <>
                                                    <span className="text-muted-foreground">#</span>
                                                    <span className="text-muted-foreground font-mono text-xs">{log.entityId}</span>
                                                </>
                                            )}
                                        </div>

                                        {change && (
                                            <div className="flex items-start gap-2 text-xs bg-muted/50 rounded-lg p-2.5">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-muted-foreground mb-1">Old Value</p>
                                                    <pre className="text-xs text-foreground truncate font-mono whitespace-pre-wrap break-all">
                                                        {change.before ? JSON.stringify(change.before, null, 2) : "—"}
                                                    </pre>
                                                </div>
                                                <ArrowRight className="size-4 text-muted-foreground shrink-0 mt-4" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-muted-foreground mb-1">New Value</p>
                                                    <pre className="text-xs text-foreground truncate font-mono whitespace-pre-wrap break-all">
                                                        {change.after ? JSON.stringify(change.after, null, 2) : "—"}
                                                    </pre>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}


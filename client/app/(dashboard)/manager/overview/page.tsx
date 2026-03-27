"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { ManagerOverviewClient } from "./ManagerOverviewClient"
import { fetchManagerOverviewStats } from "./data"
import { emptyManagerStats, type ManagerOverviewStats } from "./_types"

export default function ManagerOverviewPage() {
    const [stats, setStats] = useState<ManagerOverviewStats>(emptyManagerStats)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        let mounted = true

        const load = async () => {
            try {
                const data = await fetchManagerOverviewStats()
                if (mounted) {
                    setStats(data)
                    setError("")
                }
            } catch (loadError) {
                console.error("Failed to fetch manager overview stats:", loadError)
                if (mounted) {
                    setError(loadError instanceof Error ? loadError.message : "Failed to load manager overview")
                }
            } finally {
                if (mounted) setLoading(false)
            }
        }

        load()
        return () => {
            mounted = false
        }
    }, [])

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <Loader2 className="size-6 animate-spin text-muted-foreground/50" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="rounded-[1.5rem] border border-dashed border-border/70 p-6 text-sm text-muted-foreground">
                {error}
            </div>
        )
    }

    return <ManagerOverviewClient stats={stats} />
}

"use client"

import { SectionHeader } from "@/app/(dashboard)/admin/_components/SectionHeader"
import { OverviewStatsGrid } from "./_components/OverviewStatsGrid"
import type { OverviewStats } from "./_types"

interface OverviewClientProps {
    stats: OverviewStats
}

export function OverviewClient({ stats }: OverviewClientProps) {
    return (
        <div className="space-y-6">
            <SectionHeader
                title="System Overview"
                subtitle="Live metrics across the entire platform"
            />

            <OverviewStatsGrid stats={stats} />
        </div>
    )
}

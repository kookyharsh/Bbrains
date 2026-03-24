"use client"

import { UserCheck, Users, ShoppingBag, CheckCircle, BookOpen, FileText, Shield, Trophy } from "lucide-react"
import { StatCard } from "@/app/(dashboard)/admin/_components/StatCard"
import type { OverviewStats } from "../_types"

interface OverviewStatsGridProps {
    stats: OverviewStats
}

export function OverviewStatsGrid({ stats }: OverviewStatsGridProps) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Teachers" value={stats.teachers} icon={<UserCheck className="size-5" />} />
            <StatCard label="Students" value={stats.students} icon={<Users className="size-5" />} />
            <StatCard label="Products" value={stats.products} icon={<ShoppingBag className="size-5" />} />
            <StatCard
                label="Pending Products"
                value={stats.pending}
                icon={<CheckCircle className="size-5" />}
                color={stats.pending > 0 ? "text-yellow-500" : "text-primary"}
            />
            <StatCard label="Assignments" value={stats.assignments} icon={<BookOpen className="size-5" />} />
            <StatCard label="Announcements" value={stats.announcements} icon={<FileText className="size-5" />} />
            <StatCard label="Roles" value={stats.roles} icon={<Shield className="size-5" />} />
            <StatCard label="Achievements" value={stats.achievements} icon={<Trophy className="size-5" />} />
        </div>
    )
}

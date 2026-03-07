"use client"

import React, { useState, useEffect } from 'react'
import { useAuth } from "@clerk/nextjs"
import { fetchDashboard, DashboardData } from "./data"

import { DailyReward } from "./_components/cards/DailyReward"
import { MyWallet } from "./_components/cards/MyWallet"
import { Attendance } from "./_components/cards/Attendance"
import { TopStudents } from "./_components/cards/TopStudents"
import { MyTasks } from "./_components/cards/MyTasks"
import { UpcomingEvents } from "./_components/cards/UpcomingEvents"

// ─── Main Page Component ─────────────────────────────────────────────────────────

export default function DashboardPage() {
    const { getToken, userId } = useAuth()
    const [data, setData] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function loadDashboard() {
            try {
                setLoading(true)
                const dashboard = await fetchDashboard(getToken)
                setData(dashboard)
            } catch (err) {
                // In a realistic app you might still render empty states instead of crashing right away
                setError(err instanceof Error ? err.message : "Failed to load dashboard")
            } finally {
                setLoading(false)
            }
        }

        // Use a slight delay or try to load even without an actual response for demonstration
        loadDashboard()
    }, [getToken])

    // Provide a mocked display structure whether loading is complete or not since this is a UI demo
    // Alternatively wait for data: 
    // if (loading) return <div className="flex h-full items-center justify-center"><Loader2 className="size-8 animate-spin text-primary" /></div>

    const displayName = data?.user?.userDetails
        ? `${data.user.userDetails.firstName ?? ''} ${data.user.userDetails.lastName ?? ''}`.trim() || data.user.username
        : 'Alex';

    const todayDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="w-full relative pb-8">
            <div className="max-w-[1400px] w-full mx-auto space-y-6">
                {/* Welcome Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-ui-light-textPrimary dark:text-ui-dark-textPrimary">
                            Welcome back, {displayName}! 👋
                        </h2>
                        <p className="text-ui-light-textSecondary dark:text-ui-dark-textSecondary mt-1 text-sm">
                            Here's what's happening with your studies today.
                        </p>
                    </div>
                    <div className="text-sm font-medium text-ui-light-textSecondary dark:text-ui-dark-textSecondary bg-ui-light-surface dark:bg-ui-dark-surface px-4 py-2.5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 self-start sm:self-auto">
                        {todayDate}
                    </div>
                </div>

                {/* Top Row: Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <DailyReward />
                    <MyWallet />
                    <Attendance />
                </div>

                {/* Bottom Row: Leaderboard (2cols) & My Tasks (1col) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 flex flex-col h-full">
                        <TopStudents />
                    </div>
                    <div className="flex flex-col h-full space-y-6">
                        <MyTasks />
                    </div>
                </div>

                {/* Upcoming Events: Full Width */}
                <div className="w-full">
                    <UpcomingEvents />
                </div>
            </div>
        </div>
    )
}

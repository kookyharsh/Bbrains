"use client"

import React, { useState } from "react"
import {
    LayoutDashboard, Users, UserCheck, BookOpen, Megaphone,
    Shield, ShoppingBag, Trophy, FileText, ArrowUpDown, ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

import {
    AdminOverview, AdminTeachersTab, AdminStudentsTab,
    AdminAssignmentsTab, AdminAnnouncementsTab, AdminRolesTab,
    AdminUserRolesTab, AdminProductsTab, AdminAchievementsTab,
    AdminAuditLogTab, AdminTransactionsTab,
} from "./AdminTabs"

// ─── Tab Config ───────────────────────────────────────────────────────────────

type AdminTab =
    | "overview" | "teachers" | "students" | "assignments"
    | "announcements" | "roles" | "userroles" | "products"
    | "achievements" | "audit" | "transactions"

interface TabItem {
    id: AdminTab
    label: string
    icon: React.ReactNode
    description: string
    group?: string
}

const TABS: TabItem[] = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard className="size-4" />, description: "System overview & stats" },
    // Users group
    { id: "teachers", label: "Teachers", icon: <UserCheck className="size-4" />, description: "Manage teacher accounts", group: "Users" },
    { id: "students", label: "Students", icon: <Users className="size-4" />, description: "Manage student accounts", group: "Users" },
    { id: "roles", label: "Roles", icon: <Shield className="size-4" />, description: "Create & manage custom roles", group: "Users" },
    { id: "userroles", label: "User Roles", icon: <Shield className="size-4" />, description: "Assign roles to users", group: "Users" },
    // Academic group
    { id: "assignments", label: "Assignments", icon: <BookOpen className="size-4" />, description: "Manage all assignments", group: "Academic" },
    { id: "announcements", label: "Announcements", icon: <Megaphone className="size-4" />, description: "Manage announcements", group: "Academic" },
    // Market group
    { id: "products", label: "Products", icon: <ShoppingBag className="size-4" />, description: "Manage & approve products", group: "Market" },
    // Gamification group
    { id: "achievements", label: "Achievements", icon: <Trophy className="size-4" />, description: "Create & manage achievements", group: "Gamification" },
    // System group
    { id: "audit", label: "Audit Log", icon: <FileText className="size-4" />, description: "System activity log with filters", group: "System" },
    { id: "transactions", label: "Transactions", icon: <ArrowUpDown className="size-4" />, description: "View all user transactions", group: "System" },
]

const GROUPS = ["Users", "Academic", "Market", "Gamification", "System"]

// ─── Admin Dashboard ──────────────────────────────────────────────────────────

export function AdminDashboard({ getToken }: { getToken: () => Promise<string | null> }) {
    const [activeTab, setActiveTab] = useState<AdminTab>("overview")

    const active = TABS.find((t) => t.id === activeTab)!

    return (
        <div className="flex min-h-screen bg-background overflow-hidden">
            {/* Sidebar */}
            <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-border bg-muted/20 overflow-y-auto">
                <div className="px-4 py-4 border-b border-border">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Admin Panel</p>
                </div>

                <nav className="flex-1 p-2">
                    {/* Overview (no group) */}
                    {TABS.filter((t) => !t.group).map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all mb-0.5",
                                activeTab === tab.id
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <span className="shrink-0">{tab.icon}</span>
                            <span className="text-sm font-medium">{tab.label}</span>
                            {activeTab === tab.id && <ChevronRight className="ml-auto size-3.5 shrink-0" />}
                        </button>
                    ))}

                    {/* Grouped tabs */}
                    {GROUPS.map((group) => {
                        const groupTabs = TABS.filter((t) => t.group === group)
                        if (!groupTabs.length) return null
                        return (
                            <div key={group} className="mt-4">
                                <p className="px-3 mb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{group}</p>
                                <div className="space-y-0.5">
                                    {groupTabs.map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={cn(
                                                "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all",
                                                activeTab === tab.id
                                                    ? "bg-primary text-primary-foreground shadow-sm"
                                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                            )}
                                        >
                                            <span className="shrink-0">{tab.icon}</span>
                                            <span className="text-sm font-medium">{tab.label}</span>
                                            {activeTab === tab.id && <ChevronRight className="ml-auto size-3.5 shrink-0" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </nav>
            </aside>

            {/* Mobile scrollable tab bar */}
            <div className="md:hidden fixed bottom-16 left-0 right-0 z-40 bg-background border-t border-border overflow-x-auto">
                <div className="flex gap-1 p-1 min-w-max">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-md text-xs font-medium shrink-0 transition-all",
                                activeTab === tab.id ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                            )}
                        >
                            {tab.icon}
                            <span className="text-[9px]">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main content */}
            <main className="flex-1 overflow-y-auto bg-background">
                <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-6 py-3">
                    <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{active.icon}</span>
                        <div>
                            <h1 className="text-sm font-bold text-foreground">{active.label}</h1>
                            <p className="text-[11px] text-muted-foreground">{active.description}</p>
                        </div>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
                    {activeTab === "overview" && <AdminOverview getToken={getToken} />}
                    {activeTab === "teachers" && <AdminTeachersTab getToken={getToken} />}
                    {activeTab === "students" && <AdminStudentsTab getToken={getToken} />}
                    {activeTab === "assignments" && <AdminAssignmentsTab getToken={getToken} />}
                    {activeTab === "announcements" && <AdminAnnouncementsTab getToken={getToken} />}
                    {activeTab === "roles" && <AdminRolesTab getToken={getToken} />}
                    {activeTab === "userroles" && <AdminUserRolesTab getToken={getToken} />}
                    {activeTab === "products" && <AdminProductsTab getToken={getToken} />}
                    {activeTab === "achievements" && <AdminAchievementsTab getToken={getToken} />}
                    {activeTab === "audit" && <AdminAuditLogTab getToken={getToken} />}
                    {activeTab === "transactions" && <AdminTransactionsTab getToken={getToken} />}
                </div>
            </main>
        </div>
    )
}

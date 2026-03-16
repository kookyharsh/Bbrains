"use client"

import React, { useState } from "react"
import {
    LayoutDashboard, Users, UserCheck, BookOpen, Megaphone,
    Shield, ShoppingBag, Trophy, FileText, ArrowUpDown, ChevronRight,
    ArrowLeft, BarChart3, Settings2, MessageSquarePlus, GraduationCap, UserCog
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { ThemeSwitcher } from "@/components/theme-switcher"

import {
    OverviewTab as AdminOverview, 
    TeachersTab as AdminTeachersTab, 
    StudentsTab as AdminStudentsTab,
    AssignmentsTab as AdminAssignmentsTab, 
    AnnouncementsTab as AdminAnnouncementsTab, 
    RolesTab as AdminRolesTab,
    UserRolesTab as AdminUserRolesTab, 
    ProductsTab as AdminProductsTab, 
    AchievementsTab as AdminAchievementsTab,
    AuditLogTab as AdminAuditLogTab, 
    TransactionsTab as AdminTransactionsTab,
    XpConfigTab as AdminXpConfigTab,
    ConfigTab as AdminConfigTab,
    SuggestionsTab as AdminSuggestionsTab,
    AcademicsTab as AdminAcademicsTab,
    StatsTab as AdminStatsTab,
    RolesAccessTab as AdminRolesAccessTab,
    ManageUsersTab as AdminManageUsersTab,
} from "@/components/admin/tabs"

// ─── Tab Config ───────────────────────────────────────────────────────────────

type AdminTab =
    | "overview" | "teachers" | "students" | "assignments"
    | "announcements" | "roles" | "userroles" | "products"
    | "achievements" | "audit" | "transactions" | "xpconfig" | "config" | "suggestions"
    | "academics" | "stats" | "rolesaccess" | "manageusers"

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
    { id: "manageusers", label: "Manage Users", icon: <UserCog className="size-4" />, description: "View and manage all users", group: "Users" },
    { id: "teachers", label: "Teachers", icon: <UserCheck className="size-4" />, description: "Manage teacher accounts", group: "Users" },
    { id: "students", label: "Students", icon: <Users className="size-4" />, description: "Manage student accounts", group: "Users" },
    { id: "rolesaccess", label: "Roles & Access", icon: <Shield className="size-4" />, description: "Manage roles, permissions & user access", group: "Users" },
    { id: "roles", label: "Quick Roles", icon: <Shield className="size-4" />, description: "Create & manage custom roles", group: "Users" },
    { id: "userroles", label: "User Roles", icon: <Shield className="size-4" />, description: "Assign roles to users", group: "Users" },
    // Academic group
    { id: "academics", label: "Academics", icon: <GraduationCap className="size-4" />, description: "Courses, students & assignments", group: "Academic" },
    { id: "assignments", label: "Assignments", icon: <BookOpen className="size-4" />, description: "Manage all assignments", group: "Academic" },
    { id: "announcements", label: "Announcements", icon: <Megaphone className="size-4" />, description: "Manage announcements", group: "Academic" },
    // Market group
    { id: "products", label: "Products", icon: <ShoppingBag className="size-4" />, description: "Manage & approve products", group: "Market" },
    // Gamification group
    { id: "achievements", label: "Achievements", icon: <Trophy className="size-4" />, description: "Create & manage achievements", group: "Gamification" },
    { id: "xpconfig", label: "XP & Levels", icon: <Trophy className="size-4" />, description: "Manage level thresholds", group: "Gamification" },
    // System group
    { id: "stats", label: "Statistics", icon: <BarChart3 className="size-4" />, description: "Enrollment trends, demographics & analytics", group: "System" },
    { id: "audit", label: "Audit Log", icon: <FileText className="size-4" />, description: "System activity log with filters", group: "System" },
    { id: "transactions", label: "Transactions", icon: <ArrowUpDown className="size-4" />, description: "View all user transactions", group: "System" },
    { id: "config", label: "System Config", icon: <Settings2 className="size-4" />, description: "Global settings & flags", group: "System" },
    { id: "suggestions", label: "Suggestions", icon: <MessageSquarePlus className="size-4" />, description: "Review user feedback", group: "System" },
]

const GROUPS = ["Users", "Academic", "Market", "Gamification", "System"]

// ─── Admin Dashboard ──────────────────────────────────────────────────────────

export function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<AdminTab>("overview")

    const active = TABS.find((t) => t.id === activeTab)!

    return (
        <div className="flex h-screen w-full bg-background overflow-hidden relative">
            {/* Sidebar */}
            <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border bg-card">
                <div className="px-6 py-6 border-b border-border flex items-center gap-3">
                    <div className="w-8 h-8 bg-brand-purple rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm">
                        <BarChart3 className="h-4 w-4" />
                    </div>
                    <p className="font-bold text-lg tracking-tight">Admin Panel</p>
                </div>

                <nav className="flex-1 p-4 overflow-y-auto scrollbar-hide">
                    {/* Back to App */}
                    <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors mb-6 group">
                        <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Student App
                    </Link>

                    {/* Overview (no group) */}
                    {TABS.filter((t) => !t.group).map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all mb-1",
                                activeTab === tab.id
                                    ? "bg-brand-purple text-white shadow-md shadow-brand-purple/20"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <span className="shrink-0">{tab.icon}</span>
                            <span className="text-sm font-semibold">{tab.label}</span>
                            {activeTab === tab.id && <ChevronRight className="ml-auto size-4 shrink-0" />}
                        </button>
                    ))}

                    {/* Grouped tabs */}
                    {GROUPS.map((group) => {
                        const groupTabs = TABS.filter((t) => t.group === group)
                        if (!groupTabs.length) return null
                        return (
                            <div key={group} className="mt-6 first:mt-0">
                                <p className="px-4 mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">{group}</p>
                                <div className="space-y-1">
                                    {groupTabs.map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={cn(
                                                "w-full flex items-center gap-3 rounded-xl px-4 py-2.5 text-left transition-all",
                                                activeTab === tab.id
                                                    ? "bg-brand-purple text-white shadow-md shadow-brand-purple/20"
                                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                            )}
                                        >
                                            <span className="shrink-0">{tab.icon}</span>
                                            <span className="text-sm font-semibold">{tab.label}</span>
                                            {activeTab === tab.id && <ChevronRight className="ml-auto size-4 shrink-0" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </nav>
            </aside>

            {/* Mobile Nav Bar - Improved z-index and positioning */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-[var(--z-bottom-nav)] bg-background/95 backdrop-blur border-t border-border overflow-x-auto scrollbar-hide">
                <div className="flex gap-1 p-2 min-w-max">
                    <Link href="/dashboard" className="flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl text-muted-foreground">
                        <ArrowLeft className="size-4" />
                        <span className="text-[10px] font-medium">Exit</span>
                    </Link>
                    <div className="w-px h-8 bg-border/50 self-center mx-1" />
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all",
                                activeTab === tab.id 
                                    ? "bg-brand-purple/10 text-brand-purple" 
                                    : "text-muted-foreground hover:bg-muted"
                            )}
                        >
                            <span className={cn(activeTab === tab.id ? "scale-110 transition-transform" : "")}>
                                {tab.icon}
                            </span>
                            <span className="text-[10px]">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Fixed Sub-Header */}
                <header className="sticky top-0 z-[var(--z-nav)] bg-background/80 backdrop-blur-md border-b border-border px-4 md:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-muted rounded-xl text-muted-foreground shrink-0 hidden sm:block">
                            {active.icon}
                        </div>
                        <div>
                            <h1 className="text-base md:text-lg font-bold text-foreground leading-none">{active.label}</h1>
                            <p className="text-xs text-muted-foreground mt-1 hidden sm:block">{active.description}</p>
                        </div>
                    </div>
                    
                    {/* Mobile Logo */}
                    <div className="flex md:hidden items-center gap-2">
                        <div className="w-8 h-8 bg-brand-purple rounded-lg flex items-center justify-center text-white shrink-0">
                            <BarChart3 className="h-4 w-4" />
                        </div>
                        <span className="font-bold text-sm">Admin</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <ThemeSwitcher />
                    </div>
                </header>

                {/* Scrollable Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-32 md:pb-12">
                    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {activeTab === "overview" && <AdminOverview />}
                        {activeTab === "teachers" && <AdminTeachersTab />}
                        {activeTab === "students" && <AdminStudentsTab />}
                        {activeTab === "assignments" && <AdminAssignmentsTab />}
                        {activeTab === "announcements" && <AdminAnnouncementsTab />}
                        {activeTab === "roles" && <AdminRolesTab />}
                        {activeTab === "userroles" && <AdminUserRolesTab />}
                        {activeTab === "products" && <AdminProductsTab />}
                        {activeTab === "achievements" && <AdminAchievementsTab />}
                        {activeTab === "xpconfig" && <AdminXpConfigTab />}
                        {activeTab === "audit" && <AdminAuditLogTab />}
                        {activeTab === "transactions" && <AdminTransactionsTab />}
                        {activeTab === "config" && <AdminConfigTab />}
                        {activeTab === "suggestions" && <AdminSuggestionsTab />}
                        {activeTab === "academics" && <AdminAcademicsTab />}
                        {activeTab === "stats" && <AdminStatsTab />}
                        {activeTab === "rolesaccess" && <AdminRolesAccessTab />}
                        {activeTab === "manageusers" && <AdminManageUsersTab />}
                    </div>
                </main>
            </div>
        </div>
    )
}

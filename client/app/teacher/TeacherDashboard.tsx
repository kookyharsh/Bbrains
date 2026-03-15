"use client"

import React, { useState } from "react"
import {
    LayoutDashboard, Users, BookOpen, Award, ShoppingBag,
    Megaphone, FileText, ChevronRight, ArrowLeft, BarChart3,
    Calendar
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

import {
    OverviewTab as TeacherOverview, 
    StudentsTab as TeacherStudentsTab, 
    AssignmentsTab as TeacherAssignmentsTab,
    GradingTab as TeacherGradingTab, 
    ProductsTab as TeacherProductsTab, 
    AnnouncementsTab as TeacherAnnouncementsTab,
    AuditLogTab as TeacherAuditLogTab,
    AttendanceTab as TeacherAttendanceTab,
} from "@/components/teacher/tabs"

// ─── Tab Config ───────────────────────────────────────────────────────────────

type TeacherTab = "overview" | "students" | "attendance" | "assignments" | "grading" | "products" | "announcements" | "audit"

interface TabItem {
    id: TeacherTab
    label: string
    icon: React.ReactNode
    description: string
}

const TABS: TabItem[] = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard className="size-4" />, description: "Dashboard summary" },
    { id: "students", label: "Students", icon: <Users className="size-4" />, description: "View student details & wallets" },
    { id: "attendance", label: "Attendance", icon: <Calendar className="size-4" />, description: "Mark daily student attendance" },
    { id: "assignments", label: "Assignments", icon: <BookOpen className="size-4" />, description: "Create & manage assignments" },
    { id: "grading", label: "Grading", icon: <Award className="size-4" />, description: "Grade student submissions" },
    { id: "products", label: "Approvals", icon: <ShoppingBag className="size-4" />, description: "Approve student products" },
    { id: "announcements", label: "Announcements", icon: <Megaphone className="size-4" />, description: "Post & manage announcements" },
    { id: "audit", label: "Activity Log", icon: <FileText className="size-4" />, description: "Your activity history" },
]

// ─── Teacher Dashboard ────────────────────────────────────────────────────────

export function TeacherDashboard() {
    const [activeTab, setActiveTab] = useState<TeacherTab>("overview")

    const active = TABS.find((t) => t.id === activeTab)!

    return (
        <div className="flex h-screen w-full bg-background overflow-hidden relative">
            {/* Sidebar */}
            <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border bg-card">
                <div className="px-6 py-6 border-b border-border flex items-center gap-3">
                    <div className="w-8 h-8 bg-brand-orange rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm">
                        <BarChart3 className="h-4 w-4" />
                    </div>
                    <p className="font-bold text-lg tracking-tight">Teacher Panel</p>
                </div>

                <nav className="flex-1 p-4 overflow-y-auto scrollbar-hide">
                    {/* Back to App */}
                    <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors mb-6 group">
                        <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Student App
                    </Link>

                    <div className="space-y-1">
                        {TABS.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all",
                                    activeTab === tab.id
                                        ? "bg-brand-orange text-white shadow-md shadow-brand-orange/20"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                <span className="shrink-0">{tab.icon}</span>
                                <span className="text-sm font-semibold">{tab.label}</span>
                                {activeTab === tab.id && <ChevronRight className="ml-auto size-4 shrink-0" />}
                            </button>
                        ))}
                    </div>
                </nav>
            </aside>

            {/* Mobile Nav Bar */}
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
                                    ? "bg-brand-orange/10 text-brand-orange" 
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
                        <div className="w-8 h-8 bg-brand-orange rounded-lg flex items-center justify-center text-white shrink-0">
                            <BarChart3 className="h-4 w-4" />
                        </div>
                        <span className="font-bold text-sm">Teacher</span>
                    </div>
                </header>

                {/* Scrollable Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-32 md:pb-12">
                    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {activeTab === "overview" && <TeacherOverview />}
                        {activeTab === "students" && <TeacherStudentsTab />}
                        {activeTab === "attendance" && <TeacherAttendanceTab />}
                        {activeTab === "assignments" && <TeacherAssignmentsTab />}
                        {activeTab === "grading" && <TeacherGradingTab />}
                        {activeTab === "products" && <TeacherProductsTab />}
                        {activeTab === "announcements" && <TeacherAnnouncementsTab />}
                        {activeTab === "audit" && <TeacherAuditLogTab />}
                    </div>
                </main>
            </div>
        </div>
    )
}

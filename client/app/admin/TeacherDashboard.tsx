"use client"

import React, { useState } from "react"
import {
    LayoutDashboard, Users, BookOpen, Award, ShoppingBag,
    Megaphone, FileText, ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

import {
    OverviewTab as TeacherOverview, 
    StudentsTab as TeacherStudentsTab, 
    AssignmentsTab as TeacherAssignmentsTab,
    GradingTab as TeacherGradingTab, 
    ProductsTab as TeacherProductsTab, 
    AnnouncementsTab as TeacherAnnouncementsTab,
    AuditLogTab as TeacherAuditLogTab,
} from "@/components/teacher/tabs"

// ─── Tab Config ───────────────────────────────────────────────────────────────

type TeacherTab = "overview" | "students" | "assignments" | "grading" | "products" | "announcements" | "audit"

const TABS: { id: TeacherTab; label: string; icon: React.ReactNode; description: string }[] = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard className="size-4" />, description: "Dashboard summary" },
    { id: "students", label: "Students", icon: <Users className="size-4" />, description: "View student details & wallets" },
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
        <div className="flex min-h-screen bg-background overflow-hidden">
            {/* Sidebar */}
            <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-border bg-muted/20 overflow-y-auto">
                <div className="px-4 py-4 border-b border-border">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Teacher Panel</p>
                </div>
                <nav className="flex-1 p-2 space-y-0.5">
                    {TABS.map((tab) => (
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
                            <span className="text-sm font-medium truncate">{tab.label}</span>
                            {activeTab === tab.id && <ChevronRight className="ml-auto size-3.5 shrink-0" />}
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Mobile tab bar */}
            <div className="md:hidden fixed bottom-16 left-0 right-0 z-40 bg-background border-t border-border overflow-x-auto">
                <div className="flex gap-1 p-1">
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
                    {activeTab === "overview" && <TeacherOverview />}
                    {activeTab === "students" && <TeacherStudentsTab />}
                    {activeTab === "assignments" && <TeacherAssignmentsTab />}
                    {activeTab === "grading" && <TeacherGradingTab />}
                    {activeTab === "products" && <TeacherProductsTab />}
                    {activeTab === "announcements" && <TeacherAnnouncementsTab />}
                    {activeTab === "audit" && <TeacherAuditLogTab />}
                </div>
            </main>
        </div>
    )
}

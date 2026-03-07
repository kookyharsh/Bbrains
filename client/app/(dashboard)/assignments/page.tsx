"use client"

import React, { useState, useMemo, useEffect } from "react"
import { useAuth } from "@clerk/nextjs"
import { getAuthedClient } from "@/lib/http"
import { Loader2 } from "lucide-react"

import { AssignmentsTabs } from "./_components/AssignmentsTabs"
import { AssignmentCard, PremiumAssignment } from "./_components/AssignmentCard"
import { PreviousSubmissionsTable, Submission } from "./_components/PreviousSubmissionsTable"

// ─── Types & Mapping ─────────────────────────────────────────────────────────

interface ApiAssignment {
    id: number
    courseId: number
    title: string
    description?: string
    content?: string
    file?: string
    dueDate: string
    createdAt: string
    course?: { name: string }
}

function getPriority(dueDate: string): PremiumAssignment["badgeType"] {
    const now = new Date()
    const due = new Date(dueDate)
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays <= 3) return "priority"
    if (diffDays <= 7) return "exam"
    return "standard"
}

// Map the generic backend response to our tailored PremiumAssignment
function mapApiAssignment(a: ApiAssignment): PremiumAssignment {
    const now = new Date()
    const due = new Date(a.dueDate)
    const isPast = due < now

    // Temporary logic to deduce subject type based on generic course name
    // For a real app, this should be an explicit property on the course
    const courseName = (a.course?.name || "General").toLowerCase()
    let subjectType: PremiumAssignment["subjectType"] = "general"
    if (courseName.includes("code") || courseName.includes("cs")) subjectType = "code"
    else if (courseName.includes("math") || courseName.includes("calc")) subjectType = "math"
    else if (courseName.includes("sci") || courseName.includes("phy")) subjectType = "science"

    const badgeType = getPriority(a.dueDate)
    const badgeText = badgeType === 'priority' ? "High Priority" : badgeType === "exam" ? "Upcoming Exam" : "Standard"

    return {
        id: String(a.id),
        title: a.title,
        courseCode: a.course?.name || "GEN-101",
        description: a.description || "Complete the required task parameters.",
        dueDate: a.dueDate,
        teacherName: "Prof. Instructor", // Fallback, normally comes from API course.instructor
        teacherAvatar: "",
        subjectType,
        badgeText,
        badgeType,
        status: isPast ? "completed" : "active",
    }
}

// Mock Submission Data for demonstration based on Stitch
const mockSubmissions: Submission[] = [
    {
        id: "sub-1",
        srNo: 1,
        title: "Essay on Modern AI",
        dateDue: "Sep 28, 2023",
        submittedAt: "Sep 27, 2023 - 4:30 PM",
        grade: "A (92/100)",
        gradeType: "success"
    },
    {
        id: "sub-2",
        srNo: 2,
        title: "Database Normalization Quiz",
        dateDue: "Sep 15, 2023",
        submittedAt: "Sep 15, 2023 - 10:15 AM",
        grade: "B+ (88/100)",
        gradeType: "warning"
    },
    {
        id: "sub-3",
        srNo: 3,
        title: "UI/UX Design Wireframes",
        dateDue: "Sep 05, 2023",
        submittedAt: "Sep 05, 2023 - 11:59 PM",
        grade: "Pending Review",
        gradeType: "pending"
    }
]

export default function AssignmentsPage() {
    const { getToken } = useAuth()
    const [assignments, setAssignments] = useState<PremiumAssignment[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState("all")

    // Fetch assignments from backend
    useEffect(() => {
        async function fetchAssignments() {
            try {
                setLoading(true)
                const client = await getAuthedClient(getToken)
                const res = await client.get<{ success: boolean; data: ApiAssignment[] }>("/academic/assignments")
                setAssignments(res.data.data.map(mapApiAssignment))
            } catch (err) {
                console.error("Failed to load assignments:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchAssignments()
    }, [getToken])

    const counts = useMemo(() => {
        const active = assignments.filter(a => a.status === "active").length
        const completed = assignments.filter(a => a.status === "completed").length
        return {
            all: assignments.length,
            incomplete: active,
            submitted: completed,
            completed: completed
        }
    }, [assignments])

    const filteredAssignments = useMemo(() => {
        if (activeTab === "incomplete") return assignments.filter(a => a.status === "active")
        if (activeTab === "submitted" || activeTab === "completed") return assignments.filter(a => a.status === "completed")
        return assignments
    }, [assignments, activeTab])

    if (loading) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-3 bg-background">
                <Loader2 className="size-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading assignments...</p>
            </div>
        )
    }

    return (
        <div className="flex h-full w-full flex-col overflow-hidden bg-background">
            <div className="shrink-0 px-4 pb-3 pt-4 md:px-6">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Assignments & Exams</h1>
                <p className="mt-1 text-sm text-muted-foreground">Track upcoming tasks and submission status.</p>
            </div>

            <div className="flex-1 overflow-y-auto border-t border-border/60 px-4 pb-6 pt-3 md:px-6 custom-scrollbar">
                <AssignmentsTabs
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    counts={counts}
                />

                {filteredAssignments.length > 0 ? (
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {filteredAssignments.map(a => (
                            <AssignmentCard key={a.id} assignment={a} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-muted-foreground">
                        <p className="text-sm font-medium">No assignments found for this view.</p>
                    </div>
                )}

                <div className="mt-6">
                    <PreviousSubmissionsTable submissions={mockSubmissions} />
                </div>
            </div>
        </div>
    )
}

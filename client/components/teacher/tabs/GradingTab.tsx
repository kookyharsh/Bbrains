"use client"

import React, { useState, useEffect, useCallback } from "react"
import { getAuthedClient } from "@/lib/http"
import { Loader2, BookOpen, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/admin/DataTable"
import { SectionHeader } from "@/components/admin/SectionHeader"
import { CrudDrawer } from "@/components/admin/CrudDrawer"
import { FormInput } from "@/components/admin/form/FormInput"
import type { ApiAssignment, ApiSubmission, ApiGrade } from "@/lib/types/api"

type GetToken = () => Promise<string | null>

function fmtDate(s: string) {
    return new Date(s).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}

interface GradeForm { userId: string; assignmentId: string; grade: string }
const emptyGradeForm: GradeForm = { userId: "", assignmentId: "", grade: "" }

export function GradingTab({ getToken }: { getToken: GetToken }) {
    const [assignments, setAssignments] = useState<ApiAssignment[]>([])
    const [submissions, setSubmissions] = useState<ApiSubmission[]>([])
    const [grades, setGrades] = useState<ApiGrade[]>([])
    const [selectedAssignment, setSelectedAssignment] = useState<string>("")
    const [, setLoading] = useState(true)
    const [loadingSubs, setLoadingSubs] = useState(false)
    const [gradeModal, setGradeModal] = useState(false)
    const [gradeForm, setGradeForm] = useState<GradeForm>(emptyGradeForm)
    const [editGrade, setEditGrade] = useState<ApiGrade | null>(null)
    const [submitting, setSubmitting] = useState(false)

    const loadAssignments = useCallback(async () => {
        try {
            setLoading(true)
            const c = await getAuthedClient(getToken)
            const res = await c.get<{ success: boolean; data: ApiAssignment[] }>("/academic/assignments")
            setAssignments(res.data.data)
        } catch (e) { console.error(e) } finally { setLoading(false) }
    }, [getToken])

    useEffect(() => { loadAssignments() }, [loadAssignments])

    async function loadSubmissions(assignmentId: string) {
        if (!assignmentId) { setSubmissions([]); setGrades([]); return }
        try {
            setLoadingSubs(true)
            const c = await getAuthedClient(getToken)
            const [subRes, gradeRes] = await Promise.all([
                c.get<{ success: boolean; data: ApiSubmission[] }>(`/academic/submissions/${assignmentId}`),
                c.get<{ success: boolean; data: ApiGrade[] }>(`/grades/assignment/${assignmentId}`),
            ])
            setSubmissions(subRes.data.data)
            setGrades(gradeRes.data.data)
        } catch (e) { console.error(e) } finally { setLoadingSubs(false) }
    }

    function openGrade(sub: ApiSubmission) {
        const existing = grades.find((g) => g.userId === sub.userId && g.assignmentId === sub.assignmentId)
        if (existing) {
            setEditGrade(existing)
            setGradeForm({ userId: sub.userId, assignmentId: String(sub.assignmentId), grade: existing.grade })
        } else {
            setEditGrade(null)
            setGradeForm({ userId: sub.userId, assignmentId: String(sub.assignmentId), grade: "" })
        }
        setGradeModal(true)
    }

    async function handleGradeSubmit() {
        if (!gradeForm.grade.trim()) return
        try {
            setSubmitting(true)
            const c = await getAuthedClient(getToken)
            if (editGrade) {
                const r = await c.put<{ success: boolean; data: ApiGrade }>(`/grades/${editGrade.id}`, { grade: gradeForm.grade })
                setGrades((prev) => prev.map((g) => g.id === editGrade.id ? r.data.data : g))
            } else {
                const r = await c.post<{ success: boolean; data: ApiGrade }>("/grades", {
                    userId: gradeForm.userId, assignmentId: Number(gradeForm.assignmentId), grade: gradeForm.grade,
                })
                setGrades((prev) => [...prev, r.data.data])
            }
            setGradeModal(false)
        } catch (e) { console.error(e) } finally { setSubmitting(false) }
    }

    const gradeMap = new Map(grades.map((g) => [g.userId, g]))

    return (
        <div className="space-y-4">
            <SectionHeader title="Grading" subtitle="View submissions and assign grades" />

            <div className="flex items-center gap-3">
                <label className="text-xs font-semibold text-muted-foreground">Select Assignment:</label>
                <select
                    value={selectedAssignment}
                    onChange={(e) => { setSelectedAssignment(e.target.value); loadSubmissions(e.target.value) }}
                    className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                    <option value="">-- Choose assignment --</option>
                    {assignments.map((a) => <option key={a.id} value={String(a.id)}>{a.title}</option>)}
                </select>
            </div>

            {loadingSubs ? (
                <div className="flex justify-center py-8"><Loader2 className="size-6 animate-spin text-muted-foreground/50" /></div>
            ) : selectedAssignment ? (
                <DataTable<ApiSubmission>
                    data={submissions} searchKeys={["userId"]}
                    columns={[
                        { key: "user", label: "Student", render: (r) => r.user?.username ?? r.userId },
                        { key: "submittedAt", label: "Submitted", render: (r) => fmtDate(r.submittedAt) },
                        {
                            key: "grade", label: "Grade",
                            render: (r) => {
                                const g = gradeMap.get(r.userId)
                                return g ? <span className="font-bold text-primary">{g.grade}</span> : <span className="text-muted-foreground text-xs">Not graded</span>
                            },
                        },
                    ]}
                    extraActions={(row) => (
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => openGrade(row)}>
                            <Award className="mr-1 size-3" />
                            {gradeMap.has(row.userId) ? "Edit Grade" : "Grade"}
                        </Button>
                    )}
                />
            ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <BookOpen className="size-8 mb-2 opacity-40" />
                    <p className="text-sm">Select an assignment to view submissions</p>
                </div>
            )}

            <CrudDrawer open={gradeModal} onClose={() => setGradeModal(false)} title={editGrade ? "Update Grade" : "Assign Grade"} onSubmit={handleGradeSubmit} submitting={submitting} submitLabel="Save Grade">
                <FormInput label="Grade" required value={gradeForm.grade} onChange={(e) => setGradeForm((f) => ({ ...f, grade: e.target.value }))} placeholder="e.g. A+, B, 85" maxLength={5} />
            </CrudDrawer>
        </div>
    )
}


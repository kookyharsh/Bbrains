"use client"

import React, { useState, useEffect, useCallback } from "react"
import { getAuthedClient } from "@/lib/http"
import { Loader2, BookOpen, CheckCircle, XCircle, Eye, Users, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"

import type {
    ApiUser, ApiAssignment, ApiAnnouncement, ApiProduct,
    ApiAuditLog, ApiSubmission, ApiGrade, ApiCourse,
} from "./types"
import {
    DataTable, CrudDrawer, ConfirmDialog, SectionHeader,
    RoleBadge, FormInput, FormSelect, FormTextarea, StatCard,
} from "./ui"

// ─── Helpers ──────────────────────────────────────────────────────────────────

type GetToken = () => Promise<string | null>

function fmtDate(s: string) {
    return new Date(s).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}
function fmtCurrency(n: number | string) {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(Number(n))
}
function fullName(u?: { firstName?: string; lastName?: string } | null) {
    if (!u) return "—"
    return `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || "—"
}

// ─── Teacher: Students Tab ────────────────────────────────────────────────────

export function TeacherStudentsTab({ getToken }: { getToken: GetToken }) {
    const [students, setStudents] = useState<ApiUser[]>([])
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] = useState<ApiUser | null>(null)
    const [detailOpen, setDetailOpen] = useState(false)

    const load = useCallback(async () => {
        try {
            setLoading(true)
            const c = await getAuthedClient(getToken)
            const res = await c.get<{ success: boolean; data: ApiUser[] }>("/user/students")
            setStudents(res.data.data)
        } catch (e) { console.error(e) } finally { setLoading(false) }
    }, [getToken])

    useEffect(() => { load() }, [load])

    const viewDetails = async (s: ApiUser) => {
        try {
            const c = await getAuthedClient(getToken)
            const res = await c.get<{ success: boolean; data: ApiUser }>(`/user/${s.username}`)
            setSelected(res.data.data)
            setDetailOpen(true)
        } catch { setSelected(s); setDetailOpen(true) }
    }

    return (
        <div className="space-y-4">
            <SectionHeader title="Students" subtitle={`${students.length} total students`} />
            <DataTable<ApiUser>
                loading={loading}
                data={students}
                searchKeys={["username", "email"]}
                columns={[
                    { key: "username", label: "Username" },
                    { key: "email", label: "Email" },
                    {
                        key: "userDetails", label: "Name",
                        render: (r) => fullName(r.userDetails),
                    },
                    {
                        key: "xp", label: "Level",
                        render: (r) => r.xp ? `Lv ${r.xp.level}` : "—",
                    },
                    {
                        key: "wallet", label: "Balance",
                        render: (r) => r.wallet ? fmtCurrency(r.wallet.balance) : "—",
                    },
                ]}
                extraActions={(row) => (
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => viewDetails(row)}>
                        <Eye className="size-3.5" />
                    </Button>
                )}
            />

            <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
                <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-md">
                    <DialogHeader><DialogTitle>Student Details</DialogTitle></DialogHeader>
                    {selected && (
                        <div className="space-y-4 text-sm">
                            <div className="grid grid-cols-2 gap-3">
                                <InfoRow label="Username" value={selected.username} />
                                <InfoRow label="Email" value={selected.email} />
                                <InfoRow label="Name" value={fullName(selected.userDetails)} />
                                <InfoRow label="Type" value={<RoleBadge value={selected.type} />} />
                                {selected.userDetails?.phone && <InfoRow label="Phone" value={selected.userDetails.phone} />}
                                {selected.userDetails?.sex && <InfoRow label="Sex" value={selected.userDetails.sex} />}
                                {selected.xp && <>
                                    <InfoRow label="XP" value={String(selected.xp.xp)} />
                                    <InfoRow label="Level" value={String(selected.xp.level)} />
                                </>}
                                {selected.wallet && <>
                                    <InfoRow label="Wallet ID" value={selected.wallet.id} />
                                    <InfoRow label="Balance" value={fmtCurrency(selected.wallet.balance)} />
                                </>}
                            </div>
                            {selected.enrollments && selected.enrollments.length > 0 && (
                                <div>
                                    <p className="font-semibold mb-2">Enrolled Courses</p>
                                    <ul className="space-y-1">
                                        {selected.enrollments.map((e) => (
                                            <li key={e.courseId} className="rounded bg-muted px-2 py-1 text-xs">
                                                {e.course.name}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div>
            <p className="text-[10px] font-semibold uppercase text-muted-foreground">{label}</p>
            <p className="mt-0.5 text-sm text-foreground">{value}</p>
        </div>
    )
}

// ─── Teacher: Assignments Tab ─────────────────────────────────────────────────

interface AssignmentForm {
    title: string; description: string; courseId: string; dueDate: string
}
const emptyAssForm: AssignmentForm = { title: "", description: "", courseId: "", dueDate: "" }

export function TeacherAssignmentsTab({ getToken }: { getToken: GetToken }) {
    const [assignments, setAssignments] = useState<ApiAssignment[]>([])
    const [courses, setCourses] = useState<ApiCourse[]>([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<ApiAssignment | null>(null)
    const [editing, setEditing] = useState<ApiAssignment | null>(null)
    const [form, setForm] = useState<AssignmentForm>(emptyAssForm)
    const [submitting, setSubmitting] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const load = useCallback(async () => {
        try {
            setLoading(true)
            const c = await getAuthedClient(getToken)
            const [aRes, cRes] = await Promise.all([
                c.get<{ success: boolean; data: ApiAssignment[] }>("/academic/assignments"),
                c.get<{ success: boolean; data: ApiCourse[] }>("/courses"),
            ])
            setAssignments(aRes.data.data)
            setCourses(cRes.data.data)
        } catch (e) { console.error(e) } finally { setLoading(false) }
    }, [getToken])

    useEffect(() => { load() }, [load])

    function openCreate() { setEditing(null); setForm(emptyAssForm); setModalOpen(true) }
    function openEdit(a: ApiAssignment) {
        setEditing(a)
        setForm({ title: a.title, description: a.description ?? "", courseId: String(a.courseId), dueDate: a.dueDate?.slice(0, 10) ?? "" })
        setModalOpen(true)
    }

    async function handleSubmit() {
        if (!form.title.trim() || !form.courseId) return
        try {
            setSubmitting(true)
            const c = await getAuthedClient(getToken)
            const payload = { title: form.title, description: form.description || undefined, courseId: Number(form.courseId), dueDate: form.dueDate || undefined }
            if (editing) {
                const r = await c.put<{ success: boolean; data: ApiAssignment }>(`/academic/assignments/${editing.id}`, payload)
                setAssignments((prev) => prev.map((a) => a.id === editing.id ? r.data.data : a))
            } else {
                const r = await c.post<{ success: boolean; data: ApiAssignment }>("/academic/assignments", payload)
                setAssignments((prev) => [r.data.data, ...prev])
            }
            setModalOpen(false)
        } catch (e) { console.error(e) } finally { setSubmitting(false) }
    }

    async function handleDelete() {
        if (!deleteTarget) return
        try {
            setDeleting(true)
            const c = await getAuthedClient(getToken)
            await c.delete(`/academic/assignments/${deleteTarget.id}`)
            setAssignments((prev) => prev.filter((a) => a.id !== deleteTarget.id))
            setDeleteTarget(null)
        } catch (e) { console.error(e) } finally { setDeleting(false) }
    }

    return (
        <div className="space-y-4">
            <SectionHeader title="Assignments" subtitle={`${assignments.length} total`} action={openCreate} actionLabel="New Assignment" />
            <DataTable<ApiAssignment>
                loading={loading} data={assignments}
                searchKeys={["title"]}
                columns={[
                    { key: "title", label: "Title" },
                    { key: "course", label: "Course", render: (r) => r.course?.name ?? "—" },
                    { key: "dueDate", label: "Due", render: (r) => r.dueDate ? fmtDate(r.dueDate) : "—" },
                    { key: "_count", label: "Submissions", render: (r) => String(r._count?.submissions ?? 0) },
                ]}
                onEdit={openEdit}
                onDelete={setDeleteTarget}
            />

            <CrudDrawer open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Assignment" : "New Assignment"} onSubmit={handleSubmit} submitting={submitting}>
                <FormInput label="Title" required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Assignment title" />
                <FormTextarea label="Description" value={form.description} onChange={(v) => setForm((f) => ({ ...f, description: v }))} placeholder="Optional description" />
                <FormSelect
                    label="Course"
                    required
                    value={form.courseId}
                    onChange={(v) => setForm((f) => ({ ...f, courseId: v }))}
                    options={[{ value: "", label: "Select course..." }, ...courses.map((c) => ({ value: String(c.id), label: c.name }))]}
                />
                <FormInput label="Due Date" type="date" value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} />
            </CrudDrawer>

            <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} confirming={deleting}
                title="Delete Assignment" description={`Delete "${deleteTarget?.title}"? This will also remove all submissions.`} />
        </div>
    )
}

// ─── Teacher: Grading Tab ─────────────────────────────────────────────────────

interface GradeForm { userId: string; assignmentId: string; grade: string }
const emptyGradeForm: GradeForm = { userId: "", assignmentId: "", grade: "" }

export function TeacherGradingTab({ getToken }: { getToken: GetToken }) {
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

// ─── Teacher: Products Tab (approve student products) ─────────────────────────

export function TeacherProductsTab({ getToken }: { getToken: GetToken }) {
    const [products, setProducts] = useState<ApiProduct[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<number | null>(null)

    const load = useCallback(async () => {
        try {
            setLoading(true)
            const c = await getAuthedClient(getToken)
            const res = await c.get<{ success: boolean; data: ApiProduct[] }>("/market/pending")
            setProducts(res.data.data)
        } catch (e) { console.error(e) } finally { setLoading(false) }
    }, [getToken])

    useEffect(() => { load() }, [load])

    async function approve(id: number, status: "approved" | "rejected") {
        try {
            setActionLoading(id)
            const c = await getAuthedClient(getToken)
            await c.patch(`/market/products/${id}/approval`, { status })
            setProducts((prev) => prev.filter((p) => p.id !== id))
        } catch (e) { console.error(e) } finally { setActionLoading(null) }
    }

    return (
        <div className="space-y-4">
            <SectionHeader title="Product Approvals" subtitle={`${products.length} pending approval`} />
            <DataTable<ApiProduct>
                loading={loading} data={products} searchKeys={["name"]}
                columns={[
                    { key: "name", label: "Product" },
                    { key: "creator", label: "By", render: (r) => r.creator?.username ?? "—" },
                    { key: "price", label: "Price", render: (r) => fmtCurrency(r.price) },
                    { key: "stock", label: "Stock" },
                    { key: "approval", label: "Status", render: (r) => <RoleBadge value={r.approval} /> },
                ]}
                extraActions={(row) => (
                    <div className="flex gap-1">
                        <Button variant="outline" size="sm" className="h-7 gap-1 text-xs text-green-600 hover:text-green-600 border-green-200"
                            disabled={actionLoading === row.id} onClick={() => approve(row.id, "approved")}>
                            {actionLoading === row.id ? <Loader2 className="size-3 animate-spin" /> : <CheckCircle className="size-3" />}
                            Approve
                        </Button>
                        <Button variant="outline" size="sm" className="h-7 gap-1 text-xs text-red-600 hover:text-red-600 border-red-200"
                            disabled={actionLoading === row.id} onClick={() => approve(row.id, "rejected")}>
                            <XCircle className="size-3" />
                            Reject
                        </Button>
                    </div>
                )}
                emptyText="No products pending approval"
            />
        </div>
    )
}

// ─── Teacher: Announcements Tab ───────────────────────────────────────────────

interface AnnForm { title: string; description: string }
const emptyAnnForm: AnnForm = { title: "", description: "" }

export function TeacherAnnouncementsTab({ getToken }: { getToken: GetToken }) {
    const [announcements, setAnnouncements] = useState<ApiAnnouncement[]>([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<ApiAnnouncement | null>(null)
    const [form, setForm] = useState<AnnForm>(emptyAnnForm)
    const [submitting, setSubmitting] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const load = useCallback(async () => {
        try {
            setLoading(true)
            const c = await getAuthedClient(getToken)
            const res = await c.get<{ success: boolean; data: ApiAnnouncement[] }>("/announcements")
            setAnnouncements(res.data.data)
        } catch (e) { console.error(e) } finally { setLoading(false) }
    }, [getToken])

    useEffect(() => { load() }, [load])

    async function handleSubmit() {
        if (!form.title.trim()) return
        try {
            setSubmitting(true)
            const c = await getAuthedClient(getToken)
            const res = await c.post<{ success: boolean; data: ApiAnnouncement }>("/announcements", { title: form.title, description: form.description || undefined })
            setAnnouncements((prev) => [res.data.data, ...prev])
            setModalOpen(false); setForm(emptyAnnForm)
        } catch (e) { console.error(e) } finally { setSubmitting(false) }
    }

    async function handleDelete() {
        if (!deleteTarget) return
        try {
            setDeleting(true)
            const c = await getAuthedClient(getToken)
            await c.delete(`/announcements/${deleteTarget.id}`)
            setAnnouncements((prev) => prev.filter((a) => a.id !== deleteTarget.id))
            setDeleteTarget(null)
        } catch (e) { console.error(e) } finally { setDeleting(false) }
    }

    return (
        <div className="space-y-4">
            <SectionHeader title="Announcements" subtitle={`${announcements.length} total`} action={() => { setForm(emptyAnnForm); setModalOpen(true) }} actionLabel="Post Announcement" />
            <DataTable<ApiAnnouncement>
                loading={loading} data={announcements} searchKeys={["title"]}
                columns={[
                    { key: "title", label: "Title" },
                    { key: "user", label: "By", render: (r) => r.user?.username ?? "—" },
                    { key: "createdAt", label: "Posted", render: (r) => fmtDate(r.createdAt) },
                    { key: "description", label: "Content", render: (r) => <span className="line-clamp-1 max-w-xs text-muted-foreground">{r.description ?? "—"}</span> },
                ]}
                onDelete={setDeleteTarget}
            />

            <CrudDrawer open={modalOpen} onClose={() => setModalOpen(false)} title="Post Announcement" onSubmit={handleSubmit} submitting={submitting} submitLabel="Post">
                <FormInput label="Title" required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Announcement title" maxLength={100} />
                <FormTextarea label="Content" value={form.description} onChange={(v) => setForm((f) => ({ ...f, description: v }))} placeholder="Optional description..." rows={4} />
            </CrudDrawer>

            <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} confirming={deleting}
                title="Delete Announcement" description={`Delete "${deleteTarget?.title}"?`} />
        </div>
    )
}

// ─── Teacher: Audit Log Tab (own logs) ───────────────────────────────────────

export function TeacherAuditLogTab({ getToken }: { getToken: GetToken }) {
    const [logs, setLogs] = useState<ApiAuditLog[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            try {
                setLoading(true)
                const c = await getAuthedClient(getToken)
                const res = await c.get<{ success: boolean; data: ApiAuditLog[]; pagination: unknown }>("/logs/me?limit=100")
                setLogs(res.data.data)
            } catch (e) { console.error(e) } finally { setLoading(false) }
        }
        load()
    }, [getToken])

    const categoryColors: Record<string, string> = {
        AUTH: "bg-blue-500/15 text-blue-600",
        ACADEMIC: "bg-green-500/15 text-green-600",
        MARKET: "bg-orange-500/15 text-orange-600",
        FINANCE: "bg-yellow-500/15 text-yellow-600",
        USER: "bg-purple-500/15 text-purple-600",
        SYSTEM: "bg-gray-500/15 text-gray-600",
    }

    return (
        <div className="space-y-4">
            <SectionHeader title="My Activity Log" subtitle="Your recent actions" />
            <DataTable<ApiAuditLog>
                loading={loading} data={logs} searchKeys={["action", "entity"]}
                columns={[
                    {
                        key: "category", label: "Category",
                        render: (r) => <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${categoryColors[r.category] ?? ""}`}>{r.category}</span>,
                    },
                    { key: "action", label: "Action" },
                    { key: "entity", label: "Entity" },
                    { key: "entityId", label: "Entity ID" },
                    { key: "createdAt", label: "Time", render: (r) => fmtDate(r.createdAt) },
                ]}
            />
        </div>
    )
}

// ─── Teacher: Overview Stats ──────────────────────────────────────────────────

export function TeacherOverview({ getToken }: { getToken: GetToken }) {
    const [stats, setStats] = useState({ students: 0, assignments: 0, pendingProducts: 0, announcements: 0 })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            try {
                setLoading(true)
                const c = await getAuthedClient(getToken)
                const [sRes, aRes, pRes, anRes] = await Promise.all([
                    c.get<{ success: boolean; data: unknown[] }>("/user/students"),
                    c.get<{ success: boolean; data: unknown[] }>("/academic/assignments"),
                    c.get<{ success: boolean; data: unknown[] }>("/market/pending"),
                    c.get<{ success: boolean; data: unknown[] }>("/announcements"),
                ])
                setStats({
                    students: sRes.data.data.length,
                    assignments: aRes.data.data.length,
                    pendingProducts: pRes.data.data.length,
                    announcements: anRes.data.data.length,
                })
            } catch (e) { console.error(e) } finally { setLoading(false) }
        }
        load()
    }, [getToken])

    if (loading) return <div className="flex justify-center py-12"><Loader2 className="size-6 animate-spin text-muted-foreground/50" /></div>

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Students" value={stats.students} icon={<Users className="size-5" />} />
            <StatCard label="Assignments" value={stats.assignments} icon={<BookOpen className="size-5" />} />
            <StatCard label="Pending Approvals" value={stats.pendingProducts} icon={<CheckCircle className="size-5" />} color={stats.pendingProducts > 0 ? "text-yellow-500" : "text-primary"} />
            <StatCard label="Announcements" value={stats.announcements} icon={<Award className="size-5" />} />
        </div>
    )
}

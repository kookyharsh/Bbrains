"use client"

import React, { useState, useEffect, useCallback } from "react"
import { getAuthedClient } from "@/lib/http"
import { Loader2, Users, BookOpen, Shield, ShoppingBag, Trophy, FileText, ArrowUpDown, CheckCircle, XCircle, UserCheck } from "lucide-react"
import { Button } from "@/components/ui/button"

import type {
    ApiUser, ApiAssignment, ApiAnnouncement, ApiProduct,
    ApiRole, ApiAchievement, ApiAuditLog, ApiTransaction, ApiCourse, LogCategory,
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

// ─── Admin: Overview ──────────────────────────────────────────────────────────

export function AdminOverview({ getToken }: { getToken: GetToken }) {
    const [stats, setStats] = useState({
        teachers: 0, students: 0, products: 0, pending: 0,
        roles: 0, achievements: 0, announcements: 0, assignments: 0,
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            try {
                setLoading(true)
                const c = await getAuthedClient(getToken)
                const results = await Promise.allSettled([
                    c.get<{ data: unknown[] }>("/user/teachers"),
                    c.get<{ data: unknown[] }>("/user/students"),
                    c.get<{ data: unknown[] }>("/market/products"),
                    c.get<{ data: unknown[] }>("/market/pending"),
                    c.get<{ data: unknown[] }>("/roles"),
                    c.get<{ data: unknown[] }>("/achievements"),
                    c.get<{ data: unknown[] }>("/announcements"),
                    c.get<{ data: unknown[] }>("/academic/assignments"),
                ])
                const get = (i: number) => results[i].status === "fulfilled" ? (results[i] as PromiseFulfilledResult<{ data: { data: unknown[] } }>).value.data.data.length : 0
                setStats({ teachers: get(0), students: get(1), products: get(2), pending: get(3), roles: get(4), achievements: get(5), announcements: get(6), assignments: get(7) })
            } catch (e) { console.error(e) } finally { setLoading(false) }
        }
        load()
    }, [getToken])

    if (loading) return <div className="flex justify-center py-12"><Loader2 className="size-6 animate-spin text-muted-foreground/50" /></div>

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Teachers" value={stats.teachers} icon={<UserCheck className="size-5" />} />
            <StatCard label="Students" value={stats.students} icon={<Users className="size-5" />} />
            <StatCard label="Products" value={stats.products} icon={<ShoppingBag className="size-5" />} />
            <StatCard label="Pending Products" value={stats.pending} icon={<CheckCircle className="size-5" />} color={stats.pending > 0 ? "text-yellow-500" : "text-primary"} />
            <StatCard label="Assignments" value={stats.assignments} icon={<BookOpen className="size-5" />} />
            <StatCard label="Announcements" value={stats.announcements} icon={<FileText className="size-5" />} />
            <StatCard label="Roles" value={stats.roles} icon={<Shield className="size-5" />} />
            <StatCard label="Achievements" value={stats.achievements} icon={<Trophy className="size-5" />} />
        </div>
    )
}

// ─── Admin: Teachers Tab ──────────────────────────────────────────────────────

interface TeacherForm {
    username: string; email: string; firstName: string; lastName: string
    sex: string; dob: string; phone: string; collegeId: string
}
const emptyTeacherForm: TeacherForm = {
    username: "", email: "", firstName: "", lastName: "",
    sex: "other", dob: "", phone: "", collegeId: "45",
}

export function AdminTeachersTab({ getToken }: { getToken: GetToken }) {
    const [teachers, setTeachers] = useState<ApiUser[]>([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [editing, setEditing] = useState<ApiUser | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<ApiUser | null>(null)
    const [form, setForm] = useState<TeacherForm>(emptyTeacherForm)
    const [submitting, setSubmitting] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const load = useCallback(async () => {
        try {
            setLoading(true)
            const c = await getAuthedClient(getToken)
            const res = await c.get<{ success: boolean; data: ApiUser[] }>("/user/teachers")
            setTeachers(res.data.data)
        } catch (e) { console.error(e) } finally { setLoading(false) }
    }, [getToken])

    useEffect(() => { load() }, [load])

    function openCreate() { setEditing(null); setForm(emptyTeacherForm); setModalOpen(true) }
    function openEdit(t: ApiUser) {
        setEditing(t)
        setForm({
            username: t.username, email: t.email,
            firstName: t.userDetails?.firstName ?? "", lastName: t.userDetails?.lastName ?? "",
            sex: t.userDetails?.sex ?? "other", dob: t.userDetails?.dob?.slice(0, 10) ?? "",
            phone: t.userDetails?.phone ?? "", collegeId: "45",
        })
        setModalOpen(true)
    }

    async function handleSubmit() {
        if (!form.username.trim() || !form.email.trim() || !form.firstName.trim()) return
        try {
            setSubmitting(true)
            const c = await getAuthedClient(getToken)
            const payload = {
                username: form.username, email: form.email,
                firstName: form.firstName, lastName: form.lastName,
                sex: form.sex, dob: form.dob || "2000-01-01",
                phone: form.phone || undefined,
                collegeId: Number(form.collegeId),
            }
            if (editing) {
                const r = await c.put<{ success: boolean; data: ApiUser }>(`/user/teachers/${editing.id}`, payload)
                setTeachers((prev) => prev.map((t) => t.id === editing.id ? r.data.data : t))
            } else {
                const r = await c.post<{ success: boolean; data: ApiUser }>("/user/teachers", payload)
                setTeachers((prev) => [r.data.data, ...prev])
            }
            setModalOpen(false)
        } catch (e) { console.error(e) } finally { setSubmitting(false) }
    }

    async function handleDelete() {
        if (!deleteTarget) return
        try {
            setDeleting(true)
            const c = await getAuthedClient(getToken)
            await c.delete(`/user/teachers/${deleteTarget.id}`)
            setTeachers((prev) => prev.filter((t) => t.id !== deleteTarget.id))
            setDeleteTarget(null)
        } catch (e) { console.error(e) } finally { setDeleting(false) }
    }

    return (
        <div className="space-y-4">
            <SectionHeader title="Teachers" subtitle={`${teachers.length} teachers`} action={openCreate} actionLabel="Add Teacher" />
            <DataTable<ApiUser>
                loading={loading} data={teachers} searchKeys={["username", "email"]}
                columns={[
                    { key: "username", label: "Username" },
                    { key: "email", label: "Email" },
                    { key: "userDetails", label: "Name", render: (r) => fullName(r.userDetails) },
                    { key: "type", label: "Type", render: (r) => <RoleBadge value={r.type} /> },
                ]}
                onEdit={openEdit} onDelete={setDeleteTarget}
            />

            <CrudDrawer open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Teacher" : "Add Teacher"} onSubmit={handleSubmit} submitting={submitting}>
                <div className="grid grid-cols-2 gap-3">
                    <FormInput label="Username" required value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} placeholder="username" disabled={!!editing} />
                    <FormInput label="Email" required type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="email@domain.com" disabled={!!editing} />
                    <FormInput label="First Name" required value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} placeholder="First" />
                    <FormInput label="Last Name" required value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} placeholder="Last" />
                    <FormSelect label="Sex" value={form.sex} onChange={(v) => setForm((f) => ({ ...f, sex: v }))}
                        options={[{ value: "male", label: "Male" }, { value: "female", label: "Female" }, { value: "other", label: "Other" }]} />
                    <FormInput label="Date of Birth" type="date" value={form.dob} onChange={(e) => setForm((f) => ({ ...f, dob: e.target.value }))} />
                    <FormInput label="Phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+91 ..." />
                    <FormInput label="College ID" value={form.collegeId} onChange={(e) => setForm((f) => ({ ...f, collegeId: e.target.value }))} />
                </div>
                {!editing && <p className="text-xs text-muted-foreground">An invite email will be sent to the teacher so they can set their password.</p>}
            </CrudDrawer>

            <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} confirming={deleting}
                title="Delete Teacher" description={`Delete teacher "${deleteTarget?.username}"? This cannot be undone.`} />
        </div>
    )
}

// ─── Admin: Students Tab ──────────────────────────────────────────────────────

export function AdminStudentsTab({ getToken }: { getToken: GetToken }) {
    const [students, setStudents] = useState<ApiUser[]>([])
    const [loading, setLoading] = useState(true)
    const [deleteTarget, setDeleteTarget] = useState<ApiUser | null>(null)
    const [deleting, setDeleting] = useState(false)

    const load = useCallback(async () => {
        try {
            setLoading(true)
            const c = await getAuthedClient(getToken)
            const res = await c.get<{ success: boolean; data: ApiUser[] }>("/user/students")
            setStudents(res.data.data)
        } catch (e) { console.error(e) } finally { setLoading(false) }
    }, [getToken])

    useEffect(() => { load() }, [load])

    async function handleDelete() {
        if (!deleteTarget) return
        try {
            setDeleting(true)
            const c = await getAuthedClient(getToken)
            await c.delete(`/user/delete/${deleteTarget.id}`)
            setStudents((prev) => prev.filter((s) => s.id !== deleteTarget.id))
            setDeleteTarget(null)
        } catch (e) { console.error(e) } finally { setDeleting(false) }
    }

    return (
        <div className="space-y-4">
            <SectionHeader title="Students" subtitle={`${students.length} total students`} />
            <DataTable<ApiUser>
                loading={loading} data={students} searchKeys={["username", "email"]}
                columns={[
                    { key: "username", label: "Username" },
                    { key: "email", label: "Email" },
                    { key: "userDetails", label: "Name", render: (r) => fullName(r.userDetails) },
                    { key: "xp", label: "Level", render: (r) => r.xp ? `Lv ${r.xp.level} (${r.xp.xp} XP)` : "—" },
                    { key: "wallet", label: "Balance", render: (r) => r.wallet ? fmtCurrency(r.wallet.balance) : "—" },
                ]}
                onDelete={setDeleteTarget}
            />
            <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} confirming={deleting}
                title="Delete Student" description={`Permanently delete student "${deleteTarget?.username}"? This will remove all their data.`} />
        </div>
    )
}

// ─── Admin: Assignments Tab ───────────────────────────────────────────────────

interface AssignmentForm { title: string; description: string; courseId: string; dueDate: string }
const emptyAssForm: AssignmentForm = { title: "", description: "", courseId: "", dueDate: "" }

export function AdminAssignmentsTab({ getToken }: { getToken: GetToken }) {
    const [assignments, setAssignments] = useState<ApiAssignment[]>([])
    const [courses, setCourses] = useState<ApiCourse[]>([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [editing, setEditing] = useState<ApiAssignment | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<ApiAssignment | null>(null)
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
                loading={loading} data={assignments} searchKeys={["title"]}
                columns={[
                    { key: "title", label: "Title" },
                    { key: "course", label: "Course", render: (r) => r.course?.name ?? "—" },
                    { key: "dueDate", label: "Due Date", render: (r) => r.dueDate ? fmtDate(r.dueDate) : "—" },
                    { key: "_count", label: "Submissions", render: (r) => String(r._count?.submissions ?? 0) },
                ]}
                onEdit={openEdit} onDelete={setDeleteTarget}
            />
            <CrudDrawer open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Assignment" : "New Assignment"} onSubmit={handleSubmit} submitting={submitting}>
                <FormInput label="Title" required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
                <FormTextarea label="Description" value={form.description} onChange={(v) => setForm((f) => ({ ...f, description: v }))} />
                <FormSelect label="Course" required value={form.courseId} onChange={(v) => setForm((f) => ({ ...f, courseId: v }))}
                    options={[{ value: "", label: "Select course..." }, ...courses.map((c) => ({ value: String(c.id), label: c.name }))]} />
                <FormInput label="Due Date" type="date" value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} />
            </CrudDrawer>
            <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} confirming={deleting}
                title="Delete Assignment" description={`Delete "${deleteTarget?.title}"?`} />
        </div>
    )
}

// ─── Admin: Announcements Tab ─────────────────────────────────────────────────

export function AdminAnnouncementsTab({ getToken }: { getToken: GetToken }) {
    const [announcements, setAnnouncements] = useState<ApiAnnouncement[]>([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<ApiAnnouncement | null>(null)
    const [form, setForm] = useState({ title: "", description: "" })
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
            setModalOpen(false); setForm({ title: "", description: "" })
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
            <SectionHeader title="Announcements" subtitle={`${announcements.length} total`} action={() => { setForm({ title: "", description: "" }); setModalOpen(true) }} actionLabel="Post" />
            <DataTable<ApiAnnouncement>
                loading={loading} data={announcements} searchKeys={["title"]}
                columns={[
                    { key: "title", label: "Title" },
                    { key: "user", label: "Posted By", render: (r) => r.user?.username ?? "—" },
                    { key: "createdAt", label: "Date", render: (r) => fmtDate(r.createdAt) },
                    { key: "description", label: "Content", render: (r) => <span className="line-clamp-1 max-w-xs text-muted-foreground text-xs">{r.description ?? "—"}</span> },
                ]}
                onDelete={setDeleteTarget}
            />
            <CrudDrawer open={modalOpen} onClose={() => setModalOpen(false)} title="Post Announcement" onSubmit={handleSubmit} submitting={submitting} submitLabel="Post">
                <FormInput label="Title" required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} maxLength={100} />
                <FormTextarea label="Content" value={form.description} onChange={(v) => setForm((f) => ({ ...f, description: v }))} rows={4} />
            </CrudDrawer>
            <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} confirming={deleting}
                title="Delete Announcement" description={`Delete "${deleteTarget?.title}"?`} />
        </div>
    )
}

// ─── Admin: Roles Tab ─────────────────────────────────────────────────────────

interface RoleForm { name: string; description: string }
const emptyRoleForm: RoleForm = { name: "", description: "" }

export function AdminRolesTab({ getToken }: { getToken: GetToken }) {
    const [roles, setRoles] = useState<ApiRole[]>([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [editing, setEditing] = useState<ApiRole | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<ApiRole | null>(null)
    const [form, setForm] = useState<RoleForm>(emptyRoleForm)
    const [submitting, setSubmitting] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const load = useCallback(async () => {
        try {
            setLoading(true)
            const c = await getAuthedClient(getToken)
            const res = await c.get<{ success: boolean; data: ApiRole[] }>("/roles")
            setRoles(res.data.data)
        } catch (e) { console.error(e) } finally { setLoading(false) }
    }, [getToken])

    useEffect(() => { load() }, [load])

    function openCreate() { setEditing(null); setForm(emptyRoleForm); setModalOpen(true) }
    function openEdit(r: ApiRole) { setEditing(r); setForm({ name: r.name, description: r.description ?? "" }); setModalOpen(true) }

    async function handleSubmit() {
        if (!form.name.trim()) return
        try {
            setSubmitting(true)
            const c = await getAuthedClient(getToken)
            const payload = { name: form.name, description: form.description || undefined }
            if (editing) {
                const r = await c.put<{ success: boolean; data: ApiRole }>(`/roles/${editing.id}`, payload)
                setRoles((prev) => prev.map((ro) => ro.id === editing.id ? r.data.data : ro))
            } else {
                const r = await c.post<{ success: boolean; data: ApiRole }>("/roles", payload)
                setRoles((prev) => [...prev, r.data.data])
            }
            setModalOpen(false)
        } catch (e) { console.error(e) } finally { setSubmitting(false) }
    }

    async function handleDelete() {
        if (!deleteTarget) return
        try {
            setDeleting(true)
            const c = await getAuthedClient(getToken)
            await c.delete(`/roles/${deleteTarget.id}`)
            setRoles((prev) => prev.filter((r) => r.id !== deleteTarget.id))
            setDeleteTarget(null)
        } catch (e) { console.error(e) } finally { setDeleting(false) }
    }

    return (
        <div className="space-y-4">
            <SectionHeader title="Roles" subtitle={`${roles.length} custom roles`} action={openCreate} actionLabel="Create Role" />
            <DataTable<ApiRole>
                loading={loading} data={roles} searchKeys={["name"]}
                columns={[
                    { key: "name", label: "Role Name" },
                    { key: "description", label: "Description", render: (r) => r.description ?? "—" },
                ]}
                onEdit={openEdit} onDelete={setDeleteTarget}
            />
            <CrudDrawer open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Role" : "Create Role"} onSubmit={handleSubmit} submitting={submitting}>
                <FormInput label="Role Name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. moderator" maxLength={50} />
                <FormTextarea label="Description" value={form.description} onChange={(v) => setForm((f) => ({ ...f, description: v }))} placeholder="What this role allows..." />
            </CrudDrawer>
            <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} confirming={deleting}
                title="Delete Role" description={`Delete role "${deleteTarget?.name}"? Users with this role will lose it.`} />
        </div>
    )
}

// ─── Admin: User Roles Tab ────────────────────────────────────────────────────

export function AdminUserRolesTab({ getToken }: { getToken: GetToken }) {
    const [users, setUsers] = useState<ApiUser[]>([])
    const [roles, setRoles] = useState<ApiRole[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedUserId, setSelectedUserId] = useState("")
    const [userRoles, setUserRoles] = useState<ApiRole[]>([])
    const [loadingUserRoles, setLoadingUserRoles] = useState(false)
    const [assignRoleId, setAssignRoleId] = useState("")
    const [assigning, setAssigning] = useState(false)
    const [removeTarget, setRemoveTarget] = useState<{ userId: string; roleId: number; roleName: string } | null>(null)
    const [removing, setRemoving] = useState(false)

    useEffect(() => {
        async function load() {
            try {
                setLoading(true)
                const c = await getAuthedClient(getToken)
                const [uRes, rRes] = await Promise.all([
                    c.get<{ success: boolean; data: ApiUser[] }>("/user/students"),
                    c.get<{ success: boolean; data: ApiRole[] }>("/roles"),
                ])
                setUsers([...uRes.data.data])
                setRoles(rRes.data.data)
            } catch (e) { console.error(e) } finally { setLoading(false) }
        }
        load()
    }, [getToken])

    async function loadUserRoles(userId: string) {
        if (!userId) { setUserRoles([]); return }
        try {
            setLoadingUserRoles(true)
            const c = await getAuthedClient(getToken)
            const res = await c.get<{ success: boolean; data: { role: ApiRole }[] }>(`/roles/users/${userId}`)
            setUserRoles(res.data.data.map((ur) => ur.role))
        } catch (e) { console.error(e) } finally { setLoadingUserRoles(false) }
    }

    async function handleAssign() {
        if (!selectedUserId || !assignRoleId) return
        try {
            setAssigning(true)
            const c = await getAuthedClient(getToken)
            await c.post(`/roles/users/${selectedUserId}/assign`, { roleId: Number(assignRoleId) })
            await loadUserRoles(selectedUserId)
            setAssignRoleId("")
        } catch (e) { console.error(e) } finally { setAssigning(false) }
    }

    async function handleRemove() {
        if (!removeTarget) return
        try {
            setRemoving(true)
            const c = await getAuthedClient(getToken)
            await c.delete(`/roles/users/${removeTarget.userId}/${removeTarget.roleId}`)
            setUserRoles((prev) => prev.filter((r) => r.id !== removeTarget.roleId))
            setRemoveTarget(null)
        } catch (e) { console.error(e) } finally { setRemoving(false) }
    }

    const availableRoles = roles.filter((r) => !userRoles.some((ur) => ur.id === r.id))

    return (
        <div className="space-y-4">
            <SectionHeader title="User Roles" subtitle="Assign or remove custom roles from users" />

            {loading ? <div className="flex justify-center py-8"><Loader2 className="size-6 animate-spin text-muted-foreground/50" /></div> : (
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <label className="text-xs font-semibold text-muted-foreground whitespace-nowrap">Select User:</label>
                        <select
                            value={selectedUserId}
                            onChange={(e) => { setSelectedUserId(e.target.value); loadUserRoles(e.target.value) }}
                            className="h-9 flex-1 max-w-xs rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                            <option value="">-- Choose a user --</option>
                            {users.map((u) => <option key={u.id} value={u.id}>{u.username} ({u.email})</option>)}
                        </select>
                    </div>

                    {selectedUserId && (
                        <>
                            <div className="flex items-center gap-2">
                                <select
                                    value={assignRoleId}
                                    onChange={(e) => setAssignRoleId(e.target.value)}
                                    className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                    disabled={availableRoles.length === 0}
                                >
                                    <option value="">{availableRoles.length === 0 ? "All roles assigned" : "Select role to assign..."}</option>
                                    {availableRoles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                                </select>
                                <Button size="sm" onClick={handleAssign} disabled={!assignRoleId || assigning}>
                                    {assigning ? <Loader2 className="mr-2 size-3.5 animate-spin" /> : null}
                                    Assign Role
                                </Button>
                            </div>

                            <div>
                                <p className="text-xs font-semibold text-muted-foreground mb-2">Current Roles</p>
                                {loadingUserRoles ? (
                                    <Loader2 className="size-4 animate-spin text-muted-foreground/50" />
                                ) : userRoles.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No custom roles assigned</p>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {userRoles.map((r) => (
                                            <div key={r.id} className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1">
                                                <span className="text-xs font-semibold text-primary">{r.name}</span>
                                                <button
                                                    onClick={() => setRemoveTarget({ userId: selectedUserId, roleId: r.id, roleName: r.name })}
                                                    className="text-muted-foreground hover:text-destructive transition-colors"
                                                >
                                                    <XCircle className="size-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}

            <ConfirmDialog open={!!removeTarget} onClose={() => setRemoveTarget(null)} onConfirm={handleRemove} confirming={removing}
                title="Remove Role" description={`Remove role "${removeTarget?.roleName}" from this user?`} />
        </div>
    )
}

// ─── Admin: Products Tab ──────────────────────────────────────────────────────

export function AdminProductsTab({ getToken }: { getToken: GetToken }) {
    const [products, setProducts] = useState<ApiProduct[]>([])
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState<ApiProduct | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<ApiProduct | null>(null)
    const [form, setForm] = useState({ name: "", description: "", price: "", stock: "", imageUrl: "" })
    const [submitting, setSubmitting] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [approvalLoading, setApprovalLoading] = useState<number | null>(null)

    const load = useCallback(async () => {
        try {
            setLoading(true)
            const c = await getAuthedClient(getToken)
            // Admin sees all products (not just approved) - we combine pending + regular
            const [allRes, pendRes] = await Promise.all([
                c.get<{ success: boolean; data: ApiProduct[] }>("/market/products"),
                c.get<{ success: boolean; data: ApiProduct[] }>("/market/pending"),
            ])
            const all = allRes.data.data
            const pending = pendRes.data.data
            const merged = [...pending, ...all.filter((p) => !pending.some((q) => q.id === p.id))]
            setProducts(merged)
        } catch (e) { console.error(e) } finally { setLoading(false) }
    }, [getToken])

    useEffect(() => { load() }, [load])

    function openEdit(p: ApiProduct) {
        setEditing(p)
        setForm({ name: p.name, description: p.description ?? "", price: String(p.price), stock: String(p.stock), imageUrl: p.image ?? "" })
    }

    async function handleUpdate() {
        if (!editing || !form.name.trim()) return
        try {
            setSubmitting(true)
            const c = await getAuthedClient(getToken)
            const r = await c.put<{ success: boolean; data: ApiProduct }>(`/market/products/${editing.id}`, {
                name: form.name, description: form.description || undefined,
                price: Number(form.price), stock: Number(form.stock), imageUrl: form.imageUrl || undefined,
            })
            setProducts((prev) => prev.map((p) => p.id === editing.id ? r.data.data : p))
            setEditing(null)
        } catch (e) { console.error(e) } finally { setSubmitting(false) }
    }

    async function handleDelete() {
        if (!deleteTarget) return
        try {
            setDeleting(true)
            const c = await getAuthedClient(getToken)
            await c.delete(`/market/products/${deleteTarget.id}`)
            setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id))
            setDeleteTarget(null)
        } catch (e) { console.error(e) } finally { setDeleting(false) }
    }

    async function handleApproval(id: number, status: "approved" | "rejected") {
        try {
            setApprovalLoading(id)
            const c = await getAuthedClient(getToken)
            const r = await c.patch<{ success: boolean; data: ApiProduct }>(`/market/products/${id}/approval`, { status })
            setProducts((prev) => prev.map((p) => p.id === id ? r.data.data : p))
        } catch (e) { console.error(e) } finally { setApprovalLoading(null) }
    }

    return (
        <div className="space-y-4">
            <SectionHeader title="Products" subtitle={`${products.length} total`} />
            <DataTable<ApiProduct>
                loading={loading} data={products} searchKeys={["name"]}
                columns={[
                    { key: "name", label: "Product" },
                    { key: "creator", label: "By", render: (r) => r.creator?.username ?? "—" },
                    { key: "price", label: "Price", render: (r) => fmtCurrency(r.price) },
                    { key: "stock", label: "Stock" },
                    { key: "approval", label: "Status", render: (r) => <RoleBadge value={r.approval} /> },
                ]}
                onEdit={openEdit} onDelete={setDeleteTarget}
                extraActions={(row) => row.approval === "pending" ? (
                    <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600" disabled={approvalLoading === row.id} onClick={() => handleApproval(row.id, "approved")}>
                            {approvalLoading === row.id ? <Loader2 className="size-3 animate-spin" /> : <CheckCircle className="size-3.5" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600" disabled={approvalLoading === row.id} onClick={() => handleApproval(row.id, "rejected")}>
                            <XCircle className="size-3.5" />
                        </Button>
                    </div>
                ) : null}
            />
            <CrudDrawer open={!!editing} onClose={() => setEditing(null)} title="Edit Product" onSubmit={handleUpdate} submitting={submitting}>
                <FormInput label="Name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                <FormTextarea label="Description" value={form.description} onChange={(v) => setForm((f) => ({ ...f, description: v }))} />
                <div className="grid grid-cols-2 gap-3">
                    <FormInput label="Price" required type="number" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
                    <FormInput label="Stock" required type="number" value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))} />
                </div>
                <FormInput label="Image URL" value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} placeholder="https://..." />
            </CrudDrawer>
            <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} confirming={deleting}
                title="Delete Product" description={`Delete "${deleteTarget?.name}"?`} />
        </div>
    )
}

// ─── Admin: Achievements Tab ──────────────────────────────────────────────────

interface AchForm { name: string; description: string; requiredXp: string; category: string; icon: string }
const emptyAchForm: AchForm = { name: "", description: "", requiredXp: "", category: "", icon: "" }

export function AdminAchievementsTab({ getToken }: { getToken: GetToken }) {
    const [achievements, setAchievements] = useState<ApiAchievement[]>([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [editing, setEditing] = useState<ApiAchievement | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<ApiAchievement | null>(null)
    const [form, setForm] = useState<AchForm>(emptyAchForm)
    const [submitting, setSubmitting] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const load = useCallback(async () => {
        try {
            setLoading(true)
            const c = await getAuthedClient(getToken)
            const res = await c.get<{ success: boolean; data: ApiAchievement[] }>("/achievements")
            setAchievements(res.data.data)
        } catch (e) { console.error(e) } finally { setLoading(false) }
    }, [getToken])

    useEffect(() => { load() }, [load])

    function openCreate() { setEditing(null); setForm(emptyAchForm); setModalOpen(true) }
    function openEdit(a: ApiAchievement) {
        setEditing(a)
        setForm({ name: a.name, description: a.description ?? "", requiredXp: String(a.requiredXp), category: a.category ?? "", icon: a.icon ?? "" })
        setModalOpen(true)
    }

    async function handleSubmit() {
        if (!form.name.trim() || !form.requiredXp) return
        try {
            setSubmitting(true)
            const c = await getAuthedClient(getToken)
            const payload = { name: form.name, description: form.description || undefined, requiredXp: Number(form.requiredXp), category: form.category || undefined, icon: form.icon || undefined }
            if (editing) {
                const r = await c.put<{ success: boolean; data: ApiAchievement }>(`/achievements/${editing.id}`, payload)
                setAchievements((prev) => prev.map((a) => a.id === editing.id ? r.data.data : a))
            } else {
                const r = await c.post<{ success: boolean; data: ApiAchievement }>("/achievements", payload)
                setAchievements((prev) => [...prev, r.data.data])
            }
            setModalOpen(false)
        } catch (e) { console.error(e) } finally { setSubmitting(false) }
    }

    async function handleDelete() {
        if (!deleteTarget) return
        try {
            setDeleting(true)
            const c = await getAuthedClient(getToken)
            await c.delete(`/achievements/${deleteTarget.id}`)
            setAchievements((prev) => prev.filter((a) => a.id !== deleteTarget.id))
            setDeleteTarget(null)
        } catch (e) { console.error(e) } finally { setDeleting(false) }
    }

    return (
        <div className="space-y-4">
            <SectionHeader title="Achievements" subtitle={`${achievements.length} achievements`} action={openCreate} actionLabel="Create Achievement" />
            <DataTable<ApiAchievement>
                loading={loading} data={achievements} searchKeys={["name", "category"]}
                columns={[
                    { key: "name", label: "Name" },
                    { key: "category", label: "Category", render: (r) => r.category ?? "—" },
                    { key: "requiredXp", label: "Required XP", render: (r) => String(r.requiredXp) },
                    { key: "description", label: "Description", render: (r) => <span className="line-clamp-1 max-w-xs text-muted-foreground text-xs">{r.description ?? "—"}</span> },
                ]}
                onEdit={openEdit} onDelete={setDeleteTarget}
            />
            <CrudDrawer open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Achievement" : "Create Achievement"} onSubmit={handleSubmit} submitting={submitting}>
                <FormInput label="Name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} maxLength={100} />
                <FormTextarea label="Description" value={form.description} onChange={(v) => setForm((f) => ({ ...f, description: v }))} />
                <div className="grid grid-cols-2 gap-3">
                    <FormInput label="Required XP" required type="number" value={form.requiredXp} onChange={(e) => setForm((f) => ({ ...f, requiredXp: e.target.value }))} />
                    <FormInput label="Category" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} placeholder="e.g. Academic" />
                </div>
                <FormInput label="Icon URL" value={form.icon} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))} placeholder="https://..." />
            </CrudDrawer>
            <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} confirming={deleting}
                title="Delete Achievement" description={`Delete achievement "${deleteTarget?.name}"?`} />
        </div>
    )
}

// ─── Admin: Audit Log Tab (with category filter) ──────────────────────────────

const LOG_CATEGORIES: LogCategory[] = ["AUTH", "ACADEMIC", "MARKET", "FINANCE", "USER", "SYSTEM"]

const categoryColors: Record<string, string> = {
    AUTH: "bg-blue-500/15 text-blue-600",
    ACADEMIC: "bg-green-500/15 text-green-600",
    MARKET: "bg-orange-500/15 text-orange-600",
    FINANCE: "bg-yellow-500/15 text-yellow-600",
    USER: "bg-purple-500/15 text-purple-600",
    SYSTEM: "bg-gray-500/15 text-gray-600",
}

export function AdminAuditLogTab({ getToken }: { getToken: GetToken }) {
    const [logs, setLogs] = useState<ApiAuditLog[]>([])
    const [loading, setLoading] = useState(true)
    const [category, setCategory] = useState<string>("")
    const [userFilter] = useState("")

    const load = useCallback(async (cat: string, user: string) => {
        try {
            setLoading(true)
            const c = await getAuthedClient(getToken)
            const params = new URLSearchParams({ limit: "100" })
            if (cat) params.set("category", cat)
            if (user) params.set("userId", user)
            const res = await c.get<{ success: boolean; data: ApiAuditLog[] }>(`/logs?${params.toString()}`)
            setLogs(res.data.data)
        } catch (e) { console.error(e) } finally { setLoading(false) }
    }, [getToken])

    useEffect(() => { load(category, userFilter) }, [load, category, userFilter])

    return (
        <div className="space-y-4">
            <SectionHeader title="Audit Log" subtitle="System-wide activity history" />

            <div className="flex flex-wrap items-center gap-2">
                <div className="flex gap-1.5 flex-wrap">
                    <Button variant={category === "" ? "default" : "outline"} size="sm" className="h-7 rounded-full text-xs" onClick={() => setCategory("")}>All</Button>
                    {LOG_CATEGORIES.map((cat) => (
                        <Button key={cat} variant={category === cat ? "default" : "outline"} size="sm" className="h-7 rounded-full text-xs" onClick={() => setCategory(cat)}>
                            {cat}
                        </Button>
                    ))}
                </div>
            </div>

            <DataTable<ApiAuditLog>
                loading={loading} data={logs} searchKeys={["action", "entity", "entityId"]}
                columns={[
                    {
                        key: "category", label: "Category",
                        render: (r) => <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${categoryColors[r.category] ?? ""}`}>{r.category}</span>,
                    },
                    { key: "user", label: "User", render: (r) => r.user?.username ?? r.userId ?? "System" },
                    { key: "action", label: "Action" },
                    { key: "entity", label: "Entity" },
                    { key: "entityId", label: "Entity ID" },
                    { key: "createdAt", label: "Time", render: (r) => new Date(r.createdAt).toLocaleString("en-IN") },
                ]}
                emptyText="No logs found"
            />
        </div>
    )
}

// ─── Admin: Transactions Tab ──────────────────────────────────────────────────

export function AdminTransactionsTab({ getToken }: { getToken: GetToken }) {
    const [users, setUsers] = useState<ApiUser[]>([])
    const [transactions, setTransactions] = useState<ApiTransaction[]>([])
    const [loading, setLoading] = useState(true)
    const [loadingTxns, setLoadingTxns] = useState(false)
    const [selectedUserId, setSelectedUserId] = useState("")
    const [typeFilter, setTypeFilter] = useState("")
    const [statusFilter, setStatusFilter] = useState("")

    useEffect(() => {
        async function load() {
            try {
                setLoading(true)
                const c = await getAuthedClient(getToken)
                const [sRes, tRes] = await Promise.all([
                    c.get<{ success: boolean; data: ApiUser[] }>("/user/students"),
                    c.get<{ success: boolean; data: ApiUser[] }>("/user/teachers"),
                ])
                setUsers([...sRes.data.data, ...tRes.data.data])
            } catch (e) { console.error(e) } finally { setLoading(false) }
        }
        load()
    }, [getToken])

    async function loadTransactions(userId: string) {
        if (!userId) { setTransactions([]); return }
        try {
            setLoadingTxns(true)
            const c = await getAuthedClient(getToken)
            const res = await c.get<{ success: boolean; data: ApiTransaction[] }>(`/transactions/user/${userId}?limit=100`)
            setTransactions(res.data.data)
        } catch (e) { console.error(e) } finally { setLoadingTxns(false) }
    }

    const filtered = transactions.filter((t) => {
        if (typeFilter && t.type !== typeFilter) return false
        if (statusFilter && t.status !== statusFilter) return false
        return true
    })

    const totalCredit = filtered.filter((t) => t.type === "credit").reduce((s, t) => s + Number(t.amount), 0)
    const totalDebit = filtered.filter((t) => t.type === "debit").reduce((s, t) => s + Number(t.amount), 0)

    return (
        <div className="space-y-4">
            <SectionHeader title="Transaction History" subtitle="View transactions for any user" />

            {loading ? <div className="flex justify-center py-4"><Loader2 className="size-5 animate-spin text-muted-foreground/50" /></div> : (
                <div className="flex flex-wrap items-center gap-3">
                    <select
                        value={selectedUserId}
                        onChange={(e) => { setSelectedUserId(e.target.value); loadTransactions(e.target.value) }}
                        className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                        <option value="">-- Select user --</option>
                        {users.map((u) => <option key={u.id} value={u.id}>{u.username} ({u.type})</option>)}
                    </select>

                    {selectedUserId && (
                        <>
                            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
                                className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                                <option value="">All types</option>
                                <option value="credit">Credit</option>
                                <option value="debit">Debit</option>
                            </select>
                            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                                className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                                <option value="">All statuses</option>
                                <option value="success">Success</option>
                                <option value="failed">Failed</option>
                                <option value="pending">Pending</option>
                            </select>
                        </>
                    )}
                </div>
            )}

            {selectedUserId && !loadingTxns && filtered.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-green-200 bg-green-500/5 p-3">
                        <p className="text-xs font-semibold text-muted-foreground">Total Credits</p>
                        <p className="text-xl font-bold text-green-600">{fmtCurrency(totalCredit)}</p>
                    </div>
                    <div className="rounded-lg border border-red-200 bg-red-500/5 p-3">
                        <p className="text-xs font-semibold text-muted-foreground">Total Debits</p>
                        <p className="text-xl font-bold text-red-600">{fmtCurrency(totalDebit)}</p>
                    </div>
                </div>
            )}

            {loadingTxns ? (
                <div className="flex justify-center py-8"><Loader2 className="size-6 animate-spin text-muted-foreground/50" /></div>
            ) : selectedUserId ? (
                <DataTable<ApiTransaction>
                    data={filtered} searchKeys={["note"]}
                    columns={[
                        { key: "id", label: "ID", render: (r) => `TXN-${r.id}` },
                        { key: "type", label: "Type", render: (r) => <RoleBadge value={r.type} /> },
                        { key: "status", label: "Status", render: (r) => <RoleBadge value={r.status} /> },
                        { key: "amount", label: "Amount", render: (r) => <span className={r.type === "credit" ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>{fmtCurrency(r.amount)}</span> },
                        { key: "note", label: "Note", render: (r) => <span className="text-muted-foreground text-xs line-clamp-1">{r.note ?? "—"}</span> },
                        { key: "transactionDate", label: "Date", render: (r) => fmtDate(r.transactionDate) },
                    ]}
                    emptyText="No transactions found"
                />
            ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <ArrowUpDown className="size-8 mb-2 opacity-40" />
                    <p className="text-sm">Select a user to view their transaction history</p>
                </div>
            )}
        </div>
    )
}

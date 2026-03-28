"use client"

import React, { useState, useEffect, useCallback } from "react"
import { UserCheck } from "lucide-react"
import { api, courseApi, type Course } from "@/services/api/client"
import { toast } from "sonner"
import { SectionHeader } from "@/features/admin/components/SectionHeader"
import { CrudDrawer } from "@/features/admin/components/CrudDrawer"
import { ConfirmDialog } from "@/features/admin/components/ConfirmDialog"
import { TeachersTable } from "./_components/TeachersTable"
import { TeacherForm } from "./_components/TeacherForm"
import { fetchTeachers } from "./data"
import { initForm, emptyTeacherForm, type TeacherForm as TeacherFormType } from "./_types"
import type { ApiUser } from "./_types"

interface TeachersClientProps {
    initialTeachers: ApiUser[]
}

export function TeachersClient({ initialTeachers }: TeachersClientProps) {
    const [teachers, setTeachers] = useState<ApiUser[]>(initialTeachers)
    const [courses, setCourses] = useState<Course[]>([])
    const [loading, setLoading] = useState(false)
    const [modalOpen, setModalOpen] = useState(false)
    const [editing, setEditing] = useState<ApiUser | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<ApiUser | null>(null)
    const [form, setForm] = useState<TeacherFormType>(emptyTeacherForm)
    const [submitting, setSubmitting] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const parseTeacherSubjects = useCallback((value: string) => {
        return value
            .split(/\r?\n|,/)
            .map((subject) => subject.trim())
            .filter(Boolean)
    }, [])

    const load = useCallback(async () => {
        try {
            setLoading(true)
            const [teacherData, coursesResponse] = await Promise.all([
                fetchTeachers(),
                courseApi.getCourses(),
            ])
            setTeachers(teacherData)
            if (coursesResponse.success) {
                setCourses(coursesResponse.data || [])
            }
        } catch (e) {
            console.error(e)
            toast.error("Failed to load teachers")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        load()
    }, [load])

    function openCreate() {
        setEditing(null)
        setForm(emptyTeacherForm)
        setModalOpen(true)
    }

    function openEdit(t: ApiUser) {
        setEditing(t)
        setForm(initForm(t))
        setModalOpen(true)
    }

    async function handleSubmit() {
        if (!form.username.trim() || !form.email.trim() || !form.firstName.trim()) return
        const teacherSubjects = parseTeacherSubjects(form.teacherSubjectsText)
        if (teacherSubjects.length === 0) {
            toast.error("Add at least one subject for the teacher")
            return
        }
        if (!editing) {
            if (form.password.length < 8) {
                toast.error("Temporary password must be at least 8 characters")
                return
            }
            if (form.password !== form.confirmPassword) {
                toast.error("Passwords do not match")
                return
            }
        }
        try {
            setSubmitting(true)
            const payload = {
                username: form.username,
                email: form.email,
                ...(!editing ? { password: form.password } : {}),
                firstName: form.firstName,
                lastName: form.lastName,
                sex: form.sex,
                dob: form.dob || "2000-01-01",
                phone: form.phone || undefined,
                teacherSubjects,
                ...(form.classTeacherCourseId ? { classTeacherCourseId: Number(form.classTeacherCourseId) } : {}),
                ...(form.collegeId.trim() ? { collegeId: Number(form.collegeId) } : {}),
            }
            if (editing) {
                const r = await api.put<ApiUser>(`/user/teachers/${editing.id}`, payload)
                if (r.success) {
                    toast.success("Teacher updated")
                    setTeachers((prev) => prev.map((t) => (t.id === editing.id ? (r.data as ApiUser) : t)))
                    setModalOpen(false)
                } else {
                    toast.error(r.message || "Failed to update teacher")
                }
            } else {
                const r = await api.post<ApiUser>("/user/teachers", payload)
                if (r.success) {
                    toast.success("Teacher added")
                    setTeachers((prev) => [(r.data as ApiUser), ...prev])
                    setModalOpen(false)
                } else {
                    toast.error(r.message || "Failed to add teacher")
                }
            }
        } catch (e) {
            console.error(e)
            toast.error("An error occurred")
        } finally {
            setSubmitting(false)
        }
    }

    async function handleDelete() {
        if (!deleteTarget) return
        try {
            setDeleting(true)
            const res = await api.delete(`/user/teachers/${deleteTarget.id}`)
            if (res.success) {
                toast.success("Teacher deleted")
                setTeachers((prev) => prev.filter((t) => t.id !== deleteTarget.id))
                setDeleteTarget(null)
            } else {
                toast.error(res.message || "Failed to delete teacher")
            }
        } catch (e) {
            console.error(e)
            toast.error("Failed to delete teacher")
        } finally {
            setDeleting(false)
        }
    }

    return (
        <div className="space-y-4">
            <SectionHeader
                title="Teachers"
                subtitle={`${teachers.length} active faculty members`}
                action={{
                    label: "Add Teacher",
                    icon: <UserCheck className="size-4" />,
                    onClick: openCreate,
                }}
            />

            <TeachersTable
                loading={loading}
                data={teachers}
                onEdit={openEdit}
                onDelete={setDeleteTarget}
            />

            <CrudDrawer
                open={modalOpen}
                onClose={() => !submitting && setModalOpen(false)}
                title={editing ? "Edit Teacher" : "Add Teacher"}
                onSubmit={handleSubmit}
                submitting={submitting}
            >
                <TeacherForm
                    form={form}
                    onChange={setForm}
                    submitting={submitting}
                    isEditing={!!editing}
                    courses={courses}
                />
            </CrudDrawer>

            <ConfirmDialog
                open={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                confirming={deleting}
                title="Delete Teacher"
                description={`Are you sure you want to delete teacher "${deleteTarget?.username}"? This action cannot be undone.`}
            />
        </div>
    )
}

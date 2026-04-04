"use client"

import { useState, useEffect, useCallback } from "react"
import { GraduationCap } from "lucide-react"
import { api, courseApi, type Course } from "@/services/api/client"
import { toast } from "sonner"
import { SectionHeader } from "@/features/admin/components/SectionHeader"
import { ConfirmDialog } from "@/features/admin/components/ConfirmDialog"
import { CrudDrawer } from "@/features/admin/components/CrudDrawer"
import { StudentsTable } from "./_components/StudentsTable"
import { StudentForm } from "./_components/StudentForm"
import { fetchStudents } from "./data"
import { emptyStudentForm, initStudentForm, type ApiUser, type StudentForm as StudentFormType } from "./_types"
import { useHasPermission } from "@/components/providers/permissions-provider"

interface StudentsClientProps {
    initialStudents: ApiUser[]
}

export function StudentsClient({ initialStudents }: StudentsClientProps) {
    const canCreateStudent = useHasPermission("create_student")
    const canManageStudent = useHasPermission("manage_student")
    const [students, setStudents] = useState<ApiUser[]>(initialStudents)
    const [courses, setCourses] = useState<Course[]>([])
    const [loading, setLoading] = useState(false)
    const [modalOpen, setModalOpen] = useState(false)
    const [editing, setEditing] = useState<ApiUser | null>(null)
    const [form, setForm] = useState<StudentFormType>(emptyStudentForm)
    const [submitting, setSubmitting] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<ApiUser | null>(null)
    const [deleting, setDeleting] = useState(false)

    const load = useCallback(async () => {
        try {
            setLoading(true)
            const [studentData, coursesResponse] = await Promise.all([
                fetchStudents(),
                courseApi.getCourses(),
            ])
            setStudents(studentData)
            if (coursesResponse.success) {
                setCourses(coursesResponse.data || [])
            }
        } catch (e) {
            console.error(e)
            toast.error("Failed to load students")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        load()
    }, [load])

    function openCreate() {
        if (courses.length === 0) {
            toast.error("Create a class first so the student can be assigned to it")
            return
        }
        setEditing(null)
        setForm(emptyStudentForm)
        setModalOpen(true)
    }

    function openEdit(student: ApiUser) {
        setEditing(student)
        setForm(initStudentForm(student))
        setModalOpen(true)
    }

    async function handleSubmit() {
        if (!form.username.trim() || !form.email.trim() || !form.firstName.trim()) {
            toast.error("Please fill in the required student details")
            return
        }
        if (!editing && form.password.length < 8) {
            toast.error("Temporary password must be at least 8 characters")
            return
        }
        if (!editing && form.password !== form.confirmPassword) {
            toast.error("Passwords do not match")
            return
        }
        if (!form.classId) {
            toast.error("Select a class for the student")
            return
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
                dob: form.dob || "2008-01-01",
                phone: form.phone || undefined,
                classId: Number(form.classId),
                ...(form.collegeId.trim() ? { collegeId: Number(form.collegeId) } : {}),
            }

            const res = editing
                ? await api.put<ApiUser>(`/user/students/${editing.id}`, payload)
                : await api.post<ApiUser>("/user/students", payload)

            if (res.success && res.data) {
                toast.success(editing ? "Student updated" : "Student account created")
                setStudents((prev) =>
                    editing
                        ? prev.map((student) => (student.id === editing.id ? (res.data as ApiUser) : student))
                        : [res.data as ApiUser, ...prev]
                )
                setModalOpen(false)
            } else {
                toast.error(res.message || (editing ? "Failed to update student" : "Failed to create student"))
            }
        } catch (error) {
            console.error(error)
            toast.error(editing ? "An error occurred while updating the student" : "An error occurred while creating the student")
        } finally {
            setSubmitting(false)
        }
    }

    async function handleDelete() {
        if (!deleteTarget) return
        try {
            setDeleting(true)
            const res = await api.delete(`/user/delete/${deleteTarget.id}`)
            if (res.success) {
                toast.success("Student deleted")
                setStudents((prev) => prev.filter((s) => s.id !== deleteTarget.id))
                setDeleteTarget(null)
            } else {
                toast.error(res.message || "Failed to delete student")
            }
        } catch (e) {
            console.error(e)
            toast.error("Failed to delete student")
        } finally {
            setDeleting(false)
        }
    }

    return (
        <div className="space-y-4">
            <SectionHeader
                title="Students"
                subtitle={`${students.length} total students enrolled`}
                action={canCreateStudent || canManageStudent ? {
                    label: "Add Student",
                    icon: <GraduationCap className="size-4" />,
                    onClick: openCreate,
                } : undefined}
            />

            <StudentsTable loading={loading} data={students} onEdit={canManageStudent ? openEdit : undefined} onDelete={canManageStudent ? setDeleteTarget : undefined} />

            <CrudDrawer
                open={modalOpen}
                onClose={() => !submitting && setModalOpen(false)}
                title={editing ? "Edit Student" : "Add Student"}
                onSubmit={handleSubmit}
                submitting={submitting}
                submitLabel={editing ? "Save Changes" : "Create Student"}
            >
                <StudentForm form={form} onChange={setForm} disabled={submitting} courses={courses} isEditing={!!editing} />
            </CrudDrawer>

            <ConfirmDialog
                open={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                confirming={deleting}
                title="Delete Student"
                description={`Are you sure you want to permanently delete student "${deleteTarget?.username}"? This will remove all their data and cannot be undone.`}
            />
        </div>
    )
}

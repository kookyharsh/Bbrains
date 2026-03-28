"use client"

import { useState, useEffect, useCallback } from "react"
import { GraduationCap } from "lucide-react"
import { api } from "@/services/api/client"
import { toast } from "sonner"
import { SectionHeader } from "@/features/admin/components/SectionHeader"
import { ConfirmDialog } from "@/features/admin/components/ConfirmDialog"
import { CrudDrawer } from "@/features/admin/components/CrudDrawer"
import { StudentsTable } from "./_components/StudentsTable"
import { StudentForm } from "./_components/StudentForm"
import { fetchStudents } from "./data"
import { emptyStudentForm, type ApiUser, type StudentForm as StudentFormType } from "./_types"

interface StudentsClientProps {
    initialStudents: ApiUser[]
}

export function StudentsClient({ initialStudents }: StudentsClientProps) {
    const [students, setStudents] = useState<ApiUser[]>(initialStudents)
    const [loading, setLoading] = useState(false)
    const [modalOpen, setModalOpen] = useState(false)
    const [form, setForm] = useState<StudentFormType>(emptyStudentForm)
    const [submitting, setSubmitting] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<ApiUser | null>(null)
    const [deleting, setDeleting] = useState(false)

    const load = useCallback(async () => {
        try {
            setLoading(true)
            const data = await fetchStudents()
            setStudents(data)
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
        setForm(emptyStudentForm)
        setModalOpen(true)
    }

    async function handleSubmit() {
        if (!form.username.trim() || !form.email.trim() || !form.firstName.trim()) {
            toast.error("Please fill in the required student details")
            return
        }
        if (form.password.length < 8) {
            toast.error("Temporary password must be at least 8 characters")
            return
        }
        if (form.password !== form.confirmPassword) {
            toast.error("Passwords do not match")
            return
        }

        try {
            setSubmitting(true)
            const res = await api.post<ApiUser>("/user/students", {
                username: form.username,
                email: form.email,
                password: form.password,
                firstName: form.firstName,
                lastName: form.lastName,
                sex: form.sex,
                dob: form.dob || "2008-01-01",
                phone: form.phone || undefined,
                ...(form.collegeId.trim() ? { collegeId: Number(form.collegeId) } : {}),
            })

            if (res.success && res.data) {
                toast.success("Student account created")
                setStudents((prev) => [res.data as ApiUser, ...prev])
                setModalOpen(false)
            } else {
                toast.error(res.message || "Failed to create student")
            }
        } catch (error) {
            console.error(error)
            toast.error("An error occurred while creating the student")
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
                action={{
                    label: "Add Student",
                    icon: <GraduationCap className="size-4" />,
                    onClick: openCreate,
                }}
            />

            <StudentsTable loading={loading} data={students} onDelete={setDeleteTarget} />

            <CrudDrawer
                open={modalOpen}
                onClose={() => !submitting && setModalOpen(false)}
                title="Add Student"
                onSubmit={handleSubmit}
                submitting={submitting}
                submitLabel="Create Student"
            >
                <StudentForm form={form} onChange={setForm} disabled={submitting} />
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

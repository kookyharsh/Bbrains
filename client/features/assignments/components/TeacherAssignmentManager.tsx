"use client"

import { useCallback, useEffect, useState } from "react"
import { Loader2, Camera } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/features/admin/components/DataTable"
import { SectionHeader } from "@/features/admin/components/SectionHeader"
import { CrudDrawer } from "@/features/admin/components/CrudDrawer"
import { ConfirmDialog } from "@/features/admin/components/ConfirmDialog"
import { FormInput } from "@/features/admin/components/form/FormInput"
import { FormSelect } from "@/features/admin/components/form/FormSelect"
import { FormTextarea } from "@/features/admin/components/form/FormTextarea"
import { useCloudinaryUpload } from "@/hooks/use-cloudinary-upload"
import type { ApiAssignment } from "@/lib/types/api"
import { getAuthedClient, type AssessmentCourseOption } from "@/services/api/client"

type AssignmentForm = {
  title: string
  description: string
  courseId: string
  dueDate: string
  file: string
}

const emptyForm: AssignmentForm = {
  title: "",
  description: "",
  courseId: "",
  dueDate: "",
  file: "",
}

function fmtDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function TeacherAssignmentManager() {
  const [assignments, setAssignments] = useState<ApiAssignment[]>([])
  const [courses, setCourses] = useState<AssessmentCourseOption[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ApiAssignment | null>(null)
  const [editing, setEditing] = useState<ApiAssignment | null>(null)
  const [form, setForm] = useState<AssignmentForm>(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const { uploadFile, isUploading } = useCloudinaryUpload()

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const client = await getAuthedClient()
      const [assignmentResponse, courseResponse] = await Promise.all([
        client.get<{ success: boolean; data: ApiAssignment[] }>("/academic/assignments"),
        client.get<{ success: boolean; data: AssessmentCourseOption[] }>("/courses?limit=100"),
      ])
      setAssignments(assignmentResponse.data.data || [])
      setCourses(courseResponse.data.data || [])
    } catch (error) {
      console.error(error)
      toast.error("Failed to load assignments")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  function openEdit(assignment: ApiAssignment) {
    setEditing(assignment)
    setForm({
      title: assignment.title,
      description: assignment.description ?? "",
      courseId: String(assignment.courseId),
      dueDate: assignment.dueDate?.slice(0, 10) ?? "",
      file: assignment.file || "",
    })
    setModalOpen(true)
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const url = await uploadFile(file)
      if (url) {
        setForm((current) => ({ ...current, file: url }))
        toast.success("File uploaded successfully")
      }
    } catch (error) {
      console.error(error)
      toast.error("Upload failed")
    }
  }

  async function handleSubmit() {
    if (!form.title.trim() || !form.courseId) {
      toast.error("Assignment title and class are required")
      return
    }

    try {
      setSubmitting(true)
      const client = await getAuthedClient()
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        courseId: Number(form.courseId),
        dueDate: form.dueDate || undefined,
        file: form.file || undefined,
      }

      if (editing) {
        const response = await client.put<{ success: boolean; data: ApiAssignment }>(
          `/academic/assignments/${editing.id}`,
          payload
        )
        setAssignments((current) =>
          current.map((assignment) => (assignment.id === editing.id ? response.data.data : assignment))
        )
        toast.success("Assignment updated")
      } else {
        const response = await client.post<{ success: boolean; data: ApiAssignment }>("/academic/assignments", payload)
        setAssignments((current) => [response.data.data, ...current])
        toast.success("Assignment created")
      }

      setModalOpen(false)
    } catch (error) {
      console.error(error)
      toast.error("Failed to save assignment")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return

    try {
      setDeleting(true)
      const client = await getAuthedClient()
      await client.delete(`/academic/assignments/${deleteTarget.id}`)
      setAssignments((current) => current.filter((assignment) => assignment.id !== deleteTarget.id))
      setDeleteTarget(null)
      toast.success("Assignment deleted")
    } catch (error) {
      console.error(error)
      toast.error("Failed to delete assignment")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Assignments"
        subtitle="Create classwork, homework, and project briefs here."
        action={openCreate}
        actionLabel="New Assignment"
      />

      <DataTable<ApiAssignment>
        loading={loading}
        data={assignments}
        searchKeys={["title"]}
        columns={[
          { key: "title", label: "Title" },
          { key: "course", label: "Course", render: (record) => record.course?.name ?? "-" },
          { key: "dueDate", label: "Due", render: (record) => (record.dueDate ? fmtDate(record.dueDate) : "-") },
          { key: "_count", label: "Submissions", render: (record) => String(record._count?.submissions ?? 0) },
        ]}
        onEdit={openEdit}
        onDelete={setDeleteTarget}
      />

      <CrudDrawer
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Assignment" : "New Assignment"}
        onSubmit={handleSubmit}
        submitting={submitting}
      >
        <FormInput
          label="Title"
          required
          value={form.title}
          onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
          placeholder="Assignment title"
        />
        <FormTextarea
          label="Description"
          value={form.description}
          onChange={(value) => setForm((current) => ({ ...current, description: value }))}
          placeholder="Optional description"
        />
        <FormSelect
          label="Course"
          required
          value={form.courseId}
          onChange={(value) => setForm((current) => ({ ...current, courseId: value }))}
          options={[
            { value: "", label: "Select class..." },
            ...courses.map((course) => ({
              value: String(course.id),
              label: `${course.name}${course.standard ? ` (${course.standard})` : ""}`,
            })),
          ]}
        />
        <FormInput
          label="Due Date"
          type="date"
          value={form.dueDate}
          onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))}
        />

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">Attachment (Optional)</label>
          <div className="flex items-center gap-4">
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-border/40 bg-muted px-4 py-2 transition-colors hover:bg-muted/80">
              {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              <span className="text-xs font-medium">{form.file ? "Change File" : "Upload File"}</span>
              <input type="file" className="hidden" onChange={handleFileChange} disabled={isUploading} />
            </label>
            {form.file ? <span className="text-xs font-semibold text-brand-purple">File attached</span> : null}
          </div>
        </div>
      </CrudDrawer>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        confirming={deleting}
        title="Delete Assignment"
        description={`Delete "${deleteTarget?.title}"? This will also remove all submissions.`}
      />
    </div>
  )
}

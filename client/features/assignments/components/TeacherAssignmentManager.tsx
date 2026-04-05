"use client"

import { useCallback, useEffect, useState } from "react"
import { Loader2, Camera, Calendar, FileText, Pencil, Trash2, Search, BookOpen } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
  rewardPoints: string
}

const emptyForm: AssignmentForm = {
  title: "",
  description: "",
  courseId: "",
  dueDate: "",
  file: "",
  rewardPoints: "0",
}

function fmtDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function getRequestErrorMessage(error: unknown, fallback: string) {
  if (
    error &&
    typeof error === "object" &&
    "response" in error &&
    error.response &&
    typeof error.response === "object"
  ) {
    const response = error.response as { data?: { message?: string; error?: string } }
    return response.data?.message || response.data?.error || fallback
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
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
  const [searchQuery, setSearchQuery] = useState("")

  const { uploadFile, isUploading } = useCloudinaryUpload()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const client = await getAuthedClient()
      const [assignmentResult, courseResult] = await Promise.allSettled([
        client.get<{ success: boolean; data: ApiAssignment[] }>("/academic/assignments"),
        client.get<{ success: boolean; data: AssessmentCourseOption[] }>("/courses?limit=100"),
      ])

      if (assignmentResult.status === "fulfilled") {
        setAssignments(assignmentResult.value.data.data || [])
      } else {
        console.error(assignmentResult.reason)
        setAssignments([])
        toast.error(getRequestErrorMessage(assignmentResult.reason, "Failed to load assignments"))
      }

      if (courseResult.status === "fulfilled") {
        setCourses(courseResult.value.data.data || [])
      } else {
        console.error(courseResult.reason)
        setCourses([])
        toast.error(getRequestErrorMessage(courseResult.reason, "Failed to load classes"))
      }
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
      rewardPoints: String(assignment.rewardPoints ?? 0),
    })
    setModalOpen(true)
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const url = await uploadFile(file, { folder: "assignments" })
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

    if (Number(form.rewardPoints || 0) < 0) {
      toast.error("Reward points cannot be negative")
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
        rewardPoints: Math.max(0, Number(form.rewardPoints || 0)),
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

  const filteredAssignments = assignments.filter((a) => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return (
      a.title.toLowerCase().includes(query) ||
      a.course?.name?.toLowerCase().includes(query) ||
      a.description?.toLowerCase().includes(query)
    )
  })

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading assignments...
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Assignments"
        subtitle="Create classwork, homework, and project briefs here."
        action={openCreate}
        actionLabel="New Assignment"
      />

      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="rounded-xl pl-9"
          placeholder="Search assignments..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredAssignments.length === 0 ? (
        <Card className="border-dashed border-border/70">
          <CardContent className="flex flex-col items-center justify-center py-10 text-center text-sm text-muted-foreground">
            <BookOpen className="size-8 mb-2 opacity-40" />
            {searchQuery ? "No assignments match your search." : "No assignments yet. Create one to get started."}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAssignments.map((assignment) => (
            <Card key={assignment.id} className="border-border/60 transition-shadow hover:shadow-md">
              <CardContent className="flex flex-col gap-3 p-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {assignment.course?.name || "General"}
                    </Badge>
                    {assignment._count?.submissions != null && (
                      <Badge variant="outline" className="text-xs">
                        <FileText className="mr-1 size-3" />
                        {assignment._count.submissions} submission{assignment._count.submissions !== 1 ? "s" : ""}
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-semibold text-foreground line-clamp-2">{assignment.title}</h3>
                  {assignment.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{assignment.description}</p>
                  )}
                  {assignment.dueDate && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="size-3.5" />
                      Due {fmtDate(assignment.dueDate)}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Badge variant="outline" className="text-xs">
                      {assignment.rewardPoints ?? 0} point{(assignment.rewardPoints ?? 0) === 1 ? "" : "s"}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-border/50">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1.5 text-xs"
                    onClick={() => openEdit(assignment)}
                  >
                    <Pencil className="size-3.5" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setDeleteTarget(assignment)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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
        <FormInput
          label="Reward Points"
          type="number"
          min={0}
          value={form.rewardPoints}
          onChange={(event) => setForm((current) => ({ ...current, rewardPoints: event.target.value }))}
          placeholder="0"
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

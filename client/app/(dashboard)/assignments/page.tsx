"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { DashboardContent } from "@/components/dashboard-content"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { assignmentApi, dashboardApi, type Assignment } from "@/services/api/client"
import { useCloudinaryUpload } from "@/hooks/use-cloudinary-upload"
import { Calendar, FileText, Loader2, Search, Upload } from "lucide-react"
import { toast } from "sonner"
import { TeacherAssignmentManager } from "@/features/assignments/components/TeacherAssignmentManager"

function fmtDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export default function AssignmentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [userRole, setUserRole] = useState<string | null>(null)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitAssignment, setSubmitAssignment] = useState<Assignment | null>(null)

  const { uploadFile } = useCloudinaryUpload()

  const loadAssignments = useCallback(async () => {
    try {
      setLoading(true)
      const [userResponse, assignmentResponse] = await Promise.all([
        dashboardApi.getUser(),
        assignmentApi.getAssignments(),
      ])

      if (userResponse.success && userResponse.data) {
        setUserRole(userResponse.data.type)
      }

      if (assignmentResponse.success && assignmentResponse.data) {
        setAssignments(assignmentResponse.data)
      }
    } catch (error) {
      console.error(error)
      toast.error("Failed to load your assignments")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadAssignments()
  }, [loadAssignments])

  const filteredAssignments = useMemo(() => {
    return assignments.filter((assignment) => {
      if (!searchQuery.trim()) return true
      const query = searchQuery.toLowerCase()
      return (
        assignment.title.toLowerCase().includes(query) ||
        assignment.course?.name?.toLowerCase().includes(query)
      )
    })
  }, [assignments, searchQuery])

  if (loading && !userRole) {
    return (
      <DashboardContent className="space-y-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading assignments...
        </div>
      </DashboardContent>
    )
  }

  if (userRole === "teacher") {
    return (
      <DashboardContent className="space-y-6">
        <TeacherAssignmentManager />
      </DashboardContent>
    )
  }

  async function handleFileSubmit(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file || !submitAssignment) return

    setSubmitting(true)
    const loadingToast = toast.loading("Uploading your assignment...")

    try {
      const fileUrl = await uploadFile(file)
      if (!fileUrl) {
        throw new Error("Upload failed")
      }

      const payload = {
        assignmentId: submitAssignment.id,
        content: `Submitted file: ${file.name}`,
        fileUrl,
      }

      const response = await assignmentApi.submitAssignment(payload)
      if (!response.success) {
        throw new Error(response.message || "Submission failed")
      }

      toast.success("Assignment submitted successfully", { id: loadingToast })
      setSubmitAssignment(null)
      await loadAssignments()
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : "Submission failed", { id: loadingToast })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DashboardContent className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Assignments</h1>
          <p className="text-muted-foreground">Submit coursework, track pending work, and upload files from one place.</p>
        </div>

        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="rounded-2xl pl-9"
            placeholder="Search assignments..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardDescription>Open Assignments</CardDescription>
            <CardTitle className="text-2xl">{loading ? "-" : assignments.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardDescription>Ready to Submit</CardDescription>
            <CardTitle className="text-2xl">{loading ? "-" : filteredAssignments.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading assignments...
        </div>
      ) : filteredAssignments.length === 0 ? (
        <Card className="border-dashed border-border/70">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No assignments matched your search.
          </CardContent>
        </Card>
      ) : (
        filteredAssignments.map((assignment) => (
          <Card key={assignment.id} className="border-border/60">
            <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{assignment.course?.name || "General"}</Badge>
                  <Badge variant="outline">{assignment.status || "incomplete"}</Badge>
                </div>
                <div>
                  <p className="font-semibold text-foreground">{assignment.title}</p>
                  <p className="text-sm text-muted-foreground">{assignment.description || "No description provided."}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Due {fmtDate(assignment.dueDate)}
                </div>
              </div>

              <Button className="rounded-2xl" onClick={() => setSubmitAssignment(assignment)}>
                <Upload className="mr-2 h-4 w-4" />
                Submit Work
              </Button>
            </CardContent>
          </Card>
        ))
      )}

      <Dialog open={!!submitAssignment} onOpenChange={() => !submitting && setSubmitAssignment(null)}>
        <DialogContent className="rounded-[32px] sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle>Submit Assignment</DialogTitle>
            <DialogDescription>
              Upload your completed work for <span className="font-semibold text-foreground">{submitAssignment?.title}</span>.
            </DialogDescription>
          </DialogHeader>

          <label
            htmlFor="assignment-file"
            className="flex h-44 cursor-pointer flex-col items-center justify-center rounded-[28px] border-2 border-dashed border-border/70 p-6 text-center transition hover:border-brand-orange/40 hover:bg-brand-orange/5"
          >
            <FileText className="mb-3 h-8 w-8 text-brand-orange" />
            <p className="text-sm font-medium text-foreground">Click to choose a file</p>
            <p className="text-xs text-muted-foreground">PDF, image, or archive formats work well here.</p>
            <input id="assignment-file" type="file" className="hidden" onChange={handleFileSubmit} disabled={submitting} />
          </label>

          {submitting ? (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading your file...
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </DashboardContent>
  )
}

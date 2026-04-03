"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { DashboardContent } from "@/components/dashboard-content"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { assignmentApi, dashboardApi, gradeApi, type Assignment } from "@/services/api/client"
import { useCloudinaryUpload } from "@/hooks/use-cloudinary-upload"
import { Calendar, CheckCircle2, Clock, Eye, FileText, Loader2, Search, Upload } from "lucide-react"
import { toast } from "sonner"
import { TeacherAssignmentManager } from "@/features/assignments/components/TeacherAssignmentManager"
import { ChatImagePreview } from "@/components/chat-image-preview"

function fmtDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function isImageFile(filename: string): boolean {
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"]
  return imageExtensions.some((ext) => filename.toLowerCase().endsWith(ext))
}

function getImageMimeType(filename: string): string {
  if (filename.toLowerCase().endsWith(".png")) return "image/png"
  if (filename.toLowerCase().endsWith(".gif")) return "image/gif"
  if (filename.toLowerCase().endsWith(".webp")) return "image/webp"
  return "image/jpeg"
}

function getStatusBadgeVariant(status?: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status?.toLowerCase()) {
    case "graded":
    case "completed":
      return "default"
    case "submitted":
    case "pending":
      return "outline"
    case "overdue":
      return "destructive"
    default:
      return "secondary"
  }
}

export default function AssignmentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [userRole, setUserRole] = useState<string | null>(null)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitAssignment, setSubmitAssignment] = useState<Assignment | null>(null)
  const [viewAssignment, setViewAssignment] = useState<Assignment | null>(null)
  const [submissionComment, setSubmissionComment] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null)

  const { uploadFile } = useCloudinaryUpload()

  const loadAssignments = useCallback(async () => {
    try {
      setLoading(true)
      const [userResponse, assignmentResponse, gradesResponse, submissionsResponse] = await Promise.all([
        dashboardApi.getUser(),
        assignmentApi.getAssignments(),
        gradeApi.getMyGrades(),
        assignmentApi.getMySubmissions(),
      ])

      if (userResponse.success && userResponse.data) {
        setUserRole(userResponse.data.type)
      }

      if (assignmentResponse.success && assignmentResponse.data) {
        let enrichedAssignments = assignmentResponse.data

        const gradesMap = gradesResponse.success && gradesResponse.data
          ? new Map(gradesResponse.data.map((g) => [g.assignmentId, g]))
          : new Map()

        const submissionsMap = submissionsResponse.success && submissionsResponse.data
          ? new Map(submissionsResponse.data.map((s) => [s.assignmentId, s]))
          : new Map()

        enrichedAssignments = enrichedAssignments.map((a) => {
          const hasGrade = gradesMap.has(a.id)
          const hasSubmission = submissionsMap.has(a.id)
          const submission = submissionsMap.get(a.id)

          return {
            ...a,
            grade: gradesMap.get(a.id),
            submission: hasSubmission
              ? {
                  id: submission.id,
                  filePath: submission.filePath,
                  content: submission.content,
                  submittedAt: submission.submittedAt,
                }
              : undefined,
            status: hasGrade ? "graded" : hasSubmission ? "submitted" : a.status || "incomplete",
          }
        })

        setAssignments(enrichedAssignments)
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

  const { activeAssignments, previousAssignments } = useMemo(() => {
    const active = filteredAssignments.filter(
      (a) => a.status !== "graded" && a.status !== "completed"
    )
    const previous = filteredAssignments.filter(
      (a) => a.status === "graded" || a.status === "completed"
    )
    return { activeAssignments: active, previousAssignments: previous }
  }, [filteredAssignments])

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

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setSelectedFile(file)

    if (isImageFile(file.name)) {
      const url = URL.createObjectURL(file)
      setFilePreviewUrl(url)
    } else {
      setFilePreviewUrl(null)
    }
  }

  async function handleFileSubmit() {
    if (!selectedFile || !submitAssignment) return

    setSubmitting(true)
    const loadingToast = toast.loading("Uploading your assignment...")

    try {
      const fileUrl = await uploadFile(selectedFile)
      if (!fileUrl) {
        throw new Error("Upload failed")
      }

      const payload = {
        assignmentId: submitAssignment.id,
        content: submissionComment || `Submitted file: ${selectedFile.name}`,
        fileUrl,
      }

      const response = await assignmentApi.submitAssignment(payload)
      if (!response.success) {
        throw new Error(response.message || "Submission failed")
      }

      toast.success("Assignment submitted successfully", { id: loadingToast })
      setSubmitAssignment(null)
      setSelectedFile(null)
      setSubmissionComment("")
      setFilePreviewUrl(null)
      await loadAssignments()
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : "Submission failed", { id: loadingToast })
    } finally {
      setSubmitting(false)
    }
  }

  function renderAssignmentCard(assignment: Assignment, isPrevious: boolean = false) {
    return (
      <Card key={assignment.id} className={`border-border/60 ${isPrevious ? "opacity-80" : ""}`}>
        <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{assignment.course?.name || "General"}</Badge>
              <Badge variant={getStatusBadgeVariant(assignment.status)}>
                {assignment.status || "incomplete"}
              </Badge>
              {assignment.grade && (
                <Badge variant="default" className="bg-green-600 text-white">
                  Grade: {assignment.grade.grade}
                </Badge>
              )}
            </div>
            <div>
              <p className="font-semibold text-foreground">{assignment.title}</p>
              <p className="text-sm text-muted-foreground">
                {assignment.description || "No description provided."}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Due {fmtDate(assignment.dueDate)}
            </div>
          </div>

          <div className="flex gap-2 shrink-0">
            <Button
              variant="outline"
              className="rounded-2xl"
              onClick={() => setViewAssignment(assignment)}
            >
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </Button>
            {!assignment.submission && !isPrevious && (
              <Button
                className="rounded-2xl"
                onClick={() => setSubmitAssignment(assignment)}
              >
                <Upload className="mr-2 h-4 w-4" />
                Submit Work
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <DashboardContent className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Assignments</h1>
          <p className="text-muted-foreground">
            Submit coursework, track pending work, and upload files from one place.
          </p>
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

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading assignments...
        </div>
      ) : activeAssignments.length === 0 && previousAssignments.length === 0 ? (
        <Card className="border-dashed border-border/70">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No assignments matched your search.
          </CardContent>
        </Card>
      ) : (
        <>
          {activeAssignments.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-brand-orange" />
                <h2 className="text-lg font-semibold text-foreground">Active Assignments</h2>
              </div>
              {activeAssignments.map((assignment) => renderAssignmentCard(assignment))}
            </div>
          )}

          {previousAssignments.length > 0 && (
            <div className="space-y-4 mt-8">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <h2 className="text-lg font-semibold text-foreground">Previous Assignments</h2>
              </div>
              {previousAssignments.map((assignment) => renderAssignmentCard(assignment, true))}
            </div>
          )}
        </>
      )}

      <Dialog open={!!viewAssignment} onOpenChange={() => setViewAssignment(null)}>
        <DialogContent className="rounded-[32px] sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewAssignment?.title}</DialogTitle>
            <DialogDescription>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge variant="secondary">{viewAssignment?.course?.name || "General"}</Badge>
                {viewAssignment?.grade && (
                  <Badge variant="default" className="bg-green-600 text-white">
                    Grade: {viewAssignment.grade.grade}
                  </Badge>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <h4 className="text-sm font-medium mb-1">Description</h4>
              <p className="text-sm text-muted-foreground">
                {viewAssignment?.description || "No description provided."}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Due {fmtDate(viewAssignment?.dueDate || "")}
            </div>

            {viewAssignment?.file && (
              <div>
                <h4 className="text-sm font-medium mb-2">Attached File</h4>
                {isImageFile(viewAssignment.file) ? (
                  <ChatImagePreview
                    attachment={{
                      url: viewAssignment.file,
                      type: getImageMimeType(viewAssignment.file),
                      name: "Assignment File",
                    }}
                  />
                ) : (
                  <a
                    href={viewAssignment.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-brand-orange hover:underline flex items-center gap-1"
                  >
                    <FileText className="h-4 w-4" />
                    View Attachment
                  </a>
                )}
              </div>
            )}

            {viewAssignment?.submission && (
              <div>
                <h4 className="text-sm font-medium mb-2">Your Submission</h4>
                <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                  {viewAssignment.submission.content && (
                    <p className="text-sm text-muted-foreground">
                      {viewAssignment.submission.content}
                    </p>
                  )}
                  {viewAssignment.submission.filePath &&
                    isImageFile(viewAssignment.submission.filePath) && (
                      <ChatImagePreview
                        attachment={{
                          url: viewAssignment.submission.filePath,
                          type: getImageMimeType(viewAssignment.submission.filePath),
                          name: "Submitted File",
                        }}
                      />
                    )}
                  <p className="text-xs text-muted-foreground">
                    Submitted: {fmtDate(viewAssignment.submission.submittedAt)}
                  </p>
                </div>
              </div>
            )}

            {viewAssignment?.grade && (
              <div>
                <h4 className="text-sm font-medium mb-2">Grade Details</h4>
                <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-600 text-white">
                      {viewAssignment.grade.grade}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Graded by {viewAssignment.grade.gradedBy} on{" "}
                      {fmtDate(viewAssignment.grade.gradedAt)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!submitAssignment}
        onOpenChange={(open) => {
          if (!open && !submitting) {
            setSubmitAssignment(null)
            setSelectedFile(null)
            setSubmissionComment("")
            setFilePreviewUrl(null)
          }
        }}
      >
        <DialogContent className="rounded-[32px] sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle>Submit Assignment</DialogTitle>
            <DialogDescription>
              Upload your completed work for{" "}
              <span className="font-semibold text-foreground">
                {submitAssignment?.title}
              </span>
              .
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">
                Submission Comment (Optional)
              </label>
              <Textarea
                placeholder="Add any notes about your submission..."
                value={submissionComment}
                onChange={(e) => setSubmissionComment(e.target.value)}
                className="mt-2 rounded-xl"
                rows={3}
                disabled={submitting}
              />
            </div>

            <label
              htmlFor="assignment-file"
              className="flex h-36 cursor-pointer flex-col items-center justify-center rounded-[28px] border-2 border-dashed border-border/70 p-6 text-center transition hover:border-brand-orange/40 hover:bg-brand-orange/5"
            >
              <FileText className="mb-3 h-8 w-8 text-brand-orange" />
              <p className="text-sm font-medium text-foreground">Click to choose a file</p>
              {selectedFile && (
                <p className="text-xs text-muted-foreground mt-1">
                  Selected: {selectedFile.name}
                </p>
              )}
              {!selectedFile && (
                <p className="text-xs text-muted-foreground">
                  PDF, image, or archive formats work well here.
                </p>
              )}
              <input
                id="assignment-file"
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                disabled={submitting}
              />
            </label>

            {filePreviewUrl && selectedFile && (
              <ChatImagePreview
                attachment={{
                  url: filePreviewUrl,
                  type: getImageMimeType(selectedFile.name),
                  name: selectedFile.name,
                }}
              />
            )}

            {submitting ? (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading your file...
              </div>
            ) : (
              <Button
                className="w-full rounded-2xl"
                onClick={handleFileSubmit}
                disabled={!selectedFile}
              >
                <Upload className="mr-2 h-4 w-4" />
                Submit Assignment
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </DashboardContent>
  )
}

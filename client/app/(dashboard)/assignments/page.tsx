"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { DashboardContent } from "@/components/dashboard-content"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ChatImagePreview } from "@/components/chat-image-preview"
import { useCloudinaryUpload } from "@/hooks/use-cloudinary-upload"
import { getFileUrlBase, resolveApiFileUrl } from "@/lib/file-url"
import { assignmentApi, dashboardApi, type Assignment } from "@/services/api/client"
import { Calendar, Clock, Download, Eye, FileText, Loader2, RotateCcw, Search, Upload, X } from "lucide-react"
import { toast } from "sonner"
import { TeacherAssignmentManager } from "@/features/assignments/components/TeacherAssignmentManager"
import { TeacherGradingView } from "@/features/grading/components/TeacherGradingView"

type StudentAssignmentFilter = "all" | "pending" | "completed"
type StudentAssignmentStatus = "pending" | "submitted" | "completed" | "incomplete" | "overdue"

function fmtDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function isImageFile(filename: string) {
  const base = getFileUrlBase(filename)
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"]
  return imageExtensions.some((extension) => base.endsWith(extension))
}

function getImageMimeType(filename: string) {
  const base = getFileUrlBase(filename)
  if (base.endsWith(".png")) return "image/png"
  if (base.endsWith(".gif")) return "image/gif"
  if (base.endsWith(".webp")) return "image/webp"
  return "image/jpeg"
}

function getAssignmentStatus(assignment: Assignment): StudentAssignmentStatus {
  const reviewStatus = assignment.submission?.reviewStatus

  if (reviewStatus === "completed") return "completed"
  if (reviewStatus === "incomplete") return "incomplete"
  if (assignment.submission) return "submitted"

  const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null
  if (dueDate) {
    dueDate.setHours(23, 59, 59, 999)
    if (dueDate < new Date()) return "overdue"
  }

  return "pending"
}

function getStatusLabel(status: StudentAssignmentStatus) {
  switch (status) {
    case "completed":
      return "Completed"
    case "submitted":
      return "Awaiting Review"
    case "incomplete":
      return "Needs Resubmission"
    case "overdue":
      return "Overdue"
    default:
      return "Pending"
  }
}

function getStatusBadgeVariant(status: StudentAssignmentStatus): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "completed":
      return "default"
    case "submitted":
      return "outline"
    case "overdue":
      return "destructive"
    default:
      return "secondary"
  }
}

function canSubmitAssignment(assignment: Assignment) {
  return !assignment.submission || assignment.submission.reviewStatus === "incomplete"
}

export default function AssignmentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [userRole, setUserRole] = useState<string | null>(null)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [activeFilter, setActiveFilter] = useState<StudentAssignmentFilter>("pending")
  const [submitAssignmentTarget, setSubmitAssignmentTarget] = useState<Assignment | null>(null)
  const [viewAssignment, setViewAssignment] = useState<Assignment | null>(null)
  const [submissionComment, setSubmissionComment] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null)

  const { uploadFile } = useCloudinaryUpload()
  const assignmentFileUrl = resolveApiFileUrl(viewAssignment?.file)
  const submissionFileUrl = resolveApiFileUrl(viewAssignment?.submission?.filePath)

  const loadAssignments = useCallback(async () => {
    try {
      setLoading(true)
      const [userResponse, assignmentResponse, submissionsResponse] = await Promise.all([
        dashboardApi.getUser(),
        assignmentApi.getAssignments(),
        assignmentApi.getMySubmissions(),
      ])

      if (userResponse.success && userResponse.data) {
        setUserRole(userResponse.data.type)
      }

      if (assignmentResponse.success && assignmentResponse.data) {
        const submissions = submissionsResponse.success && submissionsResponse.data ? submissionsResponse.data : []
        const submissionsMap = new Map(submissions.map((submission) => [submission.assignmentId, submission]))

        setAssignments(
          assignmentResponse.data.map((assignment) => {
            const submission = submissionsMap.get(assignment.id)
            return {
              ...assignment,
              rewardPoints: assignment.rewardPoints ?? 0,
              submission,
              status: getAssignmentStatus({
                ...assignment,
                submission,
              }),
            }
          })
        )
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
    const query = searchQuery.trim().toLowerCase()

    return assignments.filter((assignment) => {
      const status = getAssignmentStatus(assignment)
      const matchesFilter =
        activeFilter === "all"
          ? true
          : activeFilter === "completed"
            ? status === "completed"
            : status !== "completed"

      if (!matchesFilter) return false
      if (!query) return true

      return (
        assignment.title.toLowerCase().includes(query) ||
        assignment.course?.name?.toLowerCase().includes(query) ||
        assignment.description?.toLowerCase().includes(query)
      )
    })
  }, [activeFilter, assignments, searchQuery])

  const counts = useMemo(
    () => ({
      all: assignments.length,
      pending: assignments.filter((assignment) => getAssignmentStatus(assignment) !== "completed").length,
      completed: assignments.filter((assignment) => getAssignmentStatus(assignment) === "completed").length,
    }),
    [assignments]
  )

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setSelectedFile(file)

    if (isImageFile(file.name)) {
      setFilePreviewUrl(URL.createObjectURL(file))
      return
    }

    setFilePreviewUrl(null)
  }

  async function handleFileSubmit() {
    if (!selectedFile || !submitAssignmentTarget) return

    setSubmitting(true)
    const loadingToast = toast.loading(
      submitAssignmentTarget.submission?.reviewStatus === "incomplete"
        ? "Uploading your updated submission..."
        : "Uploading your assignment..."
    )

    try {
      const fileUrl = await uploadFile(selectedFile, { folder: "assignments" })
      if (!fileUrl) {
        throw new Error("Upload failed")
      }

      const payload = {
        assignmentId: submitAssignmentTarget.id,
        content: submissionComment.trim() || `Submitted file: ${selectedFile.name}`,
        fileUrl,
      }

      const response = await assignmentApi.submitAssignment(payload)
      if (!response.success) {
        throw new Error(response.message || "Submission failed")
      }

      toast.success(
        submitAssignmentTarget.submission?.reviewStatus === "incomplete"
          ? "Assignment resubmitted successfully"
          : "Assignment submitted successfully",
        { id: loadingToast }
      )

      setSubmitAssignmentTarget(null)
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

  function openSubmitDrawer(assignment: Assignment) {
    setSubmitAssignmentTarget(assignment)
    setSelectedFile(null)
    setFilePreviewUrl(null)
    setSubmissionComment(assignment.submission?.reviewStatus === "incomplete" ? assignment.submission.reviewRemark ?? "" : "")
  }

  function renderAssignmentCard(assignment: Assignment) {
    const status = getAssignmentStatus(assignment)
    const canSubmit = canSubmitAssignment(assignment)

    return (
      <Card key={assignment.id} className="border-border/60">
        <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{assignment.course?.name || "General"}</Badge>
              <Badge variant={getStatusBadgeVariant(status)}>{getStatusLabel(status)}</Badge>
              <Badge variant="outline">
                {assignment.rewardPoints ?? 0} point{(assignment.rewardPoints ?? 0) === 1 ? "" : "s"}
              </Badge>
            </div>

            <div>
              <p className="font-semibold text-foreground">{assignment.title}</p>
              <p className="text-sm text-muted-foreground">
                {assignment.description || "No description provided."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                Due {fmtDate(assignment.dueDate)}
              </span>
              {assignment.submission?.submittedAt ? (
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  Submitted {fmtDate(assignment.submission.submittedAt)}
                </span>
              ) : null}
            </div>

            {assignment.submission?.reviewRemark ? (
              <div className="rounded-2xl border border-border/60 bg-muted/40 px-4 py-3 text-sm">
                <p className="mb-1 font-medium text-foreground">Teacher remark</p>
                <p className="text-muted-foreground">{assignment.submission.reviewRemark}</p>
              </div>
            ) : null}
          </div>

          <div className="flex shrink-0 gap-2">
            <Button variant="outline" className="rounded-2xl" onClick={() => setViewAssignment(assignment)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </Button>
            {canSubmit ? (
              <Button className="rounded-2xl" onClick={() => openSubmitDrawer(assignment)}>
                {assignment.submission?.reviewStatus === "incomplete" ? (
                  <RotateCcw className="mr-2 h-4 w-4" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                {assignment.submission?.reviewStatus === "incomplete" ? "Resubmit" : "Submit Work"}
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    )
  }

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
        <Tabs defaultValue="manage" className="flex-col space-y-6">
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Assignments</h1>
              <p className="text-muted-foreground">
                Create assignments, review uploaded work, and approve completed submissions.
              </p>
            </div>
            <TabsList>
              <TabsTrigger value="manage">Manage</TabsTrigger>
              <TabsTrigger value="review">Review</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="manage">
            <TeacherAssignmentManager />
          </TabsContent>
          <TabsContent value="review">
            <TeacherGradingView />
          </TabsContent>
        </Tabs>
      </DashboardContent>
    )
  }

  return (
    <DashboardContent className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Assignments</h1>
          <p className="text-muted-foreground">
            Submit classwork, track what is still pending, and see when a teacher has approved it.
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

      <Tabs value={activeFilter} onValueChange={(value) => setActiveFilter(value as StudentAssignmentFilter)} className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending ({counts.pending})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({counts.completed})</TabsTrigger>
          <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeFilter} className="space-y-4">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading assignments...
            </div>
          ) : filteredAssignments.length === 0 ? (
            <Card className="border-dashed border-border/70">
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                No assignments matched this filter.
              </CardContent>
            </Card>
          ) : (
            filteredAssignments.map((assignment) => renderAssignmentCard(assignment))
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!viewAssignment} onOpenChange={() => setViewAssignment(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[32px] sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{viewAssignment?.title}</DialogTitle>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{viewAssignment?.course?.name || "General"}</Badge>
              {viewAssignment ? (
                <>
                  <Badge variant={getStatusBadgeVariant(getAssignmentStatus(viewAssignment))}>
                    {getStatusLabel(getAssignmentStatus(viewAssignment))}
                  </Badge>
                  <Badge variant="outline">
                    {viewAssignment.rewardPoints ?? 0} point{(viewAssignment.rewardPoints ?? 0) === 1 ? "" : "s"}
                  </Badge>
                </>
              ) : null}
            </div>
            <DialogDescription>
              Review the task details, your uploaded file, and the teacher&apos;s latest feedback.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-5">
            <div>
              <h4 className="mb-1 text-sm font-medium">Description</h4>
              <p className="text-sm text-muted-foreground">
                {viewAssignment?.description || "No description provided."}
              </p>
            </div>

            {viewAssignment?.dueDate ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Due {fmtDate(viewAssignment.dueDate)}
              </div>
            ) : null}

            {viewAssignment?.file ? (
              <div>
                <h4 className="mb-2 text-sm font-medium">Attached File</h4>
                {isImageFile(assignmentFileUrl) ? (
                  <ChatImagePreview
                    attachment={{
                      url: assignmentFileUrl,
                      type: getImageMimeType(assignmentFileUrl),
                      name: "Assignment File",
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-between rounded-md bg-muted/50 p-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="truncate text-sm">
                        {assignmentFileUrl.split("/").pop()?.split("?")[0] || "Assignment file"}
                      </span>
                    </div>
                    <a href={assignmentFileUrl} download target="_blank" rel="noopener noreferrer" className="shrink-0">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Download className="h-4 w-4" />
                      </Button>
                    </a>
                  </div>
                )}
              </div>
            ) : null}

            {viewAssignment?.submission ? (
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Your Submission</h4>
                <div className="space-y-3 rounded-2xl bg-muted/50 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={getStatusBadgeVariant(getAssignmentStatus(viewAssignment))}>
                      {getStatusLabel(getAssignmentStatus(viewAssignment))}
                    </Badge>
                    {viewAssignment.submission.reviewStatus === "completed" ? (
                      <Badge className="bg-green-600 text-white">
                        +{viewAssignment.rewardPoints ?? 0} point{(viewAssignment.rewardPoints ?? 0) === 1 ? "" : "s"}
                      </Badge>
                    ) : null}
                  </div>

                  {viewAssignment.submission.content ? (
                    <p className="text-sm text-muted-foreground">{viewAssignment.submission.content}</p>
                  ) : null}

                  {viewAssignment.submission.filePath ? (
                    isImageFile(submissionFileUrl) ? (
                      <ChatImagePreview
                        attachment={{
                          url: submissionFileUrl,
                          type: getImageMimeType(submissionFileUrl),
                          name: "Submitted File",
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-between rounded-md bg-background/50 p-2">
                        <div className="flex min-w-0 items-center gap-2">
                          <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <span className="truncate text-sm">
                            {submissionFileUrl.split("/").pop()?.split("?")[0] || "Submitted file"}
                          </span>
                        </div>
                        <a href={submissionFileUrl} target="_blank" rel="noopener noreferrer" className="shrink-0">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Download className="h-4 w-4" />
                          </Button>
                        </a>
                      </div>
                    )
                  ) : null}

                  <p className="text-xs text-muted-foreground">
                    Submitted: {fmtDate(viewAssignment.submission.submittedAt)}
                  </p>

                  {viewAssignment.submission.reviewRemark ? (
                    <div className="rounded-xl border border-border/60 bg-background/50 px-3 py-3">
                      <p className="mb-1 text-sm font-medium text-foreground">Teacher remark</p>
                      <p className="text-sm text-muted-foreground">{viewAssignment.submission.reviewRemark}</p>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      <Drawer
        direction="right"
        open={!!submitAssignmentTarget}
        onOpenChange={(open) => {
          if (!open && !submitting) {
            setSubmitAssignmentTarget(null)
            setSelectedFile(null)
            setSubmissionComment("")
            setFilePreviewUrl(null)
          }
        }}
      >
        <DrawerContent className="p-0 data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-xl before:inset-0 before:rounded-none before:border-white/10 before:bg-background sm:p-0 sm:before:rounded-l-[2rem]">
          <div className="flex h-dvh max-h-dvh flex-col overflow-hidden">
            <DrawerHeader className="border-b border-border/60 p-6 text-left">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <DrawerTitle className="text-xl font-bold">
                    {submitAssignmentTarget?.submission?.reviewStatus === "incomplete" ? "Resubmit Assignment" : "Submit Assignment"}
                  </DrawerTitle>
                  <DrawerDescription>
                    Upload your work for{" "}
                    <span className="font-semibold text-foreground">{submitAssignmentTarget?.title}</span>.
                  </DrawerDescription>
                </div>
                <DrawerClose asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <X className="h-4 w-4" />
                  </Button>
                </DrawerClose>
              </div>
            </DrawerHeader>

            <div className="flex-1 space-y-4 overflow-y-auto p-6">
              {submitAssignmentTarget?.submission?.reviewRemark ? (
                <div className="rounded-2xl border border-orange-200 bg-orange-50/60 p-4 text-sm dark:border-orange-900 dark:bg-orange-950/20">
                  <p className="mb-1 font-medium text-foreground">Teacher remark</p>
                  <p className="text-muted-foreground">{submitAssignmentTarget.submission.reviewRemark}</p>
                </div>
              ) : null}

              <div>
                <label className="text-sm font-medium">Submission Note (Optional)</label>
                <Textarea
                  placeholder="Add a short note for the teacher..."
                  value={submissionComment}
                  onChange={(event) => setSubmissionComment(event.target.value)}
                  className="mt-2 rounded-xl"
                  rows={4}
                  disabled={submitting}
                />
              </div>

              <label
                htmlFor="assignment-file"
                className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-[28px] border-2 border-dashed border-border/70 p-6 text-center transition hover:border-brand-orange/40 hover:bg-brand-orange/5"
              >
                <FileText className="mb-3 h-8 w-8 text-brand-orange" />
                <p className="text-sm font-medium text-foreground">Click to choose a file</p>
                {selectedFile ? (
                  <p className="mt-1 text-xs text-muted-foreground">Selected: {selectedFile.name}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">PDF, image, document, or archive formats all work here.</p>
                )}
                <input id="assignment-file" type="file" className="hidden" onChange={handleFileSelect} disabled={submitting} />
              </label>

              {filePreviewUrl && selectedFile ? (
                <ChatImagePreview
                  attachment={{
                    url: filePreviewUrl,
                    type: getImageMimeType(selectedFile.name),
                    name: selectedFile.name,
                  }}
                />
              ) : null}

              {submitting ? (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading your file...
                </div>
              ) : null}
            </div>

            <DrawerFooter className="border-t border-border/60 bg-background/95 p-6 sm:flex-row sm:justify-end">
              <DrawerClose asChild>
                <Button variant="ghost" disabled={submitting}>
                  Cancel
                </Button>
              </DrawerClose>
              <Button className="rounded-2xl" onClick={handleFileSubmit} disabled={!selectedFile || submitting}>
                {submitAssignmentTarget?.submission?.reviewStatus === "incomplete" ? (
                  <RotateCcw className="mr-2 h-4 w-4" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                {submitting
                  ? "Submitting..."
                  : submitAssignmentTarget?.submission?.reviewStatus === "incomplete"
                    ? "Resubmit Assignment"
                    : "Submit Assignment"}
              </Button>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </DashboardContent>
  )
}

"use client"

import Image from "next/image"
import { useState } from "react"
import { BookOpen, Loader2, Pencil, Plus } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { SectionHeader } from "@/features/admin/components/SectionHeader"
import { getFileUrlBase, resolveApiFileUrl } from "@/lib/file-url"
import { AssignmentSelector } from "./AssignmentSelector"
import { AssignmentForm } from "./AssignmentForm"
import { SubmissionFilters } from "./SubmissionFilters"
import { SubmissionCard } from "./SubmissionCard"
import { GradeDialog } from "./GradeDialog"
import { useGrading, type AssignmentFormData } from "../hooks/use-grading"
import type { ApiAssignment, ApiSubmission } from "@/lib/types/api"

function isImageFile(filename: string) {
  const base = getFileUrlBase(filename)
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"]
  return imageExtensions.some((extension) => base.endsWith(extension))
}

function isVideoFile(filename: string) {
  const base = getFileUrlBase(filename)
  const videoExtensions = [".mp4", ".webm", ".ogg", ".mov"]
  return videoExtensions.some((extension) => base.endsWith(extension))
}

function isPdfFile(filename: string) {
  return getFileUrlBase(filename).endsWith(".pdf")
}

function canPreviewInline(filename: string) {
  return isImageFile(filename) || isVideoFile(filename) || isPdfFile(filename)
}

export function TeacherGradingView() {
  const grading = useGrading()

  const [formOpen, setFormOpen] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState<ApiAssignment | null>(null)
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false)
  const [reviewTarget, setReviewTarget] = useState<{
    studentName: string
    submission: ApiSubmission
  } | null>(null)
  const [viewFileUrl, setViewFileUrl] = useState<string | null>(null)

  async function handleCreateAssignment(data: AssignmentFormData) {
    return grading.createAssignment(data)
  }

  async function handleUpdateAssignment(data: AssignmentFormData) {
    if (!editingAssignment) return false
    return grading.updateAssignment(editingAssignment.id, data)
  }

  function openCreateForm() {
    setEditingAssignment(null)
    setFormOpen(true)
  }

  function openEditForm(assignment: ApiAssignment) {
    setEditingAssignment(assignment)
    setFormOpen(true)
  }

  function openReviewDialog(submission: ApiSubmission) {
    setReviewTarget({
      studentName: submission.user?.userDetails
        ? `${submission.user.userDetails.firstName ?? ""} ${submission.user.userDetails.lastName ?? ""}`.trim() || submission.user.username
        : submission.user?.username ?? submission.userId,
      submission,
    })
    setGradeDialogOpen(true)
  }

  async function handleReviewSubmit(payload: { reviewStatus: "completed" | "incomplete"; reviewRemark?: string }) {
    if (!reviewTarget) return false
    return grading.reviewSubmission(reviewTarget.submission.id, payload)
  }

  function handleViewFile(fileUrl: string) {
    const resolvedFileUrl = resolveApiFileUrl(fileUrl)

    if (!resolvedFileUrl) {
      toast.error("Submission file URL is missing")
      return
    }

    if (canPreviewInline(resolvedFileUrl)) {
      setViewFileUrl(resolvedFileUrl)
      return
    }

    window.open(resolvedFileUrl, "_blank", "noopener,noreferrer")
  }

  if (grading.loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading review data...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Submission Review"
        subtitle="Check student uploads, mark work complete or incomplete, and send feedback back to the student."
        action={openCreateForm}
        actionLabel="New Assignment"
      />

      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Select Assignment</label>
        <AssignmentSelector
          assignments={grading.assignments}
          value={grading.selectedAssignmentId}
          onChange={grading.handleSelectAssignment}
          loading={grading.loading}
        />
      </div>

      {grading.loadingSubs ? (
        <div className="flex justify-center py-8">
          <Loader2 className="size-6 animate-spin text-muted-foreground/50" />
        </div>
      ) : grading.selectedAssignment ? (
        <>
          <Card className="border-border/60">
            <CardContent className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold text-foreground">{grading.selectedAssignment.title}</h3>
                  <Badge variant="secondary">{grading.selectedAssignment.course?.name || "General"}</Badge>
                  <Badge variant="outline">
                    {grading.selectedAssignment.rewardPoints ?? 0} point{(grading.selectedAssignment.rewardPoints ?? 0) === 1 ? "" : "s"}
                  </Badge>
                </div>
                {grading.selectedAssignment.description ? (
                  <p className="text-sm text-muted-foreground">{grading.selectedAssignment.description}</p>
                ) : null}
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>{grading.selectedAssignmentSummary?.reviewQueueCount ?? 0} awaiting review</span>
                  <span>{grading.selectedAssignmentSummary?.completedCount ?? 0} completed</span>
                  <span>{grading.selectedAssignmentSummary?.incompleteCount ?? 0} need rework</span>
                  <span>{grading.selectedAssignmentSummary?.lateCount ?? 0} late</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => openEditForm(grading.selectedAssignment!)}>
                  <Pencil className="size-3.5" />
                  Edit Assignment
                </Button>
                <Button size="sm" className="gap-1.5 bg-brand-purple hover:bg-brand-purple/90" onClick={openCreateForm}>
                  <Plus className="size-3.5" />
                  New Assignment
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <SubmissionFilters counts={grading.counts} active={grading.activeFilter} onChange={grading.setActiveFilter} />
          </div>

          <div className="space-y-3">
            {grading.filteredSubmissions.map((submission) => {
              const fullName = submission.user?.userDetails
                ? `${submission.user.userDetails.firstName ?? ""} ${submission.user.userDetails.lastName ?? ""}`.trim()
                : ""

              return (
                <SubmissionCard
                  key={submission.id}
                  student={{
                    id: submission.userId,
                    username: fullName || submission.user?.username || submission.userId,
                  }}
                  submission={submission}
                  assignment={grading.selectedAssignment!}
                  onViewFile={() => handleViewFile(submission.filePath)}
                  onReview={() => openReviewDialog(submission)}
                />
              )
            })}

            {grading.filteredNotSubmitted.map((student, index) => (
              <SubmissionCard
                key={`not-submitted-${student.id || student.username || index}`}
                student={student}
                assignment={grading.selectedAssignment!}
                onViewFile={() => {}}
                onReview={() => {}}
              />
            ))}

            {grading.filteredSubmissions.length === 0 && grading.filteredNotSubmitted.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <BookOpen className="mb-2 size-8 opacity-40" />
                <p className="text-sm">No submissions match the selected filter.</p>
              </div>
            ) : null}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <BookOpen className="mb-2 size-8 opacity-40" />
          <p className="text-sm">Select an assignment to review student submissions.</p>
        </div>
      )}

      <AssignmentForm
        key={`${formOpen ? "open" : "closed"}:${editingAssignment?.id ?? "new"}`}
        open={formOpen}
        onOpenChange={setFormOpen}
        courses={grading.courses}
        assignment={editingAssignment}
        onSubmit={editingAssignment ? handleUpdateAssignment : handleCreateAssignment}
        submitting={grading.submitting}
      />

      {reviewTarget ? (
        <GradeDialog
          key={`${gradeDialogOpen ? "open" : "closed"}:${reviewTarget.submission.id}`}
          open={gradeDialogOpen}
          onOpenChange={setGradeDialogOpen}
          studentName={reviewTarget.studentName}
          existingStatus={reviewTarget.submission.reviewStatus}
          existingRemark={reviewTarget.submission.reviewRemark}
          onSubmit={handleReviewSubmit}
          submitting={grading.submitting}
        />
      ) : null}

      {viewFileUrl ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setViewFileUrl(null)}>
          <div className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-2xl bg-background p-4" onClick={(event) => event.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">Submitted File</h3>
              <Button variant="ghost" size="sm" onClick={() => setViewFileUrl(null)}>
                Close
              </Button>
            </div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Button asChild variant="outline" size="sm">
                <a href={viewFileUrl} target="_blank" rel="noopener noreferrer">
                  Open Original
                </a>
              </Button>
              <Button asChild variant="outline" size="sm">
                <a href={viewFileUrl} download>
                  Download
                </a>
              </Button>
            </div>
            {isImageFile(viewFileUrl) ? (
              <Image
                src={viewFileUrl}
                alt="Submission"
                width={1200}
                height={900}
                unoptimized
                className="h-auto w-full rounded-lg"
              />
            ) : isVideoFile(viewFileUrl) ? (
              <video
                src={viewFileUrl}
                controls
                className="h-auto max-h-[70vh] w-full rounded-lg border bg-black"
              />
            ) : isPdfFile(viewFileUrl) ? (
              <iframe src={viewFileUrl} className="h-[70vh] w-full rounded-lg border" title="Submitted file" />
            ) : (
              <div className="flex min-h-[240px] flex-col items-center justify-center rounded-lg border border-dashed text-center text-sm text-muted-foreground">
                Inline preview is not available for this file type.
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}

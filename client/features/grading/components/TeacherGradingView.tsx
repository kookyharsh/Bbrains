"use client"

import { useState } from "react"
import { Loader2, BookOpen, Plus, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SectionHeader } from "@/features/admin/components/SectionHeader"
import { AssignmentSelector } from "./AssignmentSelector"
import { AssignmentForm } from "./AssignmentForm"
import { SubmissionFilters } from "./SubmissionFilters"
import { SubmissionCard } from "./SubmissionCard"
import { GradeDialog } from "./GradeDialog"
import { useGrading, type FilterType, type AssignmentFormData } from "../hooks/use-grading"
import type { ApiAssignment } from "@/lib/types/api"

function isImageFile(filename: string): boolean {
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"]
  return imageExtensions.some((ext) => filename.toLowerCase().endsWith(ext))
}

export function TeacherGradingView() {
  const grading = useGrading()

  const [formOpen, setFormOpen] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState<ApiAssignment | null>(null)
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false)
  const [gradingTarget, setGradingTarget] = useState<{
    userId: string
    username: string
    existingGrade?: string
    existingGradeId?: number
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

  function openGradeDialog(userId: string, username: string) {
    const existingGrade = grading.gradeMap.get(userId)
    setGradingTarget({
      userId,
      username,
      existingGrade: existingGrade?.grade,
      existingGradeId: existingGrade?.id,
    })
    setGradeDialogOpen(true)
  }

  async function handleGradeSubmit(gradeValue: string) {
    if (!gradingTarget || !grading.selectedAssignment) return false

    if (gradingTarget.existingGradeId) {
      return grading.updateGrade(gradingTarget.existingGradeId, gradeValue)
    }

    return grading.submitGrade(
      gradingTarget.userId,
      grading.selectedAssignment.id,
      gradeValue
    )
  }

  function handleViewFile(filePath: string) {
    setViewFileUrl(filePath)
  }

  if (grading.loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading grading data...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Grading"
        subtitle="View submissions and assign grades"
        action={openCreateForm}
        actionLabel="New Assignment"
      />

      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">
          Select Assignment
        </label>
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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <SubmissionFilters
              counts={grading.counts}
              active={grading.activeFilter}
              onChange={(f) => grading.setActiveFilter(f)}
            />
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 shrink-0"
              onClick={() => openEditForm(grading.selectedAssignment!)}
            >
              <Pencil className="size-3.5" />
              Edit Assignment
            </Button>
          </div>

          <div className="space-y-3">
            {grading.filteredSubmissions.map((submission) => {
              const student = {
                id: submission.userId,
                username: submission.user?.username ?? submission.userId,
              }
              const grade = grading.gradeMap.get(submission.userId)
              return (
                <SubmissionCard
                  key={submission.id}
                  student={student}
                  submission={submission}
                  assignment={grading.selectedAssignment!}
                  grade={grade}
                  onViewFile={() => handleViewFile(submission.filePath)}
                  onGrade={() => openGradeDialog(student.id, student.username)}
                />
              )
            })}

            {grading.filteredNotSubmitted.map((student, index) => (
              <SubmissionCard
                key={`not-submitted-${student.id}-${index}`}
                student={student}
                assignment={grading.selectedAssignment!}
                onViewFile={() => {}}
                onGrade={() => openGradeDialog(student.id, student.username)}
              />
            ))}

            {grading.filteredSubmissions.length === 0 &&
              grading.filteredNotSubmitted.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <BookOpen className="size-8 mb-2 opacity-40" />
                  <p className="text-sm">No submissions match the selected filter</p>
                </div>
              )}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <BookOpen className="size-8 mb-2 opacity-40" />
          <p className="text-sm">Select an assignment to view submissions</p>
        </div>
      )}

      <AssignmentForm
        open={formOpen}
        onOpenChange={setFormOpen}
        courses={grading.courses}
        assignment={editingAssignment}
        onSubmit={editingAssignment ? handleUpdateAssignment : handleCreateAssignment}
        submitting={grading.submitting}
      />

      {gradingTarget && (
        <GradeDialog
          open={gradeDialogOpen}
          onOpenChange={setGradeDialogOpen}
          studentName={gradingTarget.username}
          existingGrade={gradingTarget.existingGrade}
          onSubmit={handleGradeSubmit}
          submitting={grading.submitting}
        />
      )}

      {viewFileUrl && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setViewFileUrl(null)}>
          <div className="bg-background rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-auto p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Submitted File</h3>
              <Button variant="ghost" size="sm" onClick={() => setViewFileUrl(null)}>
                Close
              </Button>
            </div>
            {isImageFile(viewFileUrl) ? (
              <img src={viewFileUrl} alt="Submission" className="w-full rounded-lg" />
            ) : (
              <iframe
                src={viewFileUrl}
                className="w-full h-[70vh] rounded-lg border"
                title="Submitted file"
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

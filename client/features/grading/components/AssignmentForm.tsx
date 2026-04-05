"use client"

import { useState } from "react"
import { Loader2, Camera } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useCloudinaryUpload } from "@/hooks/use-cloudinary-upload"
import type { ApiAssignment } from "@/lib/types/api"
import type { AssessmentCourseOption } from "@/services/api/client"

interface AssignmentFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  courses: AssessmentCourseOption[]
  assignment?: ApiAssignment | null
  onSubmit: (data: {
    title: string
    description: string
    courseId: string
    dueDate: string
    file: string
    rewardPoints: string
  }) => Promise<boolean>
  submitting: boolean
}

export function AssignmentForm({
  open,
  onOpenChange,
  courses,
  assignment,
  onSubmit,
  submitting,
}: AssignmentFormProps) {
  const isEditing = !!assignment
  const getInitialFormState = () => ({
    title: assignment?.title ?? "",
    description: assignment?.description ?? "",
    courseId: String(assignment?.courseId ?? ""),
    dueDate: assignment?.dueDate?.slice(0, 10) ?? "",
    file: assignment?.file ?? "",
    rewardPoints: String(assignment?.rewardPoints ?? 0),
  })

  const [title, setTitle] = useState(() => getInitialFormState().title)
  const [description, setDescription] = useState(() => getInitialFormState().description)
  const [courseId, setCourseId] = useState(() => getInitialFormState().courseId)
  const [dueDate, setDueDate] = useState(() => getInitialFormState().dueDate)
  const [file, setFile] = useState(() => getInitialFormState().file)
  const [rewardPoints, setRewardPoints] = useState(() => getInitialFormState().rewardPoints)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { uploadFile, isUploading } = useCloudinaryUpload()

  function resetForm() {
    const nextState = getInitialFormState()
    setTitle(nextState.title)
    setDescription(nextState.description)
    setCourseId(nextState.courseId)
    setDueDate(nextState.dueDate)
    setFile(nextState.file)
    setRewardPoints(nextState.rewardPoints)
    setErrors({})
  }

  function handleOpenChange(open: boolean) {
    if (!open) resetForm()
    onOpenChange(open)
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) return

    try {
      const url = await uploadFile(selectedFile, { folder: "assignments" })
      if (url) {
        setFile(url)
        toast.success("File uploaded successfully")
      } else {
        toast.error("Upload failed")
      }
    } catch {
      toast.error("Upload failed")
    }
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {}
    if (!title.trim()) newErrors.title = "Title is required"
    if (!courseId) newErrors.courseId = "Course is required"
    if (Number(rewardPoints || 0) < 0) newErrors.rewardPoints = "Reward points cannot be negative"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return

    const success = await onSubmit({
      title: title.trim(),
      description: description.trim(),
      courseId,
      dueDate,
      file,
      rewardPoints,
    })

    if (success) {
      handleOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {isEditing ? "Edit Assignment" : "Create Assignment"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the assignment details below."
              : "Fill in the details to create a new assignment."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="assignment-title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="assignment-title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                if (errors.title) setErrors((prev) => ({ ...prev, title: "" }))
              }}
              placeholder="Assignment title"
              className={errors.title ? "border-destructive" : ""}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignment-description">Description</Label>
            <Textarea
              id="assignment-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignment-course">
              Course <span className="text-destructive">*</span>
            </Label>
            <select
              id="assignment-course"
              value={courseId}
              onChange={(e) => {
                setCourseId(e.target.value)
                if (errors.courseId) setErrors((prev) => ({ ...prev, courseId: "" }))
              }}
              className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                errors.courseId ? "border-destructive" : ""
              }`}
            >
              <option value="">Select class...</option>
              {courses.map((course) => (
                <option key={course.id} value={String(course.id)}>
                  {course.name}
                  {course.standard ? ` (${course.standard})` : ""}
                </option>
              ))}
            </select>
            {errors.courseId && (
              <p className="text-xs text-destructive">{errors.courseId}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignment-due-date">Due Date</Label>
            <Input
              id="assignment-due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignment-reward-points">Reward Points</Label>
            <Input
              id="assignment-reward-points"
              type="number"
              min={0}
              value={rewardPoints}
              onChange={(e) => {
                setRewardPoints(e.target.value)
                if (errors.rewardPoints) setErrors((prev) => ({ ...prev, rewardPoints: "" }))
              }}
              placeholder="0"
              className={errors.rewardPoints ? "border-destructive" : ""}
            />
            {errors.rewardPoints ? (
              <p className="text-xs text-destructive">{errors.rewardPoints}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>Attachment (Optional)</Label>
            <div className="flex items-center gap-4">
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-border/40 bg-muted px-4 py-2 transition-colors hover:bg-muted/80">
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
                <span className="text-xs font-medium">
                  {file ? "Change File" : "Upload File"}
                </span>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
              </label>
              {file && (
                <span className="text-xs font-semibold text-brand-purple">
                  File attached
                </span>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => handleOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || isUploading}
            className="bg-brand-purple hover:bg-brand-purple/90 text-white"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? "Updating..." : "Creating..."}
              </>
            ) : isEditing ? (
              "Update Assignment"
            ) : (
              "Create Assignment"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

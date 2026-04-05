"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface GradeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  studentName: string
  existingStatus?: "completed" | "incomplete" | "submitted"
  existingRemark?: string | null
  onSubmit: (payload: { reviewStatus: "completed" | "incomplete"; reviewRemark?: string }) => Promise<boolean>
  submitting: boolean
}

export function GradeDialog({
  open,
  onOpenChange,
  studentName,
  existingStatus,
  existingRemark,
  onSubmit,
  submitting,
}: GradeDialogProps) {
  const [reviewStatus, setReviewStatus] = useState<"completed" | "incomplete">(
    () => (existingStatus === "incomplete" ? "incomplete" : "completed")
  )
  const [reviewRemark, setReviewRemark] = useState(() => existingRemark ?? "")

  async function handleSubmit() {
    const success = await onSubmit({
      reviewStatus,
      reviewRemark: reviewRemark.trim() || undefined,
    })

    if (success) {
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Review Submission</DialogTitle>
          <DialogDescription>
            Mark {studentName}&apos;s submission as completed or incomplete and leave an optional remark.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="review-status">Review Status</Label>
            <select
              id="review-status"
              value={reviewStatus}
              onChange={(event) => setReviewStatus(event.target.value as "completed" | "incomplete")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="completed">Completed</option>
              <option value="incomplete">Incomplete</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="review-remark">Remark (Optional)</Label>
            <Textarea
              id="review-remark"
              value={reviewRemark}
              onChange={(event) => setReviewRemark(event.target.value)}
              placeholder={
                reviewStatus === "completed"
                  ? "Nice work. Add any note the student should see."
                  : "Explain what needs to be fixed before resubmitting."
              }
              rows={4}
              maxLength={255}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-brand-purple text-white hover:bg-brand-purple/90"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Review"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

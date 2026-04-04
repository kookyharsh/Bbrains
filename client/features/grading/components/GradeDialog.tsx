"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  existingGrade?: string
  onSubmit: (grade: string) => Promise<boolean>
  submitting: boolean
}

export function GradeDialog({
  open,
  onOpenChange,
  studentName,
  existingGrade,
  onSubmit,
  submitting,
}: GradeDialogProps) {
  const [grade, setGrade] = useState(existingGrade ?? "")
  const [error, setError] = useState("")
  const isEditing = !!existingGrade

  useEffect(() => {
    setGrade(existingGrade ?? "")
    setError("")
  }, [existingGrade, open])

  function validate(): boolean {
    if (!grade.trim()) {
      setError("Grade is required")
      return false
    }
    setError("")
    return true
  }

  async function handleSubmit() {
    if (!validate()) return
    const success = await onSubmit(grade.trim())
    if (success) {
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {isEditing ? "Edit Grade" : "Assign Grade"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? `Update grade for ${studentName}.`
              : `Assign a grade to ${studentName}.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="grade-input">
              Grade <span className="text-destructive">*</span>
            </Label>
            <Input
              id="grade-input"
              value={grade}
              onChange={(e) => {
                setGrade(e.target.value)
                if (error) setError("")
              }}
              placeholder="e.g. A+, B, 85, Pass"
              className={error ? "border-destructive" : ""}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !submitting) {
                  void handleSubmit()
                }
              }}
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-brand-purple hover:bg-brand-purple/90 text-white"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : isEditing ? (
              "Update Grade"
            ) : (
              "Assign Grade"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

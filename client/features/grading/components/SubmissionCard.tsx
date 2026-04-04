"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { FileText, Award, Eye, Clock, AlertTriangle, XCircle, CheckCircle } from "lucide-react"
import type { ApiSubmission, ApiGrade, ApiAssignment } from "@/lib/types/api"

function fmtDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function getInitials(username: string) {
  if (!username) return "?"
  return username
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

interface SubmissionCardProps {
  student: { id: string; username: string }
  submission?: ApiSubmission
  assignment: ApiAssignment
  grade?: ApiGrade
  onViewFile: () => void
  onGrade: () => void
}

export function SubmissionCard({
  student,
  submission,
  assignment,
  grade,
  onViewFile,
  onGrade,
}: SubmissionCardProps) {
  const hasSubmitted = !!submission
  const isLateSubmission =
    hasSubmitted &&
    assignment.dueDate &&
    new Date(submission.submittedAt) > new Date(assignment.dueDate)

  let statusBadge: React.ReactNode
  if (!hasSubmitted) {
    statusBadge = (
      <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50 dark:bg-red-950/30">
        <XCircle className="mr-1 size-3" />
        Not Submitted
      </Badge>
    )
  } else if (isLateSubmission) {
    statusBadge = (
      <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-950/30">
        <AlertTriangle className="mr-1 size-3" />
        Submitted Late
      </Badge>
    )
  } else {
    statusBadge = (
      <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 dark:bg-green-950/30">
        <CheckCircle className="mr-1 size-3" />
        Submitted
      </Badge>
    )
  }

  return (
    <Card className="border-border/60">
      <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <Avatar className="size-10 shrink-0">
            <AvatarFallback className="bg-brand-purple/10 text-brand-purple text-sm font-semibold">
              {getInitials(student.username)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0 space-y-1">
            <p className="font-semibold text-foreground truncate">{student.username}</p>

            <div className="flex flex-wrap items-center gap-2">
              {statusBadge}
              {grade && (
                <Badge className="bg-green-600 text-white">
                  Grade: {grade.grade}
                </Badge>
              )}
            </div>

            {hasSubmitted && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="size-3" />
                Submitted {fmtDate(submission.submittedAt)}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 sm:flex-col sm:items-end">
          {hasSubmitted && submission.filePath && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={onViewFile}
            >
              <Eye className="size-3.5" />
              View File
              <FileText className="size-3.5" />
            </Button>
          )}
          <Button
            variant={grade ? "outline" : "default"}
            size="sm"
            className={cn(
              "gap-1.5",
              !grade && "bg-brand-purple hover:bg-brand-purple/90"
            )}
            onClick={onGrade}
          >
            <Award className="size-3.5" />
            {grade ? "Edit Grade" : "Mark as Graded"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

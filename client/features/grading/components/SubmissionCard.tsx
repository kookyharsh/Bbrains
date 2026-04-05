"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { AlertTriangle, CheckCircle, ClipboardCheck, Eye, FileText, MessageSquareMore, RotateCcw, XCircle } from "lucide-react"
import type { ApiAssignment, ApiSubmission } from "@/lib/types/api"

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
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

interface SubmissionCardProps {
  student: { id: string; username: string }
  submission?: ApiSubmission
  assignment: ApiAssignment
  onViewFile: () => void
  onReview: () => void
}

export function SubmissionCard({
  student,
  submission,
  assignment,
  onViewFile,
  onReview,
}: SubmissionCardProps) {
  const hasSubmitted = Boolean(submission)
  const isLateSubmission =
    hasSubmitted &&
    Boolean(assignment.dueDate) &&
    new Date(submission!.submittedAt) > new Date(assignment.dueDate)

  const reviewStatus = submission?.reviewStatus ?? "submitted"

  let statusBadge: ReactNode
  if (!hasSubmitted) {
    statusBadge = (
      <Badge variant="outline" className="border-red-200 bg-red-50 text-red-600 dark:bg-red-950/30">
        <XCircle className="mr-1 size-3" />
        Not Submitted
      </Badge>
    )
  } else if (reviewStatus === "completed") {
    statusBadge = (
      <Badge variant="outline" className="border-green-200 bg-green-50 text-green-600 dark:bg-green-950/30">
        <CheckCircle className="mr-1 size-3" />
        Completed
      </Badge>
    )
  } else if (reviewStatus === "incomplete") {
    statusBadge = (
      <Badge variant="outline" className="border-orange-200 bg-orange-50 text-orange-600 dark:bg-orange-950/30">
        <RotateCcw className="mr-1 size-3" />
        Needs Rework
      </Badge>
    )
  } else {
    statusBadge = (
      <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950/30">
        <ClipboardCheck className="mr-1 size-3" />
        Awaiting Review
      </Badge>
    )
  }

  return (
    <Card className="border-border/60">
      <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <Avatar className="size-10 shrink-0">
            <AvatarFallback className="bg-brand-purple/10 text-sm font-semibold text-brand-purple">
              {getInitials(student.username)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate font-semibold text-foreground">{student.username}</p>
              {statusBadge}
              {isLateSubmission && (
                <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-600 dark:bg-amber-950/30">
                  <AlertTriangle className="mr-1 size-3" />
                  Late
                </Badge>
              )}
              {submission?.reviewStatus === "completed" && (assignment.rewardPoints ?? 0) > 0 && (
                <Badge className="bg-green-600 text-white">
                  +{assignment.rewardPoints} points
                </Badge>
              )}
            </div>

            {hasSubmitted ? (
              <div className="space-y-1.5 text-sm text-muted-foreground">
                <p>Submitted {fmtDate(submission!.submittedAt)}</p>
                {submission?.content ? <p className="line-clamp-2">{submission.content}</p> : null}
                {submission?.reviewRemark ? (
                  <div className="rounded-xl border border-border/60 bg-muted/40 px-3 py-2 text-sm text-foreground">
                    <div className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      <MessageSquareMore className="size-3.5" />
                      Teacher Remark
                    </div>
                    <p>{submission.reviewRemark}</p>
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No file has been submitted yet for this assignment.
              </p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end">
          {hasSubmitted && submission?.filePath ? (
            <Button variant="outline" size="sm" className="gap-1.5" onClick={onViewFile}>
              <Eye className="size-3.5" />
              View File
              <FileText className="size-3.5" />
            </Button>
          ) : null}
          <Button
            variant={submission?.reviewStatus === "completed" ? "outline" : "default"}
            size="sm"
            className={cn("gap-1.5", hasSubmitted && submission?.reviewStatus !== "completed" && "bg-brand-purple hover:bg-brand-purple/90")}
            onClick={onReview}
            disabled={!hasSubmitted}
          >
            {submission?.reviewStatus === "completed" ? "Update Review" : "Review Submission"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

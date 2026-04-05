"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { assignmentApi, courseApi, getAuthedClient, type AssessmentCourseOption } from "@/services/api/client"
import type { ApiAssignment, ApiSubmission, ApiUser } from "@/lib/types/api"

type FilterType = "all" | "submitted" | "completed" | "incomplete" | "notSubmitted"

interface AssignmentFormData {
  title: string
  description: string
  courseId: string
  dueDate: string
  file: string
  rewardPoints: string
}

type CourseStudentEnrollment = {
  user?: ApiUser | null
} & Partial<ApiUser>

function isLate(submittedAt: string, dueDate: string) {
  if (!submittedAt || !dueDate) return false
  const dueDateEnd = new Date(dueDate)
  dueDateEnd.setHours(23, 59, 59, 999)
  return new Date(submittedAt) > dueDateEnd
}

export function useGrading() {
  const [assignments, setAssignments] = useState<ApiAssignment[]>([])
  const [courses, setCourses] = useState<AssessmentCourseOption[]>([])
  const [selectedAssignmentId, setSelectedAssignmentId] = useState("")
  const [submissions, setSubmissions] = useState<ApiSubmission[]>([])
  const [courseStudents, setCourseStudents] = useState<{ id: string; username: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingSubs, setLoadingSubs] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [activeFilter, setActiveFilter] = useState<FilterType>("all")

  const selectedAssignment = useMemo(
    () => assignments.find((assignment) => String(assignment.id) === selectedAssignmentId) ?? null,
    [assignments, selectedAssignmentId]
  )

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true)
      const client = await getAuthedClient()
      const [assignmentRes, courseRes] = await Promise.all([
        client.get<{ success: boolean; data: ApiAssignment[] }>("/academic/assignments"),
        client.get<{ success: boolean; data: AssessmentCourseOption[] }>("/courses?limit=100"),
      ])
      setAssignments(assignmentRes.data.data ?? [])
      setCourses(courseRes.data.data ?? [])
    } catch (error) {
      console.error(error)
      toast.error("Failed to load assignments")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadInitialData()
  }, [loadInitialData])

  const loadCourseStudents = useCallback(async (courseId: number) => {
    try {
      const response = await courseApi.getCourseStudents(courseId) as {
        success: boolean
        data?: CourseStudentEnrollment[]
        message?: string
      }
      if (!response.success || !response.data) {
        setCourseStudents([])
        return
      }

      setCourseStudents(
        response.data
          .map((entry) => {
            const student = entry.user ?? entry
            const fullName = [
              student.userDetails?.firstName,
              student.userDetails?.lastName,
            ]
              .filter(Boolean)
              .join(" ")
              .trim()

            const id = student.id
            if (!id) {
              return null
            }

            return {
              id,
              username: fullName || student.username || "Unknown Student",
            }
          })
          .filter((student): student is { id: string; username: string } => Boolean(student))
      )
    } catch (error) {
      console.error(error)
      setCourseStudents([])
    }
  }, [])

  const loadSubmissions = useCallback(
    async (assignmentId: string) => {
      if (!assignmentId) {
        setSubmissions([])
        setCourseStudents([])
        return
      }

      try {
        setLoadingSubs(true)
        const assignment = assignments.find((item) => String(item.id) === assignmentId)

        if (assignment?.courseId) {
          await loadCourseStudents(assignment.courseId)
        } else {
          setCourseStudents([])
        }

        const response = await assignmentApi.getAssignmentSubmissions(Number(assignmentId))
        if (!response.success || !response.data) {
          throw new Error(response.message || "Failed to load submissions")
        }

        setSubmissions(response.data)
      } catch (error) {
        console.error(error)
        toast.error(error instanceof Error ? error.message : "Failed to load submissions")
        setSubmissions([])
      } finally {
        setLoadingSubs(false)
      }
    },
    [assignments, loadCourseStudents]
  )

  const handleSelectAssignment = useCallback(
    (assignmentId: string) => {
      setSelectedAssignmentId(assignmentId)
      setActiveFilter("all")
      void loadSubmissions(assignmentId)
    },
    [loadSubmissions]
  )

  const submittedUserIds = useMemo(
    () => new Set(submissions.map((submission) => submission.userId)),
    [submissions]
  )

  const notSubmittedStudents = useMemo(
    () => courseStudents.filter((student) => !submittedUserIds.has(student.id)),
    [courseStudents, submittedUserIds]
  )

  const counts = useMemo(
    () => ({
      all: submissions.length + notSubmittedStudents.length,
      submitted: submissions.filter((submission) => submission.reviewStatus === "submitted" || !submission.reviewStatus).length,
      completed: submissions.filter((submission) => submission.reviewStatus === "completed").length,
      incomplete: submissions.filter((submission) => submission.reviewStatus === "incomplete").length,
      notSubmitted: notSubmittedStudents.length,
    }),
    [submissions, notSubmittedStudents]
  )

  const filteredSubmissions = useMemo(() => {
    if (!selectedAssignment) return []

    switch (activeFilter) {
      case "submitted":
        return submissions.filter((submission) => submission.reviewStatus === "submitted" || !submission.reviewStatus)
      case "completed":
        return submissions.filter((submission) => submission.reviewStatus === "completed")
      case "incomplete":
        return submissions.filter((submission) => submission.reviewStatus === "incomplete")
      case "notSubmitted":
        return []
      default:
        return submissions
    }
  }, [activeFilter, selectedAssignment, submissions])

  const filteredNotSubmitted = useMemo(
    () => (activeFilter === "all" || activeFilter === "notSubmitted" ? notSubmittedStudents : []),
    [activeFilter, notSubmittedStudents]
  )

  const createAssignment = useCallback(async (data: AssignmentFormData) => {
    try {
      setSubmitting(true)
      const client = await getAuthedClient()
      const payload = {
        title: data.title.trim(),
        description: data.description.trim() || undefined,
        courseId: Number(data.courseId),
        dueDate: data.dueDate || undefined,
        file: data.file || undefined,
        rewardPoints: Math.max(0, Number(data.rewardPoints || 0)),
      }
      const response = await client.post<{ success: boolean; data: ApiAssignment }>("/academic/assignments", payload)
      setAssignments((current) => [response.data.data, ...current])
      toast.success("Assignment created")
      return true
    } catch (error) {
      console.error(error)
      toast.error("Failed to create assignment")
      return false
    } finally {
      setSubmitting(false)
    }
  }, [])

  const updateAssignment = useCallback(async (id: number, data: AssignmentFormData) => {
    try {
      setSubmitting(true)
      const client = await getAuthedClient()
      const payload = {
        title: data.title.trim(),
        description: data.description.trim() || undefined,
        courseId: Number(data.courseId),
        dueDate: data.dueDate || undefined,
        file: data.file || undefined,
        rewardPoints: Math.max(0, Number(data.rewardPoints || 0)),
      }
      const response = await client.put<{ success: boolean; data: ApiAssignment }>(`/academic/assignments/${id}`, payload)
      setAssignments((current) => current.map((assignment) => (assignment.id === id ? response.data.data : assignment)))
      toast.success("Assignment updated")
      return true
    } catch (error) {
      console.error(error)
      toast.error("Failed to update assignment")
      return false
    } finally {
      setSubmitting(false)
    }
  }, [])

  const reviewSubmission = useCallback(
    async (submissionId: number, data: { reviewStatus: "completed" | "incomplete"; reviewRemark?: string }) => {
      try {
        setSubmitting(true)
        const response = await assignmentApi.reviewSubmission(submissionId, data)
        if (!response.success || !response.data) {
          throw new Error(response.message || "Failed to review submission")
        }

        setSubmissions((current) =>
          current.map((submission) => (submission.id === submissionId ? response.data! : submission))
        )

        toast.success(data.reviewStatus === "completed" ? "Submission marked completed" : "Submission marked incomplete")
        return true
      } catch (error) {
        console.error(error)
        toast.error(error instanceof Error ? error.message : "Failed to review submission")
        return false
      } finally {
        setSubmitting(false)
      }
    },
    []
  )

  const selectedAssignmentSummary = useMemo(() => {
    if (!selectedAssignment) return null

    return {
      reviewQueueCount: submissions.filter((submission) => submission.reviewStatus === "submitted" || !submission.reviewStatus).length,
      completedCount: submissions.filter((submission) => submission.reviewStatus === "completed").length,
      incompleteCount: submissions.filter((submission) => submission.reviewStatus === "incomplete").length,
      lateCount: submissions.filter((submission) => isLate(submission.submittedAt, selectedAssignment.dueDate)).length,
    }
  }, [selectedAssignment, submissions])

  return {
    assignments,
    courses,
    selectedAssignmentId,
    selectedAssignment,
    selectedAssignmentSummary,
    handleSelectAssignment,
    submissions,
    courseStudents,
    loading,
    loadingSubs,
    submitting,
    activeFilter,
    setActiveFilter,
    counts,
    filteredSubmissions,
    filteredNotSubmitted,
    createAssignment,
    updateAssignment,
    reviewSubmission,
  }
}

export type { FilterType, AssignmentFormData }

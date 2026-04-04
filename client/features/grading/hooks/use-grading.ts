"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { getAuthedClient, courseApi, type AssessmentCourseOption } from "@/services/api/client"
import type { ApiAssignment, ApiSubmission, ApiGrade } from "@/lib/types/api"

type FilterType = "all" | "submitted" | "late" | "notSubmitted"

interface AssignmentFormData {
  title: string
  description: string
  courseId: string
  dueDate: string
  file: string
}

const emptyAssignmentForm: AssignmentFormData = {
  title: "",
  description: "",
  courseId: "",
  dueDate: "",
  file: "",
}

function isLate(submittedAt: string, dueDate: string): boolean {
  if (!dueDate || !submittedAt) return false
  return new Date(submittedAt) > new Date(dueDate)
}

export function useGrading() {
  const [assignments, setAssignments] = useState<ApiAssignment[]>([])
  const [courses, setCourses] = useState<AssessmentCourseOption[]>([])
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>("")
  const [submissions, setSubmissions] = useState<ApiSubmission[]>([])
  const [grades, setGrades] = useState<ApiGrade[]>([])
  const [courseStudents, setCourseStudents] = useState<{ id: string; username: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingSubs, setLoadingSubs] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [activeFilter, setActiveFilter] = useState<FilterType>("all")

  const selectedAssignment = useMemo(
    () => assignments.find((a) => String(a.id) === selectedAssignmentId) ?? null,
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
    } catch (e) {
      console.error(e)
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
      const res = await courseApi.getCourseStudents(courseId)
      if (res.success && res.data) {
        setCourseStudents(res.data.map((u) => ({ id: u.id, username: u.username ?? "Unknown Student" })))
      }
    } catch (e) {
      console.error(e)
    }
  }, [])

  const loadSubmissions = useCallback(
    async (assignmentId: string) => {
      if (!assignmentId) {
        setSubmissions([])
        setGrades([])
        setCourseStudents([])
        return
      }
      try {
        setLoadingSubs(true)
        const client = await getAuthedClient()
        const assignment = assignments.find((a) => String(a.id) === assignmentId)
        if (assignment?.courseId) {
          await loadCourseStudents(assignment.courseId)
        }
        const [subRes, gradeRes] = await Promise.all([
          client.get<{ success: boolean; data: ApiSubmission[] }>(
            `/academic/submissions/${assignmentId}`
          ),
          client.get<{ success: boolean; data: ApiGrade[] }>(
            `/grades/assignment/${assignmentId}`
          ),
        ])
        setSubmissions(subRes.data.data ?? [])
        setGrades(gradeRes.data.data ?? [])
      } catch (e) {
        console.error(e)
        toast.error("Failed to load submissions")
      } finally {
        setLoadingSubs(false)
      }
    },
    [assignments, loadCourseStudents]
  )

  const handleSelectAssignment = useCallback(
    (id: string) => {
      setSelectedAssignmentId(id)
      setActiveFilter("all")
      void loadSubmissions(id)
    },
    [loadSubmissions]
  )

  const gradeMap = useMemo(
    () => new Map(grades.map((g) => [g.userId, g])),
    [grades]
  )

  const submittedUserIds = useMemo(
    () => new Set(submissions.map((s) => s.userId)),
    [submissions]
  )

  const notSubmittedStudents = useMemo(
    () => courseStudents.filter((s) => !submittedUserIds.has(s.id)),
    [courseStudents, submittedUserIds]
  )

  const onTimeSubmissions = useMemo(
    () =>
      selectedAssignment
        ? submissions.filter(
            (s) => !isLate(s.submittedAt, selectedAssignment.dueDate)
          )
        : [],
    [submissions, selectedAssignment]
  )

  const lateSubmissions = useMemo(
    () =>
      selectedAssignment
        ? submissions.filter((s) => isLate(s.submittedAt, selectedAssignment.dueDate))
        : [],
    [submissions, selectedAssignment]
  )

  const counts = useMemo(
    () => ({
      all: submissions.length + notSubmittedStudents.length,
      submitted: onTimeSubmissions.length,
      late: lateSubmissions.length,
      notSubmitted: notSubmittedStudents.length,
    }),
    [submissions, onTimeSubmissions, lateSubmissions, notSubmittedStudents]
  )

  const filteredSubmissions = useMemo(() => {
    if (!selectedAssignment) return []
    switch (activeFilter) {
      case "submitted":
        return onTimeSubmissions
      case "late":
        return lateSubmissions
      case "notSubmitted":
        return []
      default:
        return submissions
    }
  }, [activeFilter, submissions, onTimeSubmissions, lateSubmissions, selectedAssignment])

  const filteredNotSubmitted = useMemo(
    () => (activeFilter === "all" || activeFilter === "notSubmitted" ? notSubmittedStudents : []),
    [activeFilter, notSubmittedStudents]
  )

  const createAssignment = useCallback(
    async (data: AssignmentFormData) => {
      try {
        setSubmitting(true)
        const client = await getAuthedClient()
        const payload = {
          title: data.title.trim(),
          description: data.description.trim() || undefined,
          courseId: Number(data.courseId),
          dueDate: data.dueDate || undefined,
          file: data.file || undefined,
        }
        const res = await client.post<{ success: boolean; data: ApiAssignment }>(
          "/academic/assignments",
          payload
        )
        setAssignments((prev) => [res.data.data, ...prev])
        toast.success("Assignment created")
        return true
      } catch (e) {
        console.error(e)
        toast.error("Failed to create assignment")
        return false
      } finally {
        setSubmitting(false)
      }
    },
    []
  )

  const updateAssignment = useCallback(
    async (id: number, data: AssignmentFormData) => {
      try {
        setSubmitting(true)
        const client = await getAuthedClient()
        const payload = {
          title: data.title.trim(),
          description: data.description.trim() || undefined,
          courseId: Number(data.courseId),
          dueDate: data.dueDate || undefined,
          file: data.file || undefined,
        }
        const res = await client.put<{ success: boolean; data: ApiAssignment }>(
          `/academic/assignments/${id}`,
          payload
        )
        setAssignments((prev) =>
          prev.map((a) => (a.id === id ? res.data.data : a))
        )
        toast.success("Assignment updated")
        return true
      } catch (e) {
        console.error(e)
        toast.error("Failed to update assignment")
        return false
      } finally {
        setSubmitting(false)
      }
    },
    []
  )

  const submitGrade = useCallback(
    async (userId: string, assignmentId: number, grade: string) => {
      try {
        setSubmitting(true)
        const client = await getAuthedClient()
        const res = await client.post<{ success: boolean; data: ApiGrade }>("/grades", {
          userId,
          assignmentId,
          grade,
        })
        setGrades((prev) => [...prev, res.data.data])
        toast.success("Grade assigned")
        return true
      } catch (e) {
        console.error(e)
        toast.error("Failed to assign grade")
        return false
      } finally {
        setSubmitting(false)
      }
    },
    []
  )

  const updateGrade = useCallback(
    async (gradeId: number, grade: string) => {
      try {
        setSubmitting(true)
        const client = await getAuthedClient()
        const res = await client.put<{ success: boolean; data: ApiGrade }>(
          `/grades/${gradeId}`,
          { grade }
        )
        setGrades((prev) => prev.map((g) => (g.id === gradeId ? res.data.data : g)))
        toast.success("Grade updated")
        return true
      } catch (e) {
        console.error(e)
        toast.error("Failed to update grade")
        return false
      } finally {
        setSubmitting(false)
      }
    },
    []
  )

  return {
    assignments,
    courses,
    selectedAssignmentId,
    selectedAssignment,
    handleSelectAssignment,
    submissions,
    grades,
    gradeMap,
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
    submitGrade,
    updateGrade,
  }
}

export type { FilterType, AssignmentFormData }

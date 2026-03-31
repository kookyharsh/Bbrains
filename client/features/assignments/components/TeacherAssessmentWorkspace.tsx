"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Loader2, NotebookPen, PenSquare, Target, Users } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { SectionHeader } from "@/features/admin/components/SectionHeader"
import {
  assessmentApi,
  type Assessment,
  type AssessmentCourseOption,
  type AssessmentStudent,
} from "@/services/api/client"

type AssessmentForm = {
  courseId: string
  subject: string
  topic: string
  assessmentType: "test" | "exam"
  assessmentDate: string
  totalMarks: string
}

type AssessmentRow = {
  studentId: string
  marksObtained: string
  remark: string
}

const emptyForm: AssessmentForm = {
  courseId: "",
  subject: "",
  topic: "",
  assessmentType: "test",
  assessmentDate: "",
  totalMarks: "",
}

function fmtDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function personName(student?: AssessmentStudent | null) {
  const full = `${student?.userDetails?.firstName || ""} ${student?.userDetails?.lastName || ""}`.trim()
  return full || student?.username || "Student"
}

function assessmentLabel(type: "test" | "exam") {
  return type === "exam" ? "Exam" : "Test"
}

function averagePercentage(assessment: Assessment) {
  const totalMarks = Number(assessment.totalMarks || 0)
  if (!totalMarks || assessment.results.length === 0) return 0
  const totalScored = assessment.results.reduce((sum, result) => sum + Number(result.marksObtained || 0), 0)
  return Math.round((totalScored / (assessment.results.length * totalMarks)) * 100)
}

export function TeacherAssessmentWorkspace() {
  const [courses, setCourses] = useState<AssessmentCourseOption[]>([])
  const [teacherSubjects, setTeacherSubjects] = useState<string[]>([])
  const [eligibleStudents, setEligibleStudents] = useState<AssessmentStudent[]>([])
  const [assessmentRows, setAssessmentRows] = useState<AssessmentRow[]>([])
  const [assessmentForm, setAssessmentForm] = useState<AssessmentForm>(emptyForm)
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null)
  const [loadingAssessments, setLoadingAssessments] = useState(true)
  const [assessmentSetupLoading, setAssessmentSetupLoading] = useState(false)
  const [assessmentSubmitting, setAssessmentSubmitting] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const selectedCourse = useMemo(
    () => courses.find((course) => String(course.id) === assessmentForm.courseId) || null,
    [courses, assessmentForm.courseId]
  )

  const subjectOptions = useMemo(() => {
    if (selectedCourse?.availableSubjects?.length) return selectedCourse.availableSubjects
    if (teacherSubjects.length) return teacherSubjects
    if (selectedCourse?.subjects?.length) return selectedCourse.subjects
    return []
  }, [selectedCourse, teacherSubjects])

  const loadDashboard = useCallback(async () => {
    try {
      setLoadingAssessments(true)
      const [setupResponse, assessmentsResponse] = await Promise.all([
        assessmentApi.getSetup(),
        assessmentApi.getTeacherAssessments(),
      ])

      if (setupResponse.success && setupResponse.data) {
        setCourses(setupResponse.data.courses || [])
        setTeacherSubjects(setupResponse.data.teacherSubjects || [])
      }

      if (assessmentsResponse.success && assessmentsResponse.data) {
        setAssessments(assessmentsResponse.data)
      }
    } catch (error) {
      console.error(error)
      toast.error("Failed to load tests and exams")
    } finally {
      setLoadingAssessments(false)
    }
  }, [])

  useEffect(() => {
    void loadDashboard()
  }, [loadDashboard])

  useEffect(() => {
    if (subjectOptions.length === 1) {
      setAssessmentForm((current) =>
        current.subject === subjectOptions[0] ? current : { ...current, subject: subjectOptions[0] }
      )
      return
    }

    if (assessmentForm.subject && !subjectOptions.includes(assessmentForm.subject)) {
      setAssessmentForm((current) => ({ ...current, subject: "" }))
    }
  }, [assessmentForm.subject, subjectOptions])

  useEffect(() => {
    async function loadEligibleStudents() {
      if (!assessmentForm.courseId || !assessmentForm.assessmentDate) {
        setEligibleStudents([])
        return
      }

      try {
        setAssessmentSetupLoading(true)
        const response = await assessmentApi.getSetup({
          courseId: Number(assessmentForm.courseId),
          date: assessmentForm.assessmentDate,
        })

        if (!response.success || !response.data) {
          throw new Error(response.message || "Failed to load students")
        }

        setCourses(response.data.courses || [])
        setTeacherSubjects(response.data.teacherSubjects || [])
        setEligibleStudents(response.data.eligibleStudents || [])
      } catch (error) {
        console.error(error)
        setEligibleStudents([])
        toast.error("Failed to load present students for that date")
      } finally {
        setAssessmentSetupLoading(false)
      }
    }

    void loadEligibleStudents()
  }, [assessmentForm.courseId, assessmentForm.assessmentDate, refreshKey])

  useEffect(() => {
    setAssessmentRows((previousRows) => {
      const previousMap = new Map(previousRows.map((row) => [row.studentId, row]))
      const editingMap = new Map(
        (editingAssessment?.results || []).map((result) => [
          result.studentId,
          {
            studentId: result.studentId,
            marksObtained: String(result.marksObtained ?? ""),
            remark: result.remark ?? "",
          },
        ])
      )

      return eligibleStudents.map((student) => {
        const fromEdit = editingMap.get(student.id)
        const existing = previousMap.get(student.id)
        return {
          studentId: student.id,
          marksObtained: fromEdit?.marksObtained ?? existing?.marksObtained ?? "",
          remark: fromEdit?.remark ?? existing?.remark ?? "",
        }
      })
    })
  }, [eligibleStudents, editingAssessment?.id])

  function resetComposer() {
    setAssessmentForm(emptyForm)
    setEligibleStudents([])
    setAssessmentRows([])
    setEditingAssessment(null)
  }

  function handleAssessmentRowChange(studentId: string, key: "marksObtained" | "remark", value: string) {
    setAssessmentRows((current) =>
      current.map((row) => (row.studentId === studentId ? { ...row, [key]: value } : row))
    )
  }

  function startEditingAssessment(assessment: Assessment) {
    setEditingAssessment(assessment)
    setAssessmentForm({
      courseId: String(assessment.courseId),
      subject: assessment.subject,
      topic: assessment.topic,
      assessmentType: assessment.assessmentType,
      assessmentDate: assessment.assessmentDate.slice(0, 10),
      totalMarks: String(assessment.totalMarks),
    })
    setRefreshKey((value) => value + 1)
  }

  async function handleAssessmentSubmit() {
    if (!assessmentForm.courseId || !assessmentForm.assessmentDate || !assessmentForm.topic.trim() || !assessmentForm.subject) {
      toast.error("Class, date, subject, and topic are required")
      return
    }

    const totalMarks = Number(assessmentForm.totalMarks)
    if (!Number.isFinite(totalMarks) || totalMarks <= 0) {
      toast.error("Total marks must be greater than zero")
      return
    }

    if (eligibleStudents.length === 0) {
      toast.error("No present students were found for that class on that date")
      return
    }

    if (assessmentRows.some((row) => row.marksObtained === "")) {
      toast.error("Enter marks for every present student")
      return
    }

    const payload = {
      courseId: Number(assessmentForm.courseId),
      subject: assessmentForm.subject,
      topic: assessmentForm.topic.trim(),
      assessmentType: assessmentForm.assessmentType,
      assessmentDate: assessmentForm.assessmentDate,
      totalMarks,
      results: assessmentRows.map((row) => ({
        studentId: row.studentId,
        marksObtained: Number(row.marksObtained),
        remark: row.remark.trim() || undefined,
      })),
    }

    try {
      setAssessmentSubmitting(true)
      const response = editingAssessment
        ? await assessmentApi.updateAssessment(editingAssessment.id, payload)
        : await assessmentApi.createAssessment(payload)

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to save assessment")
      }

      toast.success(editingAssessment ? "Assessment updated" : "Assessment published")
      resetComposer()
      await loadDashboard()
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : "Failed to save assessment")
    } finally {
      setAssessmentSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Tests & Exams"
        subtitle="Select the class, subject, and date first, then assign marks only to students who were present."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardDescription>Published Assessments</CardDescription>
            <CardTitle className="text-2xl">{loadingAssessments ? "-" : assessments.length}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-xs text-muted-foreground">
            <NotebookPen className="h-4 w-4" />
            Create and update published tests and exams here.
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardDescription>Teacher Subjects</CardDescription>
            <CardTitle className="text-xl">{teacherSubjects.length || "Not set"}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {teacherSubjects.length ? teacherSubjects.map((subject) => <Badge key={subject}>{subject}</Badge>) : (
              <p className="text-xs text-muted-foreground">Subject options appear automatically once teacher subjects are configured.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardDescription>Present Students Loaded</CardDescription>
            <CardTitle className="text-2xl">{assessmentSetupLoading ? "-" : eligibleStudents.length}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="h-4 w-4" />
            This list updates from the selected class and date.
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <CardTitle className="text-xl">{editingAssessment ? "Edit Published Assessment" : "Create Test or Exam"}</CardTitle>
              <CardDescription>
                The subject picker appears here. If you teach only one subject, it is selected automatically.
              </CardDescription>
            </div>
            {editingAssessment ? (
              <Button variant="outline" className="rounded-2xl" onClick={resetComposer}>
                New Assessment
              </Button>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Assessment Type</label>
              <Select
                value={assessmentForm.assessmentType}
                onValueChange={(value) =>
                  setAssessmentForm((current) => ({ ...current, assessmentType: value as "test" | "exam" }))
                }
              >
                <SelectTrigger className="rounded-2xl">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="test">Test</SelectItem>
                  <SelectItem value="exam">Exam</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Class</label>
              <Select
                value={assessmentForm.courseId}
                onValueChange={(value) =>
                  setAssessmentForm((current) => ({ ...current, courseId: value, subject: "" }))
                }
              >
                <SelectTrigger className="rounded-2xl">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={String(course.id)}>
                      {course.name}
                      {course.standard ? ` (${course.standard})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Date</label>
              <Input
                type="date"
                className="rounded-2xl"
                value={assessmentForm.assessmentDate}
                onChange={(event) =>
                  setAssessmentForm((current) => ({ ...current, assessmentDate: event.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Subject</label>
              {subjectOptions.length <= 1 ? (
                <div className="flex h-10 items-center rounded-2xl border border-border bg-muted/40 px-3 text-sm">
                  {subjectOptions[0] || "Select a class first"}
                </div>
              ) : (
                <Select
                  value={assessmentForm.subject}
                  onValueChange={(value) =>
                    setAssessmentForm((current) => ({ ...current, subject: value }))
                  }
                >
                  <SelectTrigger className="rounded-2xl">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjectOptions.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Topic</label>
              <Input
                className="rounded-2xl"
                value={assessmentForm.topic}
                placeholder="Fractions chapter test"
                onChange={(event) =>
                  setAssessmentForm((current) => ({ ...current, topic: event.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Total Marks</label>
              <Input
                type="number"
                min="1"
                step="0.01"
                className="rounded-2xl"
                value={assessmentForm.totalMarks}
                placeholder="100"
                onChange={(event) =>
                  setAssessmentForm((current) => ({ ...current, totalMarks: event.target.value }))
                }
              />
            </div>
          </div>

          <div className="rounded-3xl border border-dashed border-border/70 bg-muted/20 p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">Present Students for Selected Date</p>
                <p className="text-xs text-muted-foreground">
                  Only students marked present for that class and date appear below.
                </p>
              </div>
              {assessmentSetupLoading ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading attendance match
                </div>
              ) : (
                <Badge variant="outline">{eligibleStudents.length} student{eligibleStudents.length === 1 ? "" : "s"}</Badge>
              )}
            </div>

            {eligibleStudents.length === 0 ? (
              <div className="mt-4 rounded-2xl bg-background p-4 text-sm text-muted-foreground">
                Select a class and date to load the present-student list.
              </div>
            ) : (
              <div className="mt-4 overflow-x-auto rounded-2xl border border-border/60 bg-background">
                <Table className="table-fixed">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[260px]">Student</TableHead>
                      <TableHead className="w-[160px]">Marks</TableHead>
                      <TableHead className="min-w-[320px]">Remark</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {eligibleStudents.map((student) => {
                      const row = assessmentRows.find((entry) => entry.studentId === student.id) || {
                        studentId: student.id,
                        marksObtained: "",
                        remark: "",
                      }

                      return (
                        <TableRow key={student.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-foreground">{personName(student)}</p>
                              <p className="text-xs text-muted-foreground">@{student.username}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              max={assessmentForm.totalMarks || undefined}
                              value={row.marksObtained}
                              onChange={(event) =>
                                handleAssessmentRowChange(student.id, "marksObtained", event.target.value)
                              }
                              placeholder="0"
                              className="rounded-xl"
                            />
                          </TableCell>
                          <TableCell className="align-top whitespace-normal">
                            <Textarea
                              value={row.remark}
                              onChange={(event) =>
                                handleAssessmentRowChange(student.id, "remark", event.target.value)
                              }
                              placeholder="Optional feedback for the student"
                              className="min-h-[76px] w-full min-w-0 resize-y rounded-xl"
                            />
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-muted-foreground">
              Students will see the subject, topic, marks, percentage, and remark in their results section.
            </div>
            <Button
              onClick={handleAssessmentSubmit}
              disabled={assessmentSubmitting || assessmentSetupLoading || eligibleStudents.length === 0}
              className="rounded-2xl"
            >
              {assessmentSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {editingAssessment ? "Update Assessment" : "Publish Assessment"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-xl">Published Assessment History</CardTitle>
          <CardDescription>
            Reopen a saved test or exam to correct marks, remarks, or attendance-aligned student entries.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {loadingAssessments ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading assessment history...
            </div>
          ) : assessments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/70 p-4 text-sm text-muted-foreground">
              No tests or exams have been published yet.
            </div>
          ) : (
            assessments.map((assessment) => (
              <div
                key={assessment.id}
                className="flex flex-col gap-3 rounded-3xl border border-border/60 bg-muted/10 p-4 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{assessmentLabel(assessment.assessmentType)}</Badge>
                    <Badge variant="secondary">{assessment.subject}</Badge>
                    <Badge variant="secondary">{assessment.course?.name || `Class ${assessment.courseId}`}</Badge>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{assessment.topic}</p>
                    <p className="text-sm text-muted-foreground">
                      {fmtDate(assessment.assessmentDate)} • {assessment.results.length} student
                      {assessment.results.length === 1 ? "" : "s"} • Average {averagePercentage(assessment)}%
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center rounded-2xl bg-background px-3 py-2 text-sm text-muted-foreground">
                    <Target className="mr-2 h-4 w-4" />
                    Total Marks: {assessment.totalMarks}
                  </div>
                  <Button variant="outline" className="rounded-2xl" onClick={() => startEditingAssessment(assessment)}>
                    <PenSquare className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}

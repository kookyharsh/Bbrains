"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { DashboardContent } from "@/components/dashboard-content"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { assessmentApi, dashboardApi, type StudentAssessmentResult } from "@/services/api/client"
import { Loader2, Search, Trophy } from "lucide-react"
import { toast } from "sonner"

function fmtDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function resultPercentage(result: StudentAssessmentResult) {
  const total = Number(result.assessment.totalMarks || 0)
  if (!total) return 0
  return Math.round((Number(result.marksObtained || 0) / total) * 100)
}

function teacherName(result: StudentAssessmentResult) {
  const details = result.assessment.createdBy?.userDetails
  const full = `${details?.firstName || ""} ${details?.lastName || ""}`.trim()
  return full || result.assessment.createdBy?.username || "Teacher"
}

export default function ResultsPage() {
  const [assessmentTypeFilter, setAssessmentTypeFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [subjectFilter, setSubjectFilter] = useState("all")
  const [userRole, setUserRole] = useState<string | null>(null)
  const [results, setResults] = useState<StudentAssessmentResult[]>([])
  const [loading, setLoading] = useState(true)

  const loadResults = useCallback(async () => {
    try {
      setLoading(true)
      const [userResponse, resultResponse] = await Promise.all([
        dashboardApi.getUser(),
        assessmentApi.getMyResults(),
      ])

      if (userResponse.success && userResponse.data) {
        setUserRole(userResponse.data.type)
      }

      if (resultResponse.success && resultResponse.data) {
        setResults(resultResponse.data)
      }
    } catch (error) {
      console.error(error)
      toast.error("Failed to load your results")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadResults()
  }, [loadResults])

  const filteredResults = useMemo(() => {
    return results.filter((result) => {
      if (assessmentTypeFilter !== "all" && result.assessment.assessmentType !== assessmentTypeFilter) return false
      if (subjectFilter !== "all" && result.assessment.subject !== subjectFilter) return false
      if (!searchQuery.trim()) return true

      const query = searchQuery.toLowerCase()
      return (
        result.assessment.subject.toLowerCase().includes(query) ||
        result.assessment.topic.toLowerCase().includes(query) ||
        result.assessment.course?.name?.toLowerCase().includes(query)
      )
    })
  }, [assessmentTypeFilter, results, searchQuery, subjectFilter])

  const resultSubjects = useMemo(() => {
    return Array.from(new Set(results.map((result) => result.assessment.subject))).sort((a, b) => a.localeCompare(b))
  }, [results])

  const averageScore = useMemo(() => {
    if (!results.length) return 0
    const total = results.reduce((sum, result) => sum + resultPercentage(result), 0)
    return Math.round(total / results.length)
  }, [results])

  const filteredAverageScore = useMemo(() => {
    if (!filteredResults.length) return 0
    const total = filteredResults.reduce((sum, result) => sum + resultPercentage(result), 0)
    return Math.round(total / filteredResults.length)
  }, [filteredResults])

  const filteredSubjectCount = useMemo(() => {
    return new Set(filteredResults.map((result) => result.assessment.subject)).size
  }, [filteredResults])

  const resultsHeading = assessmentTypeFilter === "exam" ? "Exam Results" : assessmentTypeFilter === "test" ? "Test Results" : "Results"
  const resultsDescription =
    assessmentTypeFilter === "exam"
      ? "Review your exams here and filter by subject when you want to focus on one paper at a time."
      : assessmentTypeFilter === "test"
        ? "Review your class tests here and narrow them by subject whenever you want a cleaner view."
        : "Review your test and exam marks together, then narrow the list with type and subject filters."
  const searchPlaceholder =
    assessmentTypeFilter === "exam"
      ? "Search exam results..."
      : assessmentTypeFilter === "test"
        ? "Search test results..."
        : "Search all results..."

  if (loading && !userRole) {
    return (
      <DashboardContent className="space-y-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading results...
        </div>
      </DashboardContent>
    )
  }

  if (userRole && userRole !== "student") {
    return (
      <DashboardContent className="space-y-6">
        <Card className="border-dashed border-border/70">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            This results page is available from the student menu.
          </CardContent>
        </Card>
      </DashboardContent>
    )
  }

  function renderResultsList(list: StudentAssessmentResult[]) {
    if (loading) {
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading results...
        </div>
      )
    }

    if (list.length === 0) {
      return (
        <Card className="border-dashed border-border/70">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No published results match the current filters.
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="space-y-4">
        {list.map((result) => (
          <Card key={result.id} className="overflow-hidden border-border/60 shadow-sm">
            <CardContent className="space-y-3 bg-gradient-to-br from-muted/20 via-background to-brand-orange/5 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{result.assessment.assessmentType === "exam" ? "Exam" : "Test"}</Badge>
                    <Badge variant="secondary">{result.assessment.subject}</Badge>
                    <Badge variant="secondary">{result.assessment.course?.name || "Class"}</Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-base font-semibold leading-tight text-foreground">{result.assessment.topic}</p>
                    <p className="text-xs text-muted-foreground sm:text-sm">
                      Published for {fmtDate(result.assessment.assessmentDate)} by {teacherName(result)}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-border/60 bg-background/95 px-3 py-2 text-left shadow-sm sm:min-w-[140px] sm:text-right">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Your Score</p>
                  <p className="text-lg font-bold text-foreground">
                    {result.marksObtained} / {result.assessment.totalMarks}
                  </p>
                  <p className="text-sm font-medium text-brand-orange">{resultPercentage(result)}%</p>
                </div>
              </div>

              {result.remark ? (
                <div className="rounded-2xl border border-brand-orange/20 bg-brand-orange/5 px-3 py-2.5">
                  <div className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-brand-orange">
                    <Trophy className="h-3.5 w-3.5" />
                    Teacher Remark
                  </div>
                  <p className="text-sm leading-5 text-foreground">{result.remark}</p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <DashboardContent className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Results</h1>
          <p className="text-muted-foreground">Review your test and exam marks in a separate results workspace.</p>
        </div>

        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="rounded-2xl pl-9"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardDescription>Published Results</CardDescription>
            <CardTitle className="text-2xl">{loading ? "-" : results.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardDescription>Visible Subjects</CardDescription>
            <CardTitle className="text-2xl">{loading ? "-" : filteredSubjectCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardDescription>Overall Average</CardDescription>
            <CardTitle className="text-2xl">{loading ? "-" : `${averageScore}%`}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="space-y-4">
        <Card className="overflow-hidden border-border/60">
          <CardContent className="space-y-5 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-1">
                <p className="text-lg font-semibold text-foreground">{resultsHeading}</p>
                <p className="text-sm text-muted-foreground">{resultsDescription}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[28px] border border-border/60 bg-muted/20 p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Assessment Filter</p>
                  <Select value={assessmentTypeFilter} onValueChange={setAssessmentTypeFilter}>
                    <SelectTrigger className="mt-3 h-11 w-full min-w-[220px] rounded-2xl bg-background">
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All assessments</SelectItem>
                      <SelectItem value="test">Tests</SelectItem>
                      <SelectItem value="exam">Exams</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-[28px] border border-border/60 bg-muted/20 p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Subject Filter</p>
                  <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                    <SelectTrigger className="mt-3 h-11 w-full min-w-[220px] rounded-2xl bg-background">
                      <SelectValue placeholder="All subjects" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All subjects</SelectItem>
                      {resultSubjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[28px] border border-border/60 bg-gradient-to-br from-background to-muted/40 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Visible Results</p>
                <p className="mt-2 text-2xl font-bold text-foreground">{loading ? "-" : filteredResults.length}</p>
              </div>
              <div className="rounded-[28px] border border-border/60 bg-gradient-to-br from-background to-brand-orange/5 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Filtered Average</p>
                <p className="mt-2 text-2xl font-bold text-foreground">{loading ? "-" : `${filteredAverageScore}%`}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {renderResultsList(filteredResults)}
      </div>
    </DashboardContent>
  )
}

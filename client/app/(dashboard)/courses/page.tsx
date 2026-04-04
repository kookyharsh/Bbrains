"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BookOpen, Users, AlertCircle, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { courseApi, enrollmentApi, Course } from "@/services/api/client";
import { DashboardContent } from "@/components/dashboard-content";
import { getSubjectProgressPercent, normalizeCourseSubjectProgress } from "@/lib/subject-progress";

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrolling, setEnrolling] = useState<string | number | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const [coursesRes, enrollmentsRes] = await Promise.all([
          courseApi.getCourses(),
          enrollmentApi.getMyEnrollments(),
        ]);

        if (coursesRes.success && coursesRes.data) {
          if (enrollmentsRes.success && enrollmentsRes.data) {
            const enrolledIds = new Set(enrollmentsRes.data.map((e) => e.id));
            const coursesWithEnrollment = coursesRes.data.map((course) => ({
              ...course,
              isEnrolled: enrolledIds.has(course.id),
            }));
            setCourses(coursesWithEnrollment);
          } else {
            setCourses(coursesRes.data);
          }
        } else {
          setError(coursesRes.message || "Failed to load courses");
        }
      } catch {
        setError("Failed to load courses");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleEnroll = async (courseId: string | number) => {
    setEnrolling(courseId);
    try {
      const response = await enrollmentApi.enroll(courseId);
      if (response.success) {
        setCourses((prev) =>
          prev.map((c) => (c.id === courseId ? { ...c, isEnrolled: true } : c))
        );
      }
    } catch {
      // Handle error
    } finally {
      setEnrolling(null);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <DashboardContent className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Courses</h1>
        <p className="text-muted-foreground">Your enrolled courses this semester</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <Skeleton className="h-5 w-12" />
                </div>
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-3" />
                <Skeleton className="h-2 w-full mb-3" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-12" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-red-500">{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      ) : courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No courses available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => {
            const progressEntries = normalizeCourseSubjectProgress(course);

            return (
              <Card key={course.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  {course.isEnrolled ? (
                    <Badge variant="secondary">Enrolled</Badge>
                  ) : (
                    <Badge variant="outline">Available</Badge>
                  )}
                </div>
                <h3 className="font-semibold text-foreground mb-1">{course.name}</h3>
                <p className="text-xs text-muted-foreground mb-3">{course.standard || "Standard not set"}</p>
                {course.description && (
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{course.description}</p>
                )}
                  {course.isEnrolled ? (
                    <div className="mb-3 space-y-2">
                      {progressEntries.length > 0 ? (
                        <>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                          Subject Progress
                        </p>
                          <div className="space-y-2.5">
                            {progressEntries.map((entry) => (
                              <div key={`${course.id}-${entry.subject}`} className="space-y-1">
                              <div className="flex items-center justify-between gap-2 text-xs">
                                <span className="truncate font-medium text-foreground">{entry.subject}</span>
                                <span className="shrink-0 text-muted-foreground">
                                  {entry.completedChapters} / {entry.totalChapters || "-"} chapters
                                </span>
                              </div>
                              <Progress value={getSubjectProgressPercent(entry)} className="h-1.5" />
                            </div>
                            ))}
                        </div>
                        </>
                      ) : (
                        <div className="rounded-xl border border-dashed border-border/70 px-3 py-2 text-xs text-muted-foreground">
                          Chapter progress will appear here once your teacher sets it up.
                        </div>
                      )}
                    </div>
                  ) : null}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback name={course.teacher?.username || course.teacher?.firstName} className="bg-primary/10 text-primary text-[10px]">
                        {getInitials(course.teacher?.firstName || course.teacher?.username)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">
                      {course.teacher?.firstName || course.teacher?.username || "TBA"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="w-3 h-3" /> {course.enrolledStudents || 0}
                  </div>
                </div>
                {!course.isEnrolled && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-3"
                    onClick={() => handleEnroll(course.id)}
                    disabled={enrolling === course.id}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    {enrolling === course.id ? "Enrolling..." : "Enroll"}
                  </Button>
                )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </DashboardContent>
  );
}

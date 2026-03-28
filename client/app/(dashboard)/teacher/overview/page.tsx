"use client";

import React, { useEffect, useState } from "react";
import { DashboardContent } from "@/components/dashboard-content";
import { AttendanceCard } from "@/features/dashboard/components/AttendanceCard";
import { AnnouncementsCard } from "@/features/dashboard/components/AnnouncementsCard";
import { SectionHeader } from "@/features/admin/components/SectionHeader";
import { StatCard } from "@/features/admin/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { getAuthedClient, type Announcement, type AttendanceData, type AttendanceRecord, type Transaction } from "@/services/api/client";
import { WeeklySchedulePanel } from "@/features/schedule/components/WeeklySchedulePanel";
import { buildWeeklyScheduleFromCourses, type WeeklyScheduleDay } from "@/features/schedule/data";
import {
  AlertCircle,
  BadgeIndianRupee,
  BookOpen,
  CalendarDays,
  GraduationCap,
  Loader2,
  School,
  Users,
} from "lucide-react";

type TeacherDashboardUser = {
  firstName?: string;
  lastName?: string;
  username?: string;
};

type TeacherDashboardResponse = {
  user?: TeacherDashboardUser;
};

type TeacherCourse = {
  id: number | string;
  name: string;
  description?: string;
  _count?: {
    enrollments?: number;
    assignments?: number;
  };
};

type CourseStudentEnrollment = {
  user: {
    id: string;
    username: string;
    userDetails?: {
      firstName?: string;
      lastName?: string;
      sex?: string;
    };
  };
};

type CourseAssignment = {
  id: number;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function normalizeAttendance(records: AttendanceRecord[]): AttendanceData {
  const normalizedRecords = records.map((record) => ({
    ...record,
    status: String(record.status).toLowerCase() as AttendanceRecord["status"],
  }));

  const total = normalizedRecords.length;
  const present = normalizedRecords.filter((record) => record.status === "present").length;
  const absent = normalizedRecords.filter((record) => record.status === "absent").length;
  const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

  return {
    total,
    present,
    absent,
    percentage,
    records: normalizedRecords,
  };
}

export default function OverviewPage() {
  const [loading, setLoading] = useState(true);
  const [courseLoading, setCourseLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [teacherName, setTeacherName] = useState("Teacher");
  const [courses, setCourses] = useState<TeacherCourse[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedCourseStudents, setSelectedCourseStudents] = useState<CourseStudentEnrollment[]>([]);
  const [selectedCourseLessons, setSelectedCourseLessons] = useState(0);
  const [attendance, setAttendance] = useState<AttendanceData | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [incomeReceived, setIncomeReceived] = useState(0);
  const [teacherSchedule, setTeacherSchedule] = useState<WeeklyScheduleDay[]>([]);

  useEffect(() => {
    async function loadOverview() {
      try {
        setLoading(true);
        setError(null);

        const client = await getAuthedClient();
        const [dashboardRes, coursesRes, announcementsRes, transactionsRes, attendanceRes] = await Promise.all([
          client.get<{ success: boolean; data: TeacherDashboardResponse }>("/dashboard"),
          client.get<{ success: boolean; data: TeacherCourse[] }>("/courses?limit=100"),
          client.get<{ success: boolean; data: Announcement[] }>("/announcements"),
          client.get<{ success: boolean; data: Transaction[] }>("/transactions/me?limit=100&type=credit&status=success"),
          client.get<{ success: boolean; data: AttendanceRecord[] }>("/attendance"),
        ]);

        const dashboardUser = dashboardRes.data.data?.user;
        const fullName = `${dashboardUser?.firstName || ""} ${dashboardUser?.lastName || ""}`.trim();
        const nextCourses = coursesRes.data.data || [];

        setTeacherName(fullName || dashboardUser?.username || "Teacher");
        setCourses(nextCourses);
        setAnnouncements((announcementsRes.data.data || []).slice(0, 5));
        setIncomeReceived(
          (transactionsRes.data.data || []).reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0)
        );
        setAttendance(normalizeAttendance(attendanceRes.data.data || []));
        setTeacherSchedule(buildWeeklyScheduleFromCourses(nextCourses, fullName || dashboardUser?.username || "Teacher"));

        if (nextCourses.length > 0) {
          setSelectedCourseId((current) => current || String(nextCourses[0].id));
        }
      } catch (loadError) {
        console.error(loadError);
        setError("Failed to load teacher dashboard data.");
      } finally {
        setLoading(false);
      }
    }

    loadOverview();
  }, []);

  useEffect(() => {
    async function loadSelectedCourse() {
      if (!selectedCourseId) {
        setSelectedCourseStudents([]);
        setSelectedCourseLessons(0);
        return;
      }

      try {
        setCourseLoading(true);
        const client = await getAuthedClient();
        const [studentsRes, assignmentsRes] = await Promise.all([
          client.get<{ success: boolean; data: CourseStudentEnrollment[] }>(`/courses/${selectedCourseId}/students`),
          client.get<{ success: boolean; data: CourseAssignment[] }>(`/courses/${selectedCourseId}/assignments`),
        ]);

        setSelectedCourseStudents(studentsRes.data.data || []);
        setSelectedCourseLessons((assignmentsRes.data.data || []).length);
      } catch (loadError) {
        console.error(loadError);
        setSelectedCourseStudents([]);
        setSelectedCourseLessons(0);
      } finally {
        setCourseLoading(false);
      }
    }

    loadSelectedCourse();
  }, [selectedCourseId]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground/50" />
      </div>
    );
  }

  const selectedCourse = courses.find((course) => String(course.id) === selectedCourseId) || null;
  const girlsCount = selectedCourseStudents.filter(
    (student) => student.user.userDetails?.sex?.toLowerCase() === "female"
  ).length;
  const boysCount = selectedCourseStudents.filter(
    (student) => student.user.userDetails?.sex?.toLowerCase() === "male"
  ).length;
  const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const todayLectures =
    teacherSchedule.find((scheduleDay) => scheduleDay.day === todayName)?.classes.length || 0;

  return (
    <DashboardContent className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeader
          title={`Teacher Dashboard`}
          subtitle={`Track class mix, lectures, timetable, announcements, and your attendance, ${teacherName}.`}
        />

        <div className="w-full max-w-sm space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Class Focus
          </p>
          <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
            <SelectTrigger>
              <SelectValue placeholder={courses.length ? "Select class" : "No classes available"} />
            </SelectTrigger>
            <SelectContent>
              {courses.map((course) => (
                <SelectItem key={course.id} value={String(course.id)}>
                  {course.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error ? (
        <Card className="border-red-200 bg-red-50/60 dark:border-red-900/50 dark:bg-red-950/20">
          <CardContent className="flex items-center gap-2 p-4 text-sm text-red-600 dark:text-red-300">
            <AlertCircle className="h-4 w-4" />
            {error}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Students in Class"
          value={selectedCourseStudents.length}
          icon={<Users className="size-5" />}
          sub={selectedCourse ? selectedCourse.name : "Select a class"}
        />
        <StatCard
          label="Girls"
          value={girlsCount}
          icon={<GraduationCap className="size-5" />}
          color="text-pink-600"
          sub="In the selected class"
        />
        <StatCard
          label="Boys"
          value={boysCount}
          icon={<School className="size-5" />}
          color="text-sky-600"
          sub="In the selected class"
        />
        <StatCard
          label="Lectures Today"
          value={todayLectures}
          icon={<CalendarDays className="size-5" />}
          sub={todayName}
        />
        <StatCard
          label="Income Received"
          value={formatCurrency(incomeReceived)}
          icon={<BadgeIndianRupee className="size-5" />}
          sub="Successful wallet credits"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.25fr_0.9fr]">
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-brand-orange" />
              Subject and Class Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {courseLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading selected class details...
              </div>
            ) : selectedCourse ? (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{selectedCourse.name}</Badge>
                  <Badge variant="outline">
                    {selectedCourseLessons} lesson{selectedCourseLessons === 1 ? "" : "s"}
                  </Badge>
                  <Badge variant="outline">
                    {selectedCourseStudents.length} student{selectedCourseStudents.length === 1 ? "" : "s"}
                  </Badge>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-border/60 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Subject
                    </p>
                    <p className="mt-2 text-lg font-semibold text-foreground">{selectedCourse.name}</p>
                  </div>
                  <div className="rounded-xl border border-border/60 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Total Lessons
                    </p>
                    <p className="mt-2 text-lg font-semibold text-foreground">{selectedCourseLessons}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Derived from current assignments</p>
                  </div>
                  <div className="rounded-xl border border-border/60 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Student Mix
                    </p>
                    <p className="mt-2 text-lg font-semibold text-foreground">
                      {girlsCount} girls / {boysCount} boys
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">For the selected class</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Subjects
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {courses.map((course) => (
                      <Badge
                        key={course.id}
                        variant={String(course.id) === selectedCourseId ? "default" : "outline"}
                      >
                        {course.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                No courses are available yet, so class and subject details cannot be shown.
              </p>
            )}
          </CardContent>
        </Card>

        <AttendanceCard initialAttendance={attendance} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.35fr_0.85fr]">
        <WeeklySchedulePanel
          schedule={teacherSchedule}
          title="Weekly Teaching Timetable"
          description="Generated from the current course list because teacher timetable records are not stored yet."
          emptyMessage="No teaching slots generated yet."
        />
        <AnnouncementsCard initialAnnouncements={announcements} />
      </div>
    </DashboardContent>
  );
}


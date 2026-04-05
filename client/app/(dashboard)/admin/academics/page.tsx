"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { AcademicsControls } from "./_components/AcademicsControls";
import { CoursesTable } from "./_components/CoursesTable";
import { StudentsTable } from "./_components/StudentsTable";
import { AssignmentsTable } from "./_components/AssignmentsTable";
import { DeleteDialog } from "./_components/DeleteDialog";
import { api, courseApi, userApi, assignmentApi } from "@/services/api/client";
import { Course, AdminAssignment, Student } from "./_types";
import { BookOpen, ClipboardList, Loader2, Users } from "lucide-react";
import { toast } from "sonner";
import { useHasPermission } from "@/components/providers/permissions-provider";

export default function AcademicsPage() {
  const router = useRouter();
  const canCreateCourse = useHasPermission("create_course");
  const canManageCourse = useHasPermission("manage_course");
  const [tab, setTab] = useState("courses");
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<AdminAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [coursesRes, studentsRes, assignmentsRes] = await Promise.all([
        courseApi.getCourses(),
        userApi.getStudents(),
        assignmentApi.getAssignments(),
      ]);

      if (coursesRes.success) setCourses(coursesRes.data || []);
      if (studentsRes.success) setStudents(studentsRes.data || []);
      if (assignmentsRes.success) setAssignments(assignmentsRes.data || []);
    } catch (error) {
      console.error("Failed to fetch academics data:", error);
      toast.error("Failed to load academic data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddClick = () => {
    if (tab === "courses") {
      router.push("/dashboard/manager/classes");
      return;
    }

    if (tab === "students") {
      router.push("/dashboard/admin/students");
      return;
    }

    router.push("/dashboard/admin/assignments");
  };

  const handleEditClick = (course: Course) => {
    router.push(`/dashboard/manager/classes?courseId=${course.id}`);
  };

  const handleDelete = useCallback(async () => {
    if (deleteId === null) return;

    try {
      setDeleting(true);

      if (tab === "courses") {
        const response = await courseApi.deleteCourse(deleteId);
        if (!response.success) {
          throw new Error(response.message || "Failed to delete course");
        }
        setCourses((current) => current.filter((course) => String(course.id) !== String(deleteId)));
      } else if (tab === "assignments") {
        const response = await api.delete(`/academic/assignments/${deleteId}`);
        if (!response.success) {
          throw new Error(response.message || "Failed to delete assignment");
        }
        setAssignments((current) => current.filter((assignment) => String(assignment.id) !== String(deleteId)));
      } else {
        const response = await api.delete(`/user/delete/${deleteId}`);
        if (!response.success) {
          throw new Error(response.message || "Failed to delete student");
        }
        setStudents((current) => current.filter((student) => String(student.id) !== String(deleteId)));
      }

      toast.success(`${tab === "courses" ? "Course" : tab === "assignments" ? "Assignment" : "Student"} deleted`);
      setDeleteId(null);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  }, [deleteId, tab]);

  const statCards = [
    {
      label: "Courses",
      value: courses.length,
      icon: BookOpen,
      accent: "from-blue-500/20 to-cyan-500/10 border-blue-500/30",
    },
    {
      label: "Students",
      value: students.length,
      icon: Users,
      accent: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30",
    },
    {
      label: "Assignments",
      value: assignments.length,
      icon: ClipboardList,
      accent: "from-amber-500/20 to-orange-500/10 border-amber-500/30",
    },
  ];

  if (loading && courses.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="animate-pulse text-sm font-medium text-muted-foreground">Loading academic records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-card via-card to-card/70 p-5 md:p-6">
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-emerald-500/20 blur-3xl" />
        </div>

        <div className="relative space-y-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-black tracking-tight text-foreground md:text-3xl">Academic Operations</h2>
            <p className="text-sm text-muted-foreground">Manage courses, enrollments, and assignments from one workspace.</p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className={`rounded-2xl border bg-gradient-to-br ${stat.accent} p-4 backdrop-blur-sm`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">{stat.label}</p>
                    <Icon className="h-4 w-4 text-foreground/80" />
                  </div>
                  <p className="mt-2 text-2xl font-black leading-none text-foreground">{stat.value}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Tabs value={tab} onValueChange={setTab} className="flex-col gap-4">
        <div className="rounded-2xl border border-border/70 bg-card/70 p-3 md:p-4">
          <AcademicsControls
            tab={tab}
            search={search}
            onSearchChange={setSearch}
            onAddClick={handleAddClick}
            canAdd={canCreateCourse || canManageCourse}
          />
        </div>

        <TabsContent value="courses" className="mt-0">
          <Card className="overflow-hidden rounded-2xl border border-border/70 bg-card/90">
            <CardContent className="p-0">
              <CoursesTable
                courses={courses}
                search={search}
                onDelete={setDeleteId}
                onEdit={canManageCourse ? handleEditClick : undefined}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="mt-0">
          <Card className="overflow-hidden rounded-2xl border border-border/70 bg-card/90">
            <CardContent className="p-0">
              <StudentsTable students={students} search={search} onDelete={(id) => setDeleteId(id)} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="mt-0">
          <Card className="overflow-hidden rounded-2xl border border-border/70 bg-card/90">
            <CardContent className="p-0">
              <AssignmentsTable assignments={assignments} search={search} onDelete={(id) => setDeleteId(id)} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <DeleteDialog
        deleteId={deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        confirming={deleting}
      />
    </div>
  );
}

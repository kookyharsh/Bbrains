"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { AcademicsControls } from "./_components/AcademicsControls";
import { CoursesTable } from "./_components/CoursesTable";
import { StudentsTable } from "./_components/StudentsTable";
import { AssignmentsTable } from "./_components/AssignmentsTable";
import { AcademicsDialog } from "./_components/AcademicsDialog";
import { DeleteDialog } from "./_components/DeleteDialog";
import { courseApi, userApi, assignmentApi } from "@/lib/api-services";
import { Course, AdminAssignment, Student } from "./_types";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AcademicsPage() {
  const [tab, setTab] = useState("courses");
  const [search, setSearch] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState<"course" | "assignment" | "student">("course");
  const [deleteId, setDeleteId] = useState<number | string | null>(null);

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
        assignmentApi.getAssignments()
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
    if (tab === "courses") setDialogType("course");
    else if (tab === "students") setDialogType("student");
    else setDialogType("assignment");
    setShowDialog(true);
  };

  if (loading && courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse font-medium">Loading academic records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Academics</h1>

      <Tabs value={tab} onValueChange={setTab}>
        <AcademicsControls 
          tab={tab} 
          search={search} 
          onSearchChange={setSearch} 
          onAddClick={handleAddClick} 
        />

        <TabsContent value="courses">
          <Card>
            <CardContent className="p-0">
              <CoursesTable 
                courses={courses} 
                search={search} 
                onDelete={setDeleteId} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students">
          <Card>
            <CardContent className="p-0">
              <StudentsTable 
                students={students} 
                search={search} 
                onDelete={(id) => setDeleteId(id)} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments">
          <Card>
            <CardContent className="p-0">
              <AssignmentsTable 
                assignments={assignments} 
                search={search} 
                onDelete={(id) => setDeleteId(id)} 
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AcademicsDialog 
        open={showDialog} 
        onOpenChange={setShowDialog} 
        type={dialogType} 
        courses={courses} 
      />

      <DeleteDialog 
        deleteId={deleteId} 
        onClose={() => setDeleteId(null)} 
      />
    </div>
  );
}

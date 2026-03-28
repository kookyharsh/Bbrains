"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, CalendarDays, IndianRupee, Loader2, Plus, Users } from "lucide-react";
import { toast } from "sonner";
import { DashboardContent } from "@/components/dashboard-content";
import { WeeklySchedulePanel } from "@/features/schedule/components/WeeklySchedulePanel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { courseApi, type ClassTimetableEntry, type Course } from "@/services/api/client";
import { TimetableEditorDialog } from "./_components/TimetableEditorDialog";

type ClassFormState = {
  name: string;
  description: string;
  standard: string;
  subjectsText: string;
  feePerStudent: string;
  durationValue: string;
  durationUnit: "months" | "years";
  studentCapacity: string;
  timetable: ClassTimetableEntry[];
};

const standardOptions = [
  "1st Standard",
  "2nd Standard",
  "3rd Standard",
  "4th Standard",
  "5th Standard",
  "6th Standard",
  "7th Standard",
  "8th Standard",
  "9th Standard",
  "10th Standard",
  "11th Standard",
  "12th Standard",
  "FY BSc",
  "SY BSc",
  "TY BSc",
  "FY BCom",
  "SY BCom",
  "TY BCom",
  "FY BA",
  "SY BA",
  "TY BA",
  "FY BCA",
  "SY BCA",
  "TY BCA",
];

const emptyForm: ClassFormState = {
  name: "",
  description: "",
  standard: "",
  subjectsText: "",
  feePerStudent: "",
  durationValue: "",
  durationUnit: "months",
  studentCapacity: "",
  timetable: [],
};

function parseSubjects(value: string) {
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatCurrency(value?: number | string) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function toWeeklySchedule(course: Course | null) {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const timetable = course?.timetable || [];

  return days.map((day) => ({
    day,
    classes: timetable
      .filter((entry) => entry.day === day)
      .map((entry) => ({
        time: `${entry.startTime} - ${entry.endTime}`,
        subject: entry.subject,
        room: entry.room || "Room TBA",
      })),
  }));
}

function summarizeTimetable(timetable: ClassTimetableEntry[]) {
  const activeDays = new Set(timetable.map((entry) => entry.day)).size;
  return {
    totalSlots: timetable.length,
    activeDays,
  };
}

export default function ManagerClassesPage() {
  const [classes, setClasses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [timetableDialogOpen, setTimetableDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingClassId, setEditingClassId] = useState<Course["id"] | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<Course["id"] | null>(null);
  const [form, setForm] = useState<ClassFormState>(emptyForm);

  useEffect(() => {
    let mounted = true;

    async function loadClasses() {
      try {
        setLoading(true);
        const response = await courseApi.getCourses();
        if (mounted) {
          if (response.success) {
            const nextClasses = response.data || [];
            setClasses(nextClasses);
            setSelectedClassId((current) => current || nextClasses[0]?.id || null);
          } else {
            toast.error(response.message || "Failed to load classes");
          }
        }
      } catch (error) {
        console.error(error);
        if (mounted) toast.error("Failed to load classes");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadClasses();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredClasses = useMemo(() => {
    const query = search.toLowerCase();
    return classes.filter((course) => {
      if (!query) return true;
      return (
        course.name.toLowerCase().includes(query) ||
        (course.standard || "").toLowerCase().includes(query) ||
        (course.subjects || []).some((subject) => subject.toLowerCase().includes(query))
      );
    });
  }, [classes, search]);

  const selectedClass =
    filteredClasses.find((course) => course.id === selectedClassId) ||
    classes.find((course) => course.id === selectedClassId) ||
    null;
  const subjectSuggestions = useMemo(() => parseSubjects(form.subjectsText), [form.subjectsText]);
  const timetableSummary = useMemo(() => summarizeTimetable(form.timetable), [form.timetable]);

  function openCreateDialog() {
    setEditingClassId(null);
    setForm(emptyForm);
    setTimetableDialogOpen(false);
    setDialogOpen(true);
  }

  function openEditDialog(course: Course, openTimetable = false) {
    setEditingClassId(course.id);
    setForm({
      name: course.name,
      description: course.description || "",
      standard: course.standard || "",
      subjectsText: (course.subjects || []).join("\n"),
      feePerStudent: course.feePerStudent ? String(course.feePerStudent) : "",
      durationValue: course.durationValue ? String(course.durationValue) : "",
      durationUnit: course.durationUnit || "months",
      studentCapacity: course.studentCapacity ? String(course.studentCapacity) : "",
      timetable: course.timetable?.length ? course.timetable : [],
    });
    setDialogOpen(true);
    setTimetableDialogOpen(openTimetable);
  }

  function handleTimetableSave(timetable: ClassTimetableEntry[]) {
    setForm((current) => ({
      ...current,
      timetable,
    }));
    toast.success("Timetable assigned to this class");
  }

  async function handleSubmit() {
    const subjects = parseSubjects(form.subjectsText);
    const timetable = form.timetable.filter(
      (entry) => entry.subject.trim() && entry.day && entry.startTime && entry.endTime
    );

    if (!form.name.trim() || !form.standard.trim()) {
      toast.error("Class name and standard are required");
      return;
    }
    if (subjects.length === 0) {
      toast.error("Add at least one subject");
      return;
    }
    if (timetable.length === 0) {
      toast.error("Add at least one timetable entry");
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      standard: form.standard.trim(),
      subjects,
      feePerStudent: Number(form.feePerStudent || 0),
      durationValue: Number(form.durationValue || 0),
      durationUnit: form.durationUnit,
      studentCapacity: Number(form.studentCapacity || 0),
      timetable: timetable.map((entry) => ({
        ...entry,
        subject: entry.subject.trim(),
        room: entry.room?.trim() || "",
      })),
    };

    if (payload.feePerStudent < 0 || payload.durationValue <= 0 || payload.studentCapacity <= 0) {
      toast.error("Fees, duration, and student capacity must be valid positive values");
      return;
    }

    try {
      setSubmitting(true);
      const response = editingClassId
        ? await courseApi.updateCourse(editingClassId, payload)
        : await courseApi.createCourse(payload);

      if (!response.success || !response.data) {
        toast.error(response.message || "Failed to save class");
        return;
      }

      const savedClass = response.data;
      setClasses((current) =>
        editingClassId
          ? current.map((course) => (course.id === editingClassId ? savedClass : course))
          : [savedClass, ...current]
      );
      setSelectedClassId(savedClass.id);
      setTimetableDialogOpen(false);
      setDialogOpen(false);
      toast.success(editingClassId ? "Class updated" : "Class created");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save class");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(courseId: Course["id"]) {
    try {
      const response = await courseApi.deleteCourse(courseId);
      if (!response.success) {
        toast.error(response.message || "Failed to delete class");
        return;
      }

      setClasses((current) => current.filter((course) => course.id !== courseId));
      setSelectedClassId((current) => (current === courseId ? null : current));
      toast.success("Class deleted");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete class");
    }
  }

  return (
    <DashboardContent className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Class Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create classes, define standards, assign subjects, set student fees, and maintain a timetable for each class.
          </p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="size-4" />
          New Class
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Classes</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{classes.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Students Planned</p>
            <p className="mt-2 text-3xl font-bold text-foreground">
              {classes.reduce((sum, course) => sum + Number(course.studentCapacity || 0), 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Average Fee</p>
            <p className="mt-2 text-3xl font-bold text-foreground">
              {classes.length
                ? formatCurrency(
                    classes.reduce((sum, course) => sum + Number(course.feePerStudent || 0), 0) / classes.length
                  )
                : formatCurrency(0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Timetable Slots</p>
            <p className="mt-2 text-3xl font-bold text-foreground">
              {classes.reduce((sum, course) => sum + (course.timetable?.length || 0), 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="gap-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Classes</CardTitle>
                <CardDescription>Every class can carry its own standard, subjects, fee model, duration, and timetable.</CardDescription>
              </div>
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search classes, standards, or subjects"
                className="md:max-w-xs"
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Loading classes...
              </div>
            ) : filteredClasses.length === 0 ? (
              <p className="text-sm text-muted-foreground">No classes found yet.</p>
            ) : (
              filteredClasses.map((course) => {
                const enrolled = course._count?.enrollments ?? course.enrolledStudents ?? 0;
                return (
                  <div
                    key={course.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedClassId(course.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedClassId(course.id);
                      }
                    }}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      selectedClass?.id === course.id
                        ? "border-primary bg-primary/5"
                        : "border-border/70 bg-card hover:border-primary/40"
                    }`}
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-lg font-semibold text-foreground">{course.name}</p>
                          <Badge variant="outline">{course.standard || "Standard not set"}</Badge>
                        </div>
                        {course.description ? (
                          <p className="text-sm text-muted-foreground">{course.description}</p>
                        ) : null}
                        <div className="flex flex-wrap gap-2">
                          {(course.subjects || []).map((subject) => (
                            <Badge key={`${course.id}-${subject}`} variant="secondary">{subject}</Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 md:justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(event) => {
                            event.stopPropagation();
                            openEditDialog(course);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(event) => {
                            event.stopPropagation();
                            openEditDialog(course, true);
                          }}
                        >
                          Timetable
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={(event) => {
                            event.stopPropagation();
                            void handleDelete(course.id);
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      <div className="rounded-xl bg-muted/40 p-3">
                        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                          <IndianRupee className="size-3.5" />
                          Fee / Student
                        </div>
                        <p className="mt-2 text-lg font-semibold text-foreground">{formatCurrency(course.feePerStudent)}</p>
                      </div>
                      <div className="rounded-xl bg-muted/40 p-3">
                        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                          <CalendarDays className="size-3.5" />
                          Duration
                        </div>
                        <p className="mt-2 text-lg font-semibold text-foreground">
                          {course.durationValue} {course.durationUnit}
                        </p>
                      </div>
                      <div className="rounded-xl bg-muted/40 p-3">
                        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                          <Users className="size-3.5" />
                          Students
                        </div>
                        <p className="mt-2 text-lg font-semibold text-foreground">
                          {enrolled} / {course.studentCapacity || 0}
                        </p>
                      </div>
                      <div className="rounded-xl bg-muted/40 p-3">
                        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                          <BookOpen className="size-3.5" />
                          Timetable Slots
                        </div>
                        <p className="mt-2 text-lg font-semibold text-foreground">{course.timetable?.length || 0}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>{selectedClass ? `${selectedClass.name} timetable` : "Class preview"}</CardTitle>
            <CardDescription>
              {selectedClass
                ? `Timetable and class setup for ${selectedClass.standard || selectedClass.name}.`
                : "Select a class to preview its weekly timetable."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedClass ? (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-border/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Subjects</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(selectedClass.subjects || []).map((subject) => (
                        <Badge key={`${selectedClass.id}-subject-${subject}`} variant="secondary">{subject}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-border/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Duration And Fees</p>
                    <p className="mt-3 text-sm text-foreground">
                      {selectedClass.durationValue} {selectedClass.durationUnit} at {formatCurrency(selectedClass.feePerStudent)} per student
                    </p>
                  </div>
                </div>
                <WeeklySchedulePanel
                  schedule={toWeeklySchedule(selectedClass)}
                  title="Weekly Class Timetable"
                  description="Manager-defined timetable for this class"
                  emptyMessage="No timetable slots defined for this day."
                />
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No class selected.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setTimetableDialogOpen(false);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>{editingClassId ? "Edit class" : "Create class"}</DialogTitle>
            <DialogDescription>
              Define the standard, subject list, fee model, duration, class size, and a timetable for this class.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="class-name">Class Name</Label>
                <Input
                  id="class-name"
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Class A / BSc Computer Science"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="class-standard">Standard / Course</Label>
                <Input
                  id="class-standard"
                  list="class-standard-options"
                  value={form.standard}
                  onChange={(event) => setForm((current) => ({ ...current, standard: event.target.value }))}
                  placeholder="8th Standard / FY BCom / BSc 1st Year"
                />
                <datalist id="class-standard-options">
                  {standardOptions.map((option) => (
                    <option key={option} value={option} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="class-description">Description</Label>
              <Textarea
                id="class-description"
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                placeholder="Short description for the class"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="class-fee">Fee Per Student</Label>
                <Input
                  id="class-fee"
                  type="number"
                  min="0"
                  value={form.feePerStudent}
                  onChange={(event) => setForm((current) => ({ ...current, feePerStudent: event.target.value }))}
                  placeholder="2500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="class-duration-value">Duration</Label>
                <Input
                  id="class-duration-value"
                  type="number"
                  min="1"
                  value={form.durationValue}
                  onChange={(event) => setForm((current) => ({ ...current, durationValue: event.target.value }))}
                  placeholder="12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="class-duration-unit">Duration Unit</Label>
                <select
                  id="class-duration-unit"
                  value={form.durationUnit}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      durationUnit: event.target.value as "months" | "years",
                    }))
                  }
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="months">Months</option>
                  <option value="years">Years</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="class-capacity">Student Capacity</Label>
                <Input
                  id="class-capacity"
                  type="number"
                  min="1"
                  value={form.studentCapacity}
                  onChange={(event) => setForm((current) => ({ ...current, studentCapacity: event.target.value }))}
                  placeholder="40"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="class-subjects">Subjects</Label>
              <Textarea
                id="class-subjects"
                value={form.subjectsText}
                onChange={(event) => setForm((current) => ({ ...current, subjectsText: event.target.value }))}
                placeholder={`Add one subject per line\nMathematics\nScience\nEnglish`}
              />
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <Label>Timetable</Label>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Open the timetable popup to plan daily lectures, edit them later, and assign them to this class.
                    </p>
                  </div>
                  <Button type="button" variant="outline" onClick={() => setTimetableDialogOpen(true)}>
                    <CalendarDays className="mr-2 size-4" />
                    {form.timetable.length ? "Edit Timetable" : "Create Timetable"}
                  </Button>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-border/60 bg-background p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Lecture Slots</p>
                    <p className="mt-2 text-lg font-semibold text-foreground">{timetableSummary.totalSlots}</p>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-background p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Active Days</p>
                    <p className="mt-2 text-lg font-semibold text-foreground">{timetableSummary.activeDays}</p>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-background p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Subject Suggestions</p>
                    <p className="mt-2 text-lg font-semibold text-foreground">{subjectSuggestions.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={() => void handleSubmit()} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Saving...
                </>
              ) : editingClassId ? "Save Changes" : "Create Class"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TimetableEditorDialog
        open={timetableDialogOpen}
        onOpenChange={setTimetableDialogOpen}
        initialEntries={form.timetable}
        subjectSuggestions={subjectSuggestions}
        onSave={handleTimetableSave}
        saving={submitting}
      />
    </DashboardContent>
  );
}


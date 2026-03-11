"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Pencil, Trash2, BookOpen, ClipboardList } from "lucide-react";

const mockCourses = [
  { id: 1, name: "Advanced Mathematics", description: "Calculus, Linear Algebra", students: 120, teacher: "Dr. Smith" },
  { id: 2, name: "Physics 101", description: "Mechanics and Thermodynamics", students: 95, teacher: "Prof. Johnson" },
  { id: 3, name: "Computer Science", description: "Data Structures and Algorithms", students: 150, teacher: "Dr. Lee" },
  { id: 4, name: "English Literature", description: "Modern and Post-modern Literature", students: 80, teacher: "Ms. Davis" },
];

const mockAdminAssignments = [
  { id: 1, title: "Calculus Assignment 4", course: "Advanced Math", dueDate: "2026-03-10", submissions: 45, total: 120 },
  { id: 2, title: "Lab Report: Kinematics", course: "Physics 101", dueDate: "2026-03-08", submissions: 62, total: 95 },
  { id: 3, title: "Data Structures Quiz", course: "Computer Science", dueDate: "2026-02-28", submissions: 150, total: 150 },
  { id: 4, title: "Essay: Modern Literature", course: "English Literature", dueDate: "2026-03-05", submissions: 55, total: 80 },
];

export default function AcademicsPage() {
  const [tab, setTab] = useState("courses");
  const [search, setSearch] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState<"course" | "assignment">("course");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Academics</h1>

      <Tabs value={tab} onValueChange={setTab}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="courses"><BookOpen className="w-4 h-4 mr-1" /> Courses</TabsTrigger>
            <TabsTrigger value="assignments"><ClipboardList className="w-4 h-4 mr-1" /> Assignments</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Button onClick={() => { setDialogType(tab === "courses" ? "course" : "assignment"); setShowDialog(true); }}>
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </div>
        </div>

        <TabsContent value="courses">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course</TableHead>
                      <TableHead className="hidden sm:table-cell">Teacher</TableHead>
                      <TableHead>Students</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockCourses.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase())).map((course) => (
                      <TableRow key={course.id}>
                        <TableCell>
                          <p className="font-medium text-foreground">{course.name}</p>
                          <p className="text-xs text-muted-foreground">{course.description}</p>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground">{course.teacher}</TableCell>
                        <TableCell><Badge variant="secondary">{course.students}</Badge></TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="w-3.5 h-3.5" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(course.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Assignment</TableHead>
                      <TableHead className="hidden sm:table-cell">Course</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Submissions</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockAdminAssignments.filter(a => !search || a.title.toLowerCase().includes(search.toLowerCase())).map((a) => (
                      <TableRow key={a.id}>
                        <TableCell className="font-medium text-foreground">{a.title}</TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground">{a.course}</TableCell>
                        <TableCell className="text-muted-foreground">{a.dueDate}</TableCell>
                        <TableCell>
                          <Badge variant={a.submissions === a.total ? "default" : "secondary"}>
                            {a.submissions}/{a.total}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="w-3.5 h-3.5" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(a.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add {dialogType === "course" ? "Course" : "Assignment"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Title</Label><Input placeholder={`${dialogType === "course" ? "Course" : "Assignment"} title`} /></div>
            <div><Label>Description</Label><Textarea placeholder="Description" /></div>
            {dialogType === "assignment" && (
              <div><Label>Due Date</Label><Input type="date" /></div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowDialog(false)}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => setDeleteId(null)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

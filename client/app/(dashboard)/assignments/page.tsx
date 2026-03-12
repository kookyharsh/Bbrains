"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Upload,
  Download,
  Eye,
  Calendar,
  ChevronLeft,
  ChevronRight,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const mockAssignments = [
  {
    id: 1,
    title: "Calculus Assignment 4",
    description: "Complete chapters 5 to 7 exercises covering integration techniques.",
    course: "Advanced Math",
    teacher: "Dr. Smith",
    teacherInitial: "S",
    startDate: "2026-03-01",
    dueDate: "2026-03-10",
    status: "incomplete" as const,
    file: null,
  },
  {
    id: 2,
    title: "Lab Report: Kinematics",
    description: "Submit lab findings from the kinematics experiment.",
    course: "Physics 101",
    teacher: "Prof. Johnson",
    teacherInitial: "J",
    startDate: "2026-02-25",
    dueDate: "2026-03-08",
    status: "incomplete" as const,
    file: null,
  },
  {
    id: 3,
    title: "Essay: Modern Literature",
    description: "Write a 2000-word essay on post-modern literary themes.",
    course: "English Literature",
    teacher: "Ms. Davis",
    teacherInitial: "D",
    startDate: "2026-02-20",
    dueDate: "2026-03-05",
    status: "submitted" as const,
    file: "essay_draft.pdf",
  },
  {
    id: 4,
    title: "Data Structures Quiz",
    description: "Online quiz covering trees, graphs, and hash tables.",
    course: "Computer Science",
    teacher: "Dr. Lee",
    teacherInitial: "L",
    startDate: "2026-02-15",
    dueDate: "2026-02-28",
    status: "completed" as const,
    file: "quiz_answers.pdf",
  },
  {
    id: 5,
    title: "History Research Paper",
    description: "Research paper on the Industrial Revolution.",
    course: "World History",
    teacher: "Prof. Brown",
    teacherInitial: "B",
    startDate: "2026-02-10",
    dueDate: "2026-02-25",
    status: "completed" as const,
    file: "research_paper.pdf",
  },
];

const mockSubmissions = [
  { id: 1, title: "Essay: Modern Literature", date: "2026-02-20", submittedAt: "2026-03-04", grade: "A-", attachment: "essay_draft.pdf" },
  { id: 2, title: "Data Structures Quiz", date: "2026-02-15", submittedAt: "2026-02-27", grade: "A", attachment: "quiz_answers.pdf" },
  { id: 3, title: "History Research Paper", date: "2026-02-10", submittedAt: "2026-02-24", grade: "B+", attachment: "research_paper.pdf" },
  { id: 4, title: "Physics Lab 3", date: "2026-01-20", submittedAt: "2026-02-01", grade: "A", attachment: "lab3_report.pdf" },
  { id: 5, title: "Algebra Homework 5", date: "2026-01-15", submittedAt: "2026-01-28", grade: "B", attachment: "hw5.pdf" },
  { id: 6, title: "English Presentation", date: "2026-01-10", submittedAt: "2026-01-20", grade: "A+", attachment: "presentation.pptx" },
  { id: 7, title: "Chemistry Experiment", date: "2026-01-05", submittedAt: "2026-01-15", grade: "B+", attachment: "chem_exp.pdf" },
  { id: 8, title: "Art Portfolio", date: "2025-12-20", submittedAt: "2025-12-30", grade: "A", attachment: "portfolio.zip" },
  { id: 9, title: "Statistics Project", date: "2025-12-15", submittedAt: "2025-12-25", grade: "A-", attachment: "stats_project.pdf" },
  { id: 10, title: "Biology Essay", date: "2025-12-10", submittedAt: "2025-12-20", grade: "B+", attachment: "bio_essay.pdf" },
  { id: 11, title: "Math Test 2", date: "2025-12-01", submittedAt: "2025-12-10", grade: "A", attachment: "math_test2.pdf" },
  { id: 12, title: "Programming Assignment", date: "2025-11-25", submittedAt: "2025-12-05", grade: "A+", attachment: "code.zip" },
];

const statusConfig = {
  incomplete: { label: "Incomplete", color: "bg-destructive/10 text-destructive", icon: AlertCircle },
  submitted: { label: "Submitted", color: "bg-yellow-500/10 text-yellow-600", icon: Clock },
  completed: { label: "Completed", color: "bg-green-500/10 text-green-600", icon: CheckCircle2 },
};

export default function AssignmentsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewAssignment, setViewAssignment] = useState<typeof mockAssignments[0] | null>(null);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const itemsPerPage = 10;

  const filteredAssignments = mockAssignments.filter((a) => {
    if (activeTab !== "all" && a.status !== activeTab) return false;
    if (searchQuery && !a.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const totalPages = Math.ceil(mockSubmissions.length / itemsPerPage);
  const paginatedSubmissions = mockSubmissions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleUpload = (id: number) => {
    setUploadingId(id);
    setTimeout(() => setUploadingId(null), 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Assignments & Exams</h1>
        <p className="text-muted-foreground">View, search and submit your assignments</p>
      </div>

      {/* Premium Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-card/50 backdrop-blur-sm p-3 rounded-[24px] border border-border/40 shadow-sm mt-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search assignments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background/50 border-border/40 rounded-2xl h-11 focus-visible:ring-brand-purple"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
            <TabsList className="bg-muted/50 p-1 rounded-2xl h-11 flex items-center w-full sm:w-auto">
              {["all", "incomplete", "submitted", "completed"].map((tab) => (
                <TabsTrigger 
                  key={tab} 
                  value={tab} 
                  className="rounded-xl px-4 h-9 text-xs font-medium capitalize data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
                >
                  {tab === "all" ? "All" : tab}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-full sm:w-[140px] h-11 bg-background/50 border-border/40 rounded-2xl text-xs font-medium">
              <Calendar className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Date Filter" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/40">
              <SelectItem value="all">All dates</SelectItem>
              <SelectItem value="this-week">This week</SelectItem>
              <SelectItem value="this-month">This month</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content Area */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* We keep the tabs triggers here for structure but the logic is linked to the bar above */}

        <TabsContent value={activeTab} className="mt-4">
          <div className="grid gap-4">
            {filteredAssignments.map((assignment) => {
              const config = statusConfig[assignment.status];
              const StatusIcon = config.icon;
              return (
                <Card key={assignment.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Avatar className="w-10 h-10 shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            {assignment.teacherInitial}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-foreground truncate">{assignment.title}</h3>
                            <Badge variant="outline" className={config.color}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {config.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{assignment.description}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span>{assignment.teacher}</span>
                            <span>•</span>
                            <span>{assignment.course}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Due: {new Date(assignment.dueDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button variant="outline" size="sm" onClick={() => setViewAssignment(assignment)}>
                          <Eye className="w-4 h-4 mr-1" /> View
                        </Button>
                        {assignment.status === "incomplete" && (
                          <Button
                            size="sm"
                            onClick={() => handleUpload(assignment.id)}
                            disabled={uploadingId === assignment.id}
                          >
                            <Upload className="w-4 h-4 mr-1" />
                            {uploadingId === assignment.id ? "Uploading..." : "Submit"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {filteredAssignments.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No assignments found</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Submissions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Previous Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Sr.</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="hidden sm:table-cell">Assignment Date</TableHead>
                  <TableHead className="hidden md:table-cell">Submitted At</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead className="text-right">Attachment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedSubmissions.map((sub, idx) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium">{(currentPage - 1) * itemsPerPage + idx + 1}</TableCell>
                    <TableCell className="font-medium">{sub.title}</TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">{sub.date}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{sub.submittedAt}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{sub.grade}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Assignment Dialog */}
      <Dialog open={!!viewAssignment} onOpenChange={() => setViewAssignment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{viewAssignment?.title}</DialogTitle>
            <DialogDescription>{viewAssignment?.course}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-foreground">{viewAssignment?.description}</p>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>Teacher: {viewAssignment?.teacher}</span>
              <span>Due: {viewAssignment?.dueDate}</span>
            </div>
            <Badge variant="outline" className={viewAssignment ? statusConfig[viewAssignment.status].color : ""}>
              {viewAssignment ? statusConfig[viewAssignment.status].label : ""}
            </Badge>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

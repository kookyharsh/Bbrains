"use client";

import { useState, useEffect, useCallback } from "react";
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
  DialogFooter,
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
  Loader2,
  FileUp,
} from "lucide-react";
import { DashboardContent } from "@/components/dashboard-content";
import { assignmentApi, type Assignment } from "@/services/api/client";
import { toast } from "sonner";
import { useCloudinaryUpload } from "@/hooks/use-cloudinary-upload";

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
  const [viewAssignment, setViewAssignment] = useState<Assignment | null>(null);
  const [submitAssignment, setSubmitAssignment] = useState<Assignment | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const { uploadFile, isUploading } = useCloudinaryUpload();
  const itemsPerPage = 10;

  const fetchAssignments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await assignmentApi.getAssignments();
      if (response.success && response.data) {
        setAssignments(response.data);
      }
    } catch (error) {
      toast.error("Failed to load assignments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const filteredAssignments = assignments.filter((a) => {
    const status = a.status || "incomplete";
    if (activeTab !== "all" && status !== activeTab) return false;
    if (searchQuery && !a.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // For now, using mock for submissions table as we might need a separate endpoint for history
  const mockSubmissions = [
    { id: 1, title: "Essay: Modern Literature", date: "2026-02-20", submittedAt: "2026-03-04", grade: "A-", attachment: "essay_draft.pdf" },
  ];

  const totalPages = Math.ceil(mockSubmissions.length / itemsPerPage);
  const paginatedSubmissions = mockSubmissions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleFileSubmit = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !submitAssignment) return;

    const loadingToast = toast.loading("Uploading and submitting...");
    setSubmitting(true);
    try {
      const url = await uploadFile(file);
      if (url) {
        const res = await assignmentApi.submitAssignment({
          assignmentId: submitAssignment.id,
          content: `Submitted file: ${file.name}`,
          fileUrl: url
        });

        if (res.success) {
          toast.success("Assignment submitted successfully!", { id: loadingToast });
          setSubmitAssignment(null);
          fetchAssignments(); // Refresh list
        } else {
          toast.error(res.message || "Submission failed", { id: loadingToast });
        }
      }
    } catch (error) {
      toast.error("An error occurred", { id: loadingToast });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardContent className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Assignments & Exams</h1>
          <p className="text-muted-foreground">View, search and submit your assignments</p>
        </div>
        <Button variant="outline" onClick={fetchAssignments} disabled={loading} className="rounded-xl">
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Clock className="h-4 w-4 mr-2" />}
          Refresh List
        </Button>
      </div>

      {/* Filter Bar */}
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
      <div className="grid gap-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6 h-24 bg-muted/20" />
            </Card>
          ))
        ) : filteredAssignments.length > 0 ? (
          filteredAssignments.map((assignment) => {
            const status = assignment.status || "incomplete";
            const config = statusConfig[status as keyof typeof statusConfig];
            const StatusIcon = config.icon;
            return (
              <Card key={assignment.id} className="group hover:border-brand-purple/40 transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="h-12 w-12 rounded-2xl bg-brand-purple/10 flex items-center justify-center shrink-0">
                        <FileText className="h-6 w-6 text-brand-purple" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-foreground truncate">{assignment.title}</h3>
                          <Badge variant="outline" className={`${config.color} border-none font-bold uppercase text-[10px] tracking-widest`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {config.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate max-w-md">{assignment.description}</p>
                        <div className="flex items-center gap-3 mt-1.5 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <GraduationCap className="w-3 h-3" />
                            {assignment.course?.name}
                          </span>
                          <span className="h-1 w-1 rounded-full bg-border" />
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Due: {new Date(assignment.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setViewAssignment(assignment)}
                        className="rounded-xl hover:bg-brand-purple/5 text-brand-purple font-bold"
                      >
                        <Eye className="w-4 h-4 mr-1.5" /> Details
                      </Button>
                      {status === "incomplete" && (
                        <Button
                          size="sm"
                          onClick={() => setSubmitAssignment(assignment)}
                          className="rounded-xl bg-brand-purple hover:bg-brand-purple/90 text-white font-bold px-4"
                        >
                          <Upload className="w-4 h-4 mr-1.5" />
                          Submit
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="text-center py-16 bg-card/30 rounded-[32px] border border-dashed border-border/60">
            <div className="h-16 w-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-muted-foreground opacity-50" />
            </div>
            <h3 className="text-lg font-bold text-foreground">No assignments found</h3>
            <p className="text-sm text-muted-foreground">Check back later or adjust your filters</p>
          </div>
        )}
      </div>

      {/* Submissions Table */}
      <Card className="rounded-[32px] overflow-hidden border-border/40 shadow-sm">
        <CardHeader className="border-b border-border/40 bg-muted/10">
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Previous Submissions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/40">
                  <TableHead className="w-16 text-center font-black uppercase text-[10px] tracking-widest">Sr.</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest">Assignment Title</TableHead>
                  <TableHead className="hidden sm:table-cell font-black uppercase text-[10px] tracking-widest">Course</TableHead>
                  <TableHead className="hidden md:table-cell font-black uppercase text-[10px] tracking-widest">Submitted At</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest text-center">Grade</TableHead>
                  <TableHead className="text-right font-black uppercase text-[10px] tracking-widest px-6">File</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedSubmissions.map((sub, idx) => (
                  <TableRow key={sub.id} className="border-border/20 hover:bg-muted/5">
                    <TableCell className="text-center font-bold text-muted-foreground">{(currentPage - 1) * itemsPerPage + idx + 1}</TableCell>
                    <TableCell className="font-bold text-foreground">{sub.title}</TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">Physics 101</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{sub.submittedAt}</TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-brand-purple/10 text-brand-purple border-none font-black">{sub.grade}</Badge>
                    </TableCell>
                    <TableCell className="text-right px-6">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-brand-purple/10 text-brand-purple">
                        <Download className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between p-4 border-t border-border/20">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage === 1} 
                onClick={() => setCurrentPage(currentPage - 1)}
                className="h-8 w-8 p-0 rounded-lg"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage === totalPages} 
                onClick={() => setCurrentPage(currentPage + 1)}
                className="h-8 w-8 p-0 rounded-lg"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Assignment Dialog */}
      <Dialog open={!!viewAssignment} onOpenChange={() => setViewAssignment(null)}>
        <DialogContent className="rounded-[32px] sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">{viewAssignment?.title}</DialogTitle>
            <DialogDescription className="font-bold text-brand-purple">
              {viewAssignment?.course?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="bg-muted/30 p-4 rounded-2xl border border-border/20">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Description</h4>
              <p className="text-sm leading-relaxed text-foreground">{viewAssignment?.description || "No description provided."}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-brand-orange/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-brand-orange" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Due Date</p>
                  <p className="text-sm font-bold">{viewAssignment ? new Date(viewAssignment.dueDate).toLocaleDateString() : ""}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-brand-mint/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-brand-mint" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Status</p>
                  <p className="text-sm font-bold capitalize">{viewAssignment?.status || "Incomplete"}</p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setViewAssignment(null)} className="w-full rounded-2xl bg-brand-purple hover:bg-brand-purple/90 font-bold">
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Submit Assignment Dialog */}
      <Dialog open={!!submitAssignment} onOpenChange={() => !submitting && setSubmitAssignment(null)}>
        <DialogContent className="rounded-[32px] sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">Submit Assignment</DialogTitle>
            <DialogDescription className="font-bold">
              Upload your completed work for <span className="text-brand-purple">{submitAssignment?.title}</span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-8">
            <label 
              htmlFor="assignment-file"
              className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border/60 rounded-[32px] hover:border-brand-purple/40 hover:bg-brand-purple/5 transition-all cursor-pointer group"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <div className="h-16 w-16 bg-brand-purple/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <FileUp className="w-8 h-8 text-brand-purple" />
                </div>
                <p className="mb-2 text-sm font-bold text-foreground">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground uppercase font-black tracking-widest">
                  PDF, PNG, JPG or ZIP (MAX. 10MB)
                </p>
              </div>
              <input 
                id="assignment-file" 
                type="file" 
                className="hidden" 
                onChange={handleFileSubmit}
                disabled={submitting}
              />
            </label>
          </div>

          {submitting && (
            <div className="flex items-center justify-center gap-3 text-brand-purple font-bold italic">
              <Loader2 className="h-5 w-5 animate-spin" />
              Processing your submission...
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="ghost" 
              onClick={() => setSubmitAssignment(null)} 
              disabled={submitting}
              className="w-full rounded-2xl font-bold"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardContent>
  );
}

// Sub-components used in the render
function GraduationCap(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  );
}

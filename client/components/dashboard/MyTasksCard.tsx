"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Circle, Clock, AlertCircle, Upload, Plus, FileUp, Send, Loader2 } from "lucide-react";
import { assignmentApi, type Assignment } from "@/lib/api-services";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useCloudinaryUpload } from "@/hooks/use-cloudinary-upload";
import { toast } from "sonner";
import { format, isTomorrow, isToday, parseISO } from "date-fns";
import Link from "next/link";

export function MyTasksCard() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissionNote, setSubmissionNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { uploadFile, isUploading, progress } = useCloudinaryUpload();

  const fetchAssignments = async () => {
    try {
      const response = await assignmentApi.getAssignments();
      if (response.success && response.data) {
        setAssignments(response.data.slice(0, 3));
      }
    } catch (error) {
      console.error("Failed to fetch assignments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedAssignment) return;

    try {
      toast.loading("Uploading attachment...");
      const url = await uploadFile(file);
      if (url) {
        toast.success("File uploaded successfully");
        handleSubmit(url);
      } else {
        toast.error("Upload failed");
      }
    } catch (error) {
      toast.error("An error occurred during upload");
    }
  };

  const handleSubmit = async (fileUrl?: string) => {
    if (!selectedAssignment) return;
    
    setIsSubmitting(true);
    try {
      const res = await assignmentApi.submitAssignment({
        assignmentId: selectedAssignment.id,
        content: submissionNote || "Submitted via Dashboard",
        fileUrl: fileUrl
      });
      if (res.success) {
        toast.success("Assignment submitted successfully!");
        setSelectedAssignment(null);
        setSubmissionNote("");
        fetchAssignments(); // Refresh list
      } else {
        toast.error("Submission failed");
      }
    } catch (error) {
      toast.error("An error occurred during submission");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDueDateLabel = (dateStr: string) => {
    try {
      const date = parseISO(dateStr);
      if (isToday(date)) return "Today";
      if (isTomorrow(date)) return "Tomorrow";
      return format(date, "MMM dd");
    } catch (e) {
      return "Soon";
    }
  };

  return (
    <Card className="h-full border-border/40 shadow-sm overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-brand-purple" />
          My Tasks
        </CardTitle>
        <div className="flex items-center gap-2">
          <Dialog open={!!selectedAssignment} onOpenChange={(open) => !open && setSelectedAssignment(null)}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => assignments.length > 0 && setSelectedAssignment(assignments[0])}
                size="sm"
                className="bg-brand-purple hover:bg-brand-purple/90 text-white rounded-xl h-8 px-3 shadow-lg shadow-brand-purple/20 transition-all font-bold text-[10px]"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                UPLOAD ASSIGNMENT
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-3xl border-border/40 bg-card/95 backdrop-blur-md">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  <FileUp className="text-brand-purple h-5 w-5" />
                  Submit Assignment
                </DialogTitle>
                <DialogDescription className="text-sm font-medium pt-1">
                  {selectedAssignment?.title} ({selectedAssignment?.course?.name || "General"})
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Submission Note</label>
                  <Textarea 
                    placeholder="Add a few words about your work..."
                    value={submissionNote}
                    onChange={(e) => setSubmissionNote(e.target.value)}
                    className="rounded-2xl border-border/40 bg-background/50 focus:ring-brand-purple min-h-[100px]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Attachment</label>
                  <div className="relative group">
                    <input 
                      type="file" 
                      id="card-task-file-upload" 
                      className="hidden" 
                      onChange={handleFileChange}
                      disabled={isUploading || isSubmitting}
                    />
                    <label 
                      htmlFor="card-task-file-upload" 
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border/60 hover:border-brand-purple/50 rounded-2xl cursor-pointer bg-black/5 dark:bg-white/5 transition-all group-hover:scale-[0.99]"
                    >
                      <Upload className={`h-8 w-8 mb-2 ${isUploading ? 'animate-bounce text-brand-purple' : 'text-muted-foreground'}`} />
                      <span className="text-xs font-semibold text-muted-foreground">
                        {isUploading ? `Uploading ${progress}%...` : "Click to select file"}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
              <DialogFooter className="sm:justify-between gap-3">
                <Button variant="ghost" onClick={() => setSelectedAssignment(null)} className="rounded-xl">Cancel</Button>
                <Button 
                  onClick={() => handleSubmit()} 
                  disabled={isSubmitting || isUploading}
                  className="bg-brand-purple hover:bg-brand-purple/90 text-white rounded-xl shadow-lg shadow-brand-purple/10 px-6 font-bold"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                  Submit Final
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 mt-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 opacity-30">
              <Loader2 className="h-6 w-6 animate-spin mb-2" />
              <span className="text-[10px] tracking-widest uppercase font-bold">Fetching Tasks...</span>
            </div>
          ) : assignments.length > 0 ? (
            assignments.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 rounded-xl border border-border/30 bg-muted/10 hover:bg-muted/30 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-brand-purple/10 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-brand-purple" />
                  </div>
                  <div>
                    <p className="text-sm font-bold tracking-tight">{task.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                       <span className="text-[10px] font-bold text-brand-orange bg-brand-orange/10 px-1.5 py-0.5 rounded-md">
                        {getDueDateLabel(task.dueDate)}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-medium">
                        {task.course?.name || "General"}
                      </span>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={() => setSelectedAssignment(task)}
                  size="sm" 
                  variant="ghost" 
                  className="h-8 w-8 rounded-lg p-0 hover:bg-brand-purple hover:text-white transition-all opacity-0 group-hover:opacity-100"
                >
                  <Upload className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
              <CheckCircle2 className="h-10 w-10 mb-2 opacity-20 text-green-500" />
              <p className="text-xs font-bold uppercase tracking-widest">Great job! No pending tasks.</p>
            </div>
          )}
          
          <Link 
            href="/assignments" 
            className="flex items-center justify-center w-full py-2 mt-2 text-[11px] font-bold text-brand-purple bg-brand-purple/5 rounded-lg hover:bg-brand-purple/10 transition-all uppercase tracking-widest"
          >
            View All Assignments
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}


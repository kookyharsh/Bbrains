"use client"
import { useEffect, useState } from "react"
import { ClipboardList, Clock, Upload, Loader2, Plus, FileUp, Send, CheckCircle2 } from "lucide-react"
import { assignmentApi, type Assignment } from "@/lib/api-services"
import Link from "next/link"
import { format, isTomorrow, isToday, parseISO } from "date-fns"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useCloudinaryUpload } from "@/hooks/use-cloudinary-upload"
import { toast } from "sonner"

export function MyTasks() {
    const [assignments, setAssignments] = useState<Assignment[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
    const [submissionNote, setSubmissionNote] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { uploadFile, isUploading, progress } = useCloudinaryUpload()

    const fetchAssignments = async () => {
        try {
            const response = await assignmentApi.getAssignments()
            if (response.success && response.data) {
                setAssignments(response.data.slice(0, 3))
            }
        } catch (error) {
            console.error("Failed to fetch assignments:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAssignments()
    }, [])

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !selectedAssignment) return

        try {
            toast.loading("Uploading attachment...")
            const url = await uploadFile(file)
            if (url) {
                toast.success("File uploaded successfully")
                handleSubmit(url)
            } else {
                toast.error("Upload failed")
            }
        } catch (error) {
            toast.error("An error occurred during upload")
        }
    }

    const handleSubmit = async (fileUrl?: string) => {
        if (!selectedAssignment) return
        
        setIsSubmitting(true)
        try {
            const res = await assignmentApi.submitAssignment({
                assignmentId: selectedAssignment.id,
                content: submissionNote || "Submitted via Dashboard",
                fileUrl: fileUrl
            })
            if (res.success) {
                toast.success("Assignment submitted successfully!")
                setSelectedAssignment(null)
                setSubmissionNote("")
                fetchAssignments() // Refresh
            } else {
                toast.error("Submission failed")
            }
        } catch (error) {
            toast.error("An error occurred during submission")
        } finally {
            setIsSubmitting(false)
        }
    }

    const getDueDateLabel = (dateStr: string) => {
        try {
            const date = parseISO(dateStr)
            if (isToday(date)) return "Due Today"
            if (isTomorrow(date)) return "Due Tomorrow"
            return `Due ${format(date, "MMM dd")}`
        } catch (e) {
            return "Due soon"
        }
    }

    return (
        <div className="bg-ui-light-surface dark:bg-ui-dark-surface rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-ui-light-textPrimary dark:text-ui-dark-textPrimary flex items-center gap-2">
                    <ClipboardList className="text-brand-purple h-5 w-5" />
                    My Tasks
                </h3>
                
                <div className="flex items-center gap-3">
                    <Dialog open={!!selectedAssignment} onOpenChange={(open) => !open && setSelectedAssignment(null)}>
                        <DialogTrigger asChild>
                             <Button 
                                onClick={() => assignments.length > 0 && setSelectedAssignment(assignments[0])}
                                className="bg-brand-purple hover:bg-brand-purple/90 text-white rounded-xl h-10 px-4 shadow-lg shadow-brand-purple/20 transition-all font-bold text-xs"
                            >
                                <Plus className="h-4 w-4 mr-1.5" />
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
                                    {selectedAssignment?.title} ({selectedAssignment?.course?.name})
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
                                            id="task-file-upload" 
                                            className="hidden" 
                                            onChange={handleFileChange}
                                            disabled={isUploading || isSubmitting}
                                        />
                                        <label 
                                            htmlFor="task-file-upload" 
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
                                    className="bg-brand-purple hover:bg-brand-purple/90 text-white rounded-xl shadow-lg shadow-brand-purple/10 px-6"
                                >
                                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                                    Submit Final
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <Link className="hidden sm:block text-sm font-bold text-brand-purple hover:underline" href="/assignments">View All</Link>
                </div>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-1">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 text-ui-light-textSecondary">
                        <Loader2 className="h-8 w-8 animate-spin mb-2 opacity-20 text-brand-purple" />
                        <span className="text-[10px] uppercase tracking-[0.2em] font-black opacity-40">Synchronizing...</span>
                    </div>
                ) : assignments.length > 0 ? (
                    assignments.map((assignment) => (
                        <div key={assignment.id} className="group border border-gray-100 dark:border-gray-800 rounded-2xl p-4 hover:border-brand-purple/30 dark:hover:border-brand-purple/30 transition-all bg-ui-light-bg/50 dark:bg-ui-dark-bg/20 hover:shadow-lg hover:shadow-brand-purple/5">
                            <div className="flex justify-between items-start mb-3">
                                <span className="text-[10px] uppercase tracking-wider font-bold text-brand-purple bg-brand-purple/10 px-2.5 py-1 rounded-lg">
                                    {assignment.course?.name || "General"}
                                </span>
                                <span className="text-[11px] text-brand-orange font-bold flex items-center gap-1.5 bg-brand-orange/10 px-2.5 py-1 rounded-lg border border-brand-orange/20">
                                    <Clock className="h-3 w-3" />
                                    {getDueDateLabel(assignment.dueDate)}
                                </span>
                            </div>
                            <h4 className="text-[13px] font-bold text-ui-light-textPrimary dark:text-ui-dark-textPrimary mb-1 tracking-tight">{assignment.title}</h4>
                            <p className="text-[11px] text-ui-light-textSecondary dark:text-ui-dark-textSecondary line-clamp-1 mb-4 opacity-70 font-medium">{assignment.description || "No description provided."}</p>
                            <Button 
                                onClick={() => setSelectedAssignment(assignment)}
                                variant="secondary"
                                className="w-full flex items-center justify-center gap-2 h-9 rounded-xl text-xs font-bold bg-black/5 dark:bg-white/5 text-ui-light-textPrimary dark:text-ui-dark-textPrimary group-hover:bg-brand-purple group-hover:text-white transition-all shadow-sm"
                            >
                                <Upload className="h-3.5 w-3.5" />
                                UPLOAD WORK
                            </Button>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                        <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle2 className="h-6 w-6 text-green-600" />
                        </div>
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
                            No Pending Tasks Found.<br/>You&apos;re All Caught Up!
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

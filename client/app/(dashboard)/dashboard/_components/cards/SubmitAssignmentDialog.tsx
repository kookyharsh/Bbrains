"use client"

import { useState } from "react"
import { Plus, FileUp, Upload, Loader2, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription, 
    DialogFooter, 
    DialogTrigger 
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { assignmentApi, type Assignment } from "@/lib/api-services"
import { useCloudinaryUpload } from "@/hooks/use-cloudinary-upload"
import { toast } from "sonner"

interface SubmitAssignmentDialogProps {
    assignments: Assignment[]
    selectedAssignment: Assignment | null
    setSelectedAssignment: (assignment: Assignment | null) => void
    onSuccess: () => void
}

export function SubmitAssignmentDialog({ 
    assignments, 
    selectedAssignment, 
    setSelectedAssignment,
    onSuccess 
}: SubmitAssignmentDialogProps) {
    const [submissionNote, setSubmissionNote] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { uploadFile, isUploading, progress } = useCloudinaryUpload()

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
                onSuccess()
            } else {
                toast.error("Submission failed")
            }
        } catch (error) {
            toast.error("An error occurred during submission")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
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
    )
}

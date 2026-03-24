"use client"
import { useEffect, useState } from "react"
import { ClipboardList, Clock, Upload, Loader2, CheckCircle2 } from "lucide-react"
import { assignmentApi, type Assignment } from "@/services/api/client"
import Link from "next/link"
import { format, isTomorrow, isToday, parseISO } from "date-fns"
import { Button } from "@/components/ui/button"
import { SubmitAssignmentDialog } from "./SubmitAssignmentDialog"
import { toast } from "sonner"

export function MyTasks() {
    const [assignments, setAssignments] = useState<Assignment[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)

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
                    <SubmitAssignmentDialog 
                        assignments={assignments}
                        selectedAssignment={selectedAssignment}
                        setSelectedAssignment={setSelectedAssignment}
                        onSuccess={fetchAssignments}
                    />
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

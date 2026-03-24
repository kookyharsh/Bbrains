"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Check, X, Clock, Loader2, Calendar as CalendarIcon, Save, History, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog"
import { 
    Popover, PopoverContent, PopoverTrigger 
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Textarea } from "@/components/ui/textarea"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { attendanceApi, AttendanceRecord } from "@/services/api/client"
import { getAuthedClient } from "@/services/api/client"
import { SectionHeader } from "@/features/admin/components/SectionHeader"
import type { ApiUser } from "@/lib/types/api"
import { toast } from "sonner"

type AttendanceStatus = "present" | "absent" | "late"

interface StudentAttendance extends ApiUser {
    currentStatus?: AttendanceStatus
    currentNotes?: string
    isUpdating?: boolean
}

export default function AttendancePage() {
    const [date, setDate] = useState<Date>(new Date())
    const [students, setStudents] = useState<StudentAttendance[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    
    // For History View
    const [historyOpen, setHistoryOpen] = useState(false)
    const [selectedStudent, setSelectedStudent] = useState<StudentAttendance | null>(null)
    const [historyRecords, setHistoryRecords] = useState<AttendanceRecord[]>([])
    const [historyLoading, setHistoryLoading] = useState(false)

    const fetchStudentsAndAttendance = useCallback(async () => {
        try {
            setLoading(true)
            const client = await getAuthedClient()
            
            // 1. Fetch all students
            const studentsRes = await client.get<{ success: boolean; data: ApiUser[] }>("/user/students")
            const allStudents: StudentAttendance[] = studentsRes.data.data.map(s => ({ ...s }))
            
            // 2. Fetch attendance for selected date
            const formattedDate = format(date, "yyyy-MM-dd")
            const attendanceRes = await attendanceApi.getAttendance({ 
                startDate: formattedDate, 
                endDate: formattedDate 
            })
            
            if (attendanceRes.success && attendanceRes.data) {
                const records = attendanceRes.data
                // Map status back to students
                allStudents.forEach(student => {
                    const record = records.find(r => r.id === student.id || (r as any).userId === student.id)
                    if (record) {
                        student.currentStatus = record.status
                        student.currentNotes = record.notes
                    }
                })
            }
            
            setStudents(allStudents)
        } catch (error) {
            console.error("Failed to fetch attendance data:", error)
            toast.error("Failed to load attendance data")
        } finally {
            setLoading(false)
        }
    }, [date])

    useEffect(() => {
        fetchStudentsAndAttendance()
    }, [fetchStudentsAndAttendance])

    const handleMarkAttendance = async (studentId: string, status: AttendanceStatus, notes?: string) => {
        // Optimistic UI update
        setStudents(prev => prev.map(s => 
            s.id === studentId ? { ...s, currentStatus: status, currentNotes: notes, isUpdating: true } : s
        ))

        try {
            const res = await attendanceApi.markAttendance({
                studentId,
                date: format(date, "yyyy-MM-dd"),
                status,
                notes
            })

            if (!res.success) {
                throw new Error(res.message)
            }
            
            toast.success(`Marked ${status} for ${studentId}`)
        } catch (error) {
            console.error("Failed to mark attendance:", error)
            toast.error("Failed to save attendance")
            // Revert on error if needed or just re-fetch
            fetchStudentsAndAttendance()
        } finally {
            setStudents(prev => prev.map(s => 
                s.id === studentId ? { ...s, isUpdating: false } : s
            ))
        }
    }

    const markAllPresent = async () => {
        const unmarked = students.filter(s => !s.currentStatus)
        if (unmarked.length === 0) {
            toast.info("All students already have a status")
            return
        }

        toast.promise(
            Promise.all(unmarked.map(s => 
                attendanceApi.markAttendance({
                    studentId: s.id,
                    date: format(date, "yyyy-MM-dd"),
                    status: "present"
                })
            )),
            {
                loading: 'Marking all as present...',
                success: () => {
                    fetchStudentsAndAttendance()
                    return 'All students marked as present'
                },
                error: 'Failed to mark some students',
            }
        )
    }

    const viewHistory = async (student: StudentAttendance) => {
        setSelectedStudent(student)
        setHistoryOpen(true)
        setHistoryLoading(true)
        try {
            const res = await attendanceApi.getStudentHistory(student.id)
            if (res.success && res.data) {
                setHistoryRecords(res.data)
            }
        } catch (error) {
            toast.error("Failed to load history")
        } finally {
            setHistoryLoading(false)
        }
    }

    const filteredStudents = students.filter(s => 
        s.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${s.userDetails?.firstName} ${s.userDetails?.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const stats = {
        total: students.length,
        present: students.filter(s => s.currentStatus === "present").length,
        absent: students.filter(s => s.currentStatus === "absent").length,
        late: students.filter(s => s.currentStatus === "late").length,
        unmarked: students.filter(s => !s.currentStatus).length
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <SectionHeader 
                    title="Attendance Management" 
                    subtitle={`Manage daily attendance for your students`}
                />
                
                <div className="flex items-center gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className={cn("justify-start text-left font-normal w-[240px]", !date && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={(d) => d && setDate(d)}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                    <Button onClick={markAllPresent} disabled={loading || stats.unmarked === 0}>
                        Mark All Present
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <StatCard label="Total" value={stats.total} color="bg-blue-500/10 text-blue-500" />
                <StatCard label="Present" value={stats.present} color="bg-green-500/10 text-green-500" />
                <StatCard label="Absent" value={stats.absent} color="bg-red-500/10 text-red-500" />
                <StatCard label="Late" value={stats.late} color="bg-yellow-500/10 text-yellow-500" />
                <StatCard label="Unmarked" value={stats.unmarked} color="bg-gray-500/10 text-gray-500" />
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-bold">Student List</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search students..."
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <Loader2 className="h-8 w-8 animate-spin mb-4" />
                            <p>Loading students...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border text-left">
                                        <th className="pb-3 font-semibold px-4">Student</th>
                                        <th className="pb-3 font-semibold px-4 text-center">Status</th>
                                        <th className="pb-3 font-semibold px-4">Notes</th>
                                        <th className="pb-3 font-semibold px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filteredStudents.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="py-8 text-center text-muted-foreground">
                                                No students found matching your search.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredStudents.map((student) => (
                                            <tr key={student.id} className="group hover:bg-muted/50 transition-colors">
                                                <td className="py-4 px-4">
                                                    <div>
                                                        <p className="font-bold">
                                                            {student.userDetails?.firstName} {student.userDetails?.lastName}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">@{student.username}</p>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <AttendanceToggle 
                                                            status="present" 
                                                            active={student.currentStatus === "present"} 
                                                            onClick={() => handleMarkAttendance(student.id, "present", student.currentNotes)}
                                                            disabled={student.isUpdating}
                                                        />
                                                        <AttendanceToggle 
                                                            status="absent" 
                                                            active={student.currentStatus === "absent"} 
                                                            onClick={() => handleMarkAttendance(student.id, "absent", student.currentNotes)}
                                                            disabled={student.isUpdating}
                                                        />
                                                        <AttendanceToggle 
                                                            status="late" 
                                                            active={student.currentStatus === "late"} 
                                                            onClick={() => handleMarkAttendance(student.id, "late", student.currentNotes)}
                                                            disabled={student.isUpdating}
                                                        />
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <Input 
                                                            placeholder="Add note..." 
                                                            className="h-8 text-xs min-w-[150px]"
                                                            value={student.currentNotes || ""}
                                                            onChange={(e) => {
                                                                const val = e.target.value
                                                                setStudents(prev => prev.map(s => 
                                                                    s.id === student.id ? { ...s, currentNotes: val } : s
                                                                ))
                                                            }}
                                                            onBlur={() => {
                                                                if (student.currentStatus) {
                                                                    handleMarkAttendance(student.id, student.currentStatus, student.currentNotes)
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4 text-right">
                                                    <Button variant="ghost" size="sm" onClick={() => viewHistory(student)}>
                                                        <History className="h-4 w-4 mr-2" />
                                                        History
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* History Dialog */}
            <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Attendance History</DialogTitle>
                        <DialogDescription>
                            Recent attendance records for {selectedStudent?.userDetails?.firstName} {selectedStudent?.userDetails?.lastName}
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="flex-1 overflow-y-auto pr-2 mt-4">
                        {historyLoading ? (
                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                <Loader2 className="h-8 w-8 animate-spin mb-4" />
                                <p>Loading history...</p>
                            </div>
                        ) : historyRecords.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                                <p>No attendance records found for this student.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {historyRecords.map((record) => (
                                    <div key={record.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                                                record.status === "present" ? "bg-green-500/10 text-green-500" :
                                                record.status === "absent" ? "bg-red-500/10 text-red-500" : "bg-yellow-500/10 text-yellow-500"
                                            )}>
                                                {record.status === "present" ? <Check className="h-5 w-5" /> :
                                                 record.status === "absent" ? <X className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                                            </div>
                                            <div>
                                                <p className="font-bold">{format(new Date(record.date), "PPP")}</p>
                                                <p className="text-xs text-muted-foreground capitalize">{record.status}</p>
                                                {record.notes && (
                                                    <p className="text-xs text-foreground mt-1 bg-muted px-2 py-1 rounded inline-block">
                                                        Note: {record.notes}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        {record.marker && (
                                            <div className="text-right text-[10px] text-muted-foreground">
                                                <p>Marked by</p>
                                                <p className="font-medium text-foreground">
                                                    {record.marker.userDetails?.firstName} {record.marker.userDetails?.lastName || record.marker.username}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

function StatCard({ label, value, color }: { label: string, value: number, color: string }) {
    return (
        <Card className="overflow-hidden">
            <div className={cn("px-4 py-3", color)}>
                <p className="text-xs font-bold uppercase tracking-wider opacity-80">{label}</p>
                <p className="text-2xl font-bold mt-1">{value}</p>
            </div>
        </Card>
    )
}

function AttendanceToggle({ status, active, onClick, disabled }: { 
    status: AttendanceStatus, 
    active: boolean, 
    onClick: () => void,
    disabled?: boolean
}) {
    const config = {
        present: { icon: Check, activeClass: "bg-green-500 text-white border-green-500", hoverClass: "hover:border-green-500/50 hover:bg-green-500/10" },
        absent: { icon: X, activeClass: "bg-red-500 text-white border-red-500", hoverClass: "hover:border-red-500/50 hover:bg-red-500/10" },
        late: { icon: Clock, activeClass: "bg-yellow-500 text-white border-yellow-500", hoverClass: "hover:border-yellow-500/50 hover:bg-yellow-500/10" }
    }
    
    const { icon: Icon, activeClass, hoverClass } = config[status]

    return (
        <Button
            size="icon"
            variant="outline"
            className={cn(
                "h-9 w-9 rounded-full transition-all shrink-0",
                active ? activeClass : "bg-transparent text-muted-foreground border-border",
                !active && hoverClass
            )}
            onClick={onClick}
            disabled={disabled}
            title={status.charAt(0).toUpperCase() + status.slice(1)}
        >
            <Icon className="h-4 w-4" />
        </Button>
    )
}

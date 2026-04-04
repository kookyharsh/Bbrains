"use client"

import { CalendarDays, CheckCircle2, Clock, Code, FileText, FunctionSquare, MoreVertical, TestTube } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export interface PremiumAssignment {
    id: string
    title: string
    courseCode: string
    description: string
    dueDate: string
    teacherName: string
    teacherAvatar: string
    subjectType: "code" | "math" | "science" | "general"
    status: "active" | "completed"
    badgeText?: string
    badgeType?: "priority" | "exam" | "standard"
}

export function AssignmentCard({ assignment }: { assignment: PremiumAssignment }) {
    const isActive = assignment.status === "active"

    // Map subject types to specific colors and icons matching Stitch design
    const getSubjectDetails = (type: PremiumAssignment["subjectType"]) => {
        switch (type) {
            case "code":
                return {
                    bg: "bg-blue-50 dark:bg-blue-900/20",
                    text: "text-blue-600 dark:text-blue-400",
                    icon: <Code className="size-5" />
                }
            case "math":
                return {
                    bg: "bg-purple-50 dark:bg-purple-900/20",
                    text: "text-purple-600 dark:text-purple-400",
                    icon: <FunctionSquare className="size-5" />
                }
            case "science":
                return {
                    bg: "bg-green-50 dark:bg-green-900/20",
                    text: "text-green-600 dark:text-green-400",
                    icon: <TestTube className="size-5" />
                }
            default:
                return {
                    bg: "bg-gray-100 dark:bg-gray-800",
                    text: "text-gray-600 dark:text-gray-400",
                    icon: <FileText className="size-5" />
                }
        }
    }

    const getBadgeStyle = (badgeType?: PremiumAssignment["badgeType"]) => {
        switch (badgeType) {
            case "priority":
                return "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            case "exam":
                return "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
            case "standard":
                return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
        }
    }

    const formatShortDate = (dateStr: string) => {
        const d = new Date(dateStr)
        // e.g "Oct 15, 10:00 AM" or "Oct 15"
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    }

    const { bg, text, icon } = getSubjectDetails(assignment.subjectType)

    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 flex flex-col hover:shadow-md transition-shadow relative group">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${bg} ${text}`}>
                        {icon}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">{assignment.title.split(' ')[0]} {/* Short hack if needed, or mapping course name */}
                            Course
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{assignment.courseCode}</p>
                    </div>
                </div>
                {assignment.badgeText && (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBadgeStyle(assignment.badgeType)}`}>
                        {assignment.badgeText}
                    </span>
                )}
            </div>

            <h4 className="font-medium text-lg text-gray-900 dark:text-white mb-2 line-clamp-1">{assignment.title}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{assignment.description}</p>

            <div className="mt-auto space-y-4">
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        <Avatar className="w-6 h-6">
                            <AvatarImage src={assignment.teacherAvatar} />
                            <AvatarFallback name={assignment.teacherName} />
                        </Avatar>
                        <span className="truncate max-w-[120px]">{assignment.teacherName}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-900 dark:text-white font-medium shrink-0">
                        {isActive ? <Clock className="size-4 text-gray-500 dark:text-gray-400" /> : <CheckCircle2 className="size-4 text-green-500" />}
                        <span>{isActive ? `Due ${formatShortDate(assignment.dueDate)}` : `Submitted`}</span>
                    </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <button className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        View Details
                    </button>
                    {isActive && (
                        <button className="flex-1 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
                            Submit Task
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

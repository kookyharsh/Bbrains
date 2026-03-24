"use client"

import { Download } from "lucide-react"

export interface Submission {
    id: string
    srNo: number
    title: string
    dateDue: string
    submittedAt: string
    grade: string
    gradeType: "success" | "warning" | "pending"
}

interface PreviousSubmissionsTableProps {
    submissions: Submission[]
}

export function PreviousSubmissionsTable({ submissions }: PreviousSubmissionsTableProps) {
    const getGradeStyle = (type: Submission["gradeType"]) => {
        switch (type) {
            case "success":
                return "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            case "warning":
                return "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
            case "pending":
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
        }
    }

    return (
        <div className="mt-10">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Previous Submissions</h2>
                <button className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline">
                    View All
                </button>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400">
                            <tr>
                                <th className="px-6 py-4 font-medium w-16" scope="col">Sr. No</th>
                                <th className="px-6 py-4 font-medium" scope="col">Title</th>
                                <th className="px-6 py-4 font-medium" scope="col">Date Due</th>
                                <th className="px-6 py-4 font-medium" scope="col">Submitted At</th>
                                <th className="px-6 py-4 font-medium" scope="col">Grade</th>
                                <th className="px-6 py-4 font-medium text-right" scope="col">Attachment</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {submissions.map((sub) => (
                                <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{sub.srNo}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{sub.title}</td>
                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{sub.dateDue}</td>
                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{sub.submittedAt}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGradeStyle(sub.gradeType)}`}>
                                            {sub.grade}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                                            title="Download submission"
                                        >
                                            <Download className="size-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {submissions.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                        No previous submissions found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

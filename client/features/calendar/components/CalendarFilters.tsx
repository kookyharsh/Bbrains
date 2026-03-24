"use client"

import { Filter, Plus, ChevronDown } from "lucide-react"

interface CalendarFiltersProps {
    activeView: "day" | "week" | "month"
    onViewChange: (view: "day" | "week" | "month") => void
}

export function CalendarFilters({ activeView, onViewChange }: CalendarFiltersProps) {
    const categories = ["All Events", "Classes", "Exams", "Assignments", "Extracurricular"]

    return (
        <div className="mb-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Schedule</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">View your upcoming classes, exams, and extracurricular activities.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                        <button
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${activeView === 'day' ? 'bg-white dark:bg-gray-950 text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
                            onClick={() => onViewChange("day")}
                        >
                            Day
                        </button>
                        <button
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${activeView === 'week' ? 'bg-white dark:bg-gray-950 text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
                            onClick={() => onViewChange("week")}
                        >
                            Week
                        </button>
                        <button
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${activeView === 'month' ? 'bg-white dark:bg-gray-950 text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
                            onClick={() => onViewChange("month")}
                        >
                            Month
                        </button>
                    </div>

                    <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <Filter className="size-4" />
                        Filters
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
                        <Plus className="size-4" />
                        <span className="hidden sm:inline">New Event</span>
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
                {categories.map((category, idx) => (
                    <button
                        key={category}
                        className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${idx === 0
                                ? "bg-black dark:bg-white text-white dark:text-black"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                            }`}
                    >
                        {category}
                    </button>
                ))}
            </div>

            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-4">
                    January 2025
                </h2>
                <div className="flex items-center gap-2">
                    <button className="p-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <ChevronDown className="size-5 rotate-90" />
                    </button>
                    <button className="p-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <ChevronDown className="size-5 -rotate-90" />
                    </button>
                    <button className="ml-2 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded">
                        Today
                    </button>
                </div>
            </div>
        </div>
    )
}

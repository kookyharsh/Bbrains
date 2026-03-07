"use client"

import { Filter, Bell, Search } from "lucide-react"

export function AssignmentsHeader() {
    return (
        <div className="space-y-8">
            <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-6 flex-shrink-0 transition-colors duration-200">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <span>Dashboard</span>
                    <span className="material-icons text-sm">chevron_right</span>
                    <span className="font-medium text-gray-900 dark:text-white">Assignments & Exams</span>
                </div>
                <div className="flex items-center gap-4">
                    <button className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors relative">
                        <Bell className="size-5" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
                    </button>
                    <div className="w-px h-6 bg-gray-200 dark:bg-gray-700"></div>
                    <button className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        <span className="material-icons text-sm">add</span>
                        New Request
                    </button>
                </div>
            </header>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Assignments & Exams</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your pending tasks and view upcoming assessments.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl size-5" />
                        <input
                            className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white w-full md:w-64 transition-shadow outline-none"
                            placeholder="Search tasks..."
                            type="text"
                        />
                    </div>

                    <div className="flex items-center gap-2 border border-gray-200 dark:border-gray-700 rounded-lg p-1 bg-white dark:bg-gray-900">
                        <input aria-label="Before date" className="border-none bg-transparent text-sm text-gray-900 dark:text-white focus:ring-0 p-1.5 outline-none" type="date" />
                        <span className="text-gray-500 dark:text-gray-400 text-sm">-</span>
                        <input aria-label="After date" className="border-none bg-transparent text-sm text-gray-900 dark:text-white focus:ring-0 p-1.5 outline-none" type="date" />
                    </div>

                    <button className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center">
                        <Filter className="size-5" />
                    </button>
                </div>
            </div>
        </div>
    )
}

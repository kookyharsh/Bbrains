"use client"

interface AssignmentsTabsProps {
    activeTab: string
    onTabChange: (tab: string) => void
    counts: {
        all: number
        incomplete: number
        submitted: number
        completed: number
    }
}

export function AssignmentsTabs({ activeTab, onTabChange, counts }: AssignmentsTabsProps) {
    const tabs = [
        { id: "all", label: "All" },
        { id: "incomplete", label: "Incomplete" },
        { id: "submitted", label: "Submitted", count: counts.submitted },
        { id: "completed", label: "Completed" },
    ]

    return (
        <div className="border-b border-gray-200 dark:border-gray-800 mb-6">
            <nav aria-label="Tabs" className="flex gap-6">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`
                                py-4 px-1 text-sm font-medium transition-colors flex items-center gap-2 border-b-2
                                ${isActive
                                    ? "border-black dark:border-white text-black dark:text-white"
                                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600"
                                }
                            `}
                        >
                            {tab.label}
                            {tab.count !== undefined && tab.count > 0 && (
                                <span className={`text-xs px-2 py-0.5 rounded-full ${isActive ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'}`}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    )
                })}
            </nav>
        </div>
    )
}

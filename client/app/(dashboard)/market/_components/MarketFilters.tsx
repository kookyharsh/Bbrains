"use client"

import { Filter, Plus } from "lucide-react"

const categories = ["All Items", "Textbooks", "Electronics", "Furniture", "Clothing"]

export function MarketFilters() {
    return (
        <div className="space-y-6 mb-8">
            <div className="flex items-center justify-end">
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <Filter className="h-4 w-4" />
                        Filters
                        <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-1.5 rounded-full text-xs ml-1">3</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
                        <Plus className="h-4 w-4" />
                        Sell Item
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {categories.map((category, index) => (
                    <button
                        key={category}
                        className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${index === 0
                                ? "bg-black dark:bg-white text-white dark:text-black"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                            }`}
                    >
                        {category}
                    </button>
                ))}
            </div>
        </div>
    )
}

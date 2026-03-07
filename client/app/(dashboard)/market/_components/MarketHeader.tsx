"use client"

import { ChevronRight, Bell, Search, ShoppingCart } from "lucide-react"

export function MarketHeader() {
    return (
        <header className="h-20 flex items-center justify-between px-8 border-b border-gray-100 dark:border-gray-800 shrink-0">
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <span className="hover:text-gray-900 dark:hover:text-white cursor-pointer transition-colors">Bbrains</span>
                <ChevronRight className="mx-2 h-4 w-4" />
                <span className="font-medium text-gray-900 dark:text-white">Campus Market</span>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        className="w-64 pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border-none rounded-full text-sm focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700 outline-none text-gray-900 dark:text-white placeholder-gray-400"
                        placeholder="Search products..."
                        type="text"
                    />
                </div>

                <button className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors relative">
                    <Bell className="h-5 w-5" />
                </button>

                <button className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors relative">
                    <ShoppingCart className="h-5 w-5" />
                    <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-950"></span>
                </button>
            </div>
        </header>
    )
}

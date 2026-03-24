import { ChevronRight, Bell, Search } from "lucide-react"

export function ChatHeader() {
    return (
        <header className="h-16 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 bg-white dark:bg-gray-800 shrink-0">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <a className="hover:text-primary dark:hover:text-white transition-colors" href="#">Bbrains</a>
                <ChevronRight className="h-4 w-4" />
                <span className="font-medium text-gray-900 dark:text-white">Global Chat</span>
            </div>
            <div className="flex items-center gap-4">
                <button className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-white transition-colors relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                <button className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-white transition-colors">
                    <Search className="h-5 w-5" />
                </button>
                <div className="w-px h-6 bg-gray-200 dark:bg-gray-700"></div>
                <button className="flex items-center gap-2 lg:hidden text-gray-500">
                    <span className="material-icons">people</span>
                </button>
            </div>
        </header>
    )
}

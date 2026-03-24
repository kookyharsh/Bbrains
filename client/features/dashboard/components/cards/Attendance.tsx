import { ClipboardCheck } from "lucide-react"

export function Attendance() {
    return (
        <div className="bg-ui-light-surface dark:bg-ui-dark-surface rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-base font-semibold text-ui-light-textPrimary dark:text-ui-dark-textPrimary flex items-center gap-2">
                    <ClipboardCheck className="text-brand-purple h-5 w-5" />
                    Attendance
                </h3>
                <select className="text-xs bg-ui-light-bg dark:bg-ui-dark-bg border-none rounded-lg text-ui-light-textSecondary dark:text-ui-dark-textPrimary py-1 pl-2 pr-6 focus:ring-0 cursor-pointer">
                    <option>This Week</option>
                    <option>Last Week</option>
                    <option>This Month</option>
                </select>
            </div>
            <div className="flex items-center justify-between mt-2">
                <div className="relative w-24 h-24 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path className="text-gray-100 dark:text-gray-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="100, 100" strokeWidth="4"></path>
                        <path className="text-brand-mint" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="85, 100" strokeWidth="4"></path>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xl font-bold text-ui-light-textPrimary dark:text-ui-dark-textPrimary">85%</span>
                    </div>
                </div>
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-brand-mint"></span>
                        <div className="flex flex-col">
                            <span className="text-xs text-ui-light-textSecondary dark:text-ui-dark-textSecondary">Present</span>
                            <span className="text-sm font-semibold text-ui-light-textPrimary dark:text-ui-dark-textPrimary">12 Classes</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-brand-orange"></span>
                        <div className="flex flex-col">
                            <span className="text-xs text-ui-light-textSecondary dark:text-ui-dark-textSecondary">Absent</span>
                            <span className="text-sm font-semibold text-ui-light-textPrimary dark:text-ui-dark-textPrimary">2 Classes</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

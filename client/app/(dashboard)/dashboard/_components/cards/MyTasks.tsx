import { ClipboardList, Clock, Upload } from "lucide-react"

export function MyTasks() {
    return (
        <div className="bg-ui-light-surface dark:bg-ui-dark-surface rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-ui-light-textPrimary dark:text-ui-dark-textPrimary flex items-center gap-2">
                    <ClipboardList className="text-brand-purple h-5 w-5" />
                    My Tasks
                </h3>
                <a className="text-sm text-brand-purple hover:underline" href="#">View All</a>
            </div>
            <div className="space-y-4">
                <div className="group border border-gray-100 dark:border-gray-700 rounded-xl p-4 hover:border-brand-purple dark:hover:border-brand-purple transition-colors bg-ui-light-bg dark:bg-ui-dark-bg">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-brand-purple bg-brand-purple/10 px-2 py-1 rounded-md">Advanced Math</span>
                        <span className="text-[11px] text-brand-orange font-medium flex items-center gap-1 bg-brand-orange/10 px-2 py-1 rounded-md border border-brand-orange/20">
                            <Clock className="h-3 w-3" />
                            Due Tomorrow
                        </span>
                    </div>
                    <h4 className="text-sm font-semibold text-ui-light-textPrimary dark:text-ui-dark-textPrimary mb-1">Calculus Assignment 4</h4>
                    <p className="text-xs text-ui-light-textSecondary dark:text-ui-dark-textSecondary line-clamp-1 mb-3">Complete chapters 5 to 7 exercises.</p>
                    <button className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg bg-black/5 dark:bg-white/5 text-ui-light-textPrimary dark:text-ui-dark-textPrimary group-hover:bg-brand-purple group-hover:text-white transition-colors">
                        <Upload className="h-4 w-4" />
                        Upload Work
                    </button>
                </div>

                <div className="group border border-gray-100 dark:border-gray-700 rounded-xl p-4 hover:border-brand-purple dark:hover:border-brand-purple transition-colors bg-ui-light-bg dark:bg-ui-dark-bg">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-brand-mint bg-brand-mint/10 dark:text-brand-mint/90 px-2 py-1 rounded-md">Physics 101</span>
                        <span className="text-[11px] text-ui-light-textSecondary dark:text-ui-dark-textSecondary font-medium flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Oct 29
                        </span>
                    </div>
                    <h4 className="text-sm font-semibold text-ui-light-textPrimary dark:text-ui-dark-textPrimary mb-1">Lab Report: Kinematics</h4>
                    <button className="w-full mt-3 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg bg-black/5 dark:bg-white/5 text-ui-light-textPrimary dark:text-ui-dark-textPrimary group-hover:bg-brand-purple group-hover:text-white transition-colors">
                        <Upload className="h-4 w-4" />
                        Upload Work
                    </button>
                </div>
            </div>
        </div>
    )
}

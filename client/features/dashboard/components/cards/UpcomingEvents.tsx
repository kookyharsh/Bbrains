import { Calendar, Filter, Clock, MapPin, Video, Info } from "lucide-react"

export function UpcomingEvents() {
    return (
        <div className="bg-ui-light-surface dark:bg-ui-dark-surface rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-ui-light-textPrimary dark:text-ui-dark-textPrimary flex items-center gap-2">
                    <Calendar className="text-brand-purple h-5 w-5" />
                    Upcoming Events
                </h3>
                <button className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-ui-light-textSecondary hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <Filter className="h-4 w-4" />
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 xl:gap-6">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-4 p-4 rounded-xl bg-brand-purple/5 border border-brand-purple/20">
                    <div className="flex flex-col items-center justify-center w-14 h-14 bg-white dark:bg-ui-dark-surface rounded-lg shadow-sm border border-brand-purple/20 shrink-0">
                        <span className="text-[10px] font-bold text-brand-purple uppercase">Oct</span>
                        <span className="text-lg font-bold text-ui-light-textPrimary dark:text-ui-dark-textPrimary leading-none mt-0.5">28</span>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-ui-light-textPrimary dark:text-ui-dark-textPrimary mb-1">Campus Tech Fair</h4>
                        <div className="flex flex-col gap-1 text-[11px] text-ui-light-textSecondary dark:text-ui-dark-textSecondary font-medium">
                            <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> 10:00 AM</span>
                            <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Main Hall</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-4 p-4 rounded-xl bg-brand-mint/5 border border-brand-mint/30">
                    <div className="flex flex-col items-center justify-center w-14 h-14 bg-white dark:bg-ui-dark-surface rounded-lg shadow-sm border border-brand-mint/40 shrink-0">
                        <span className="text-[10px] font-bold text-brand-mint uppercase">Nov</span>
                        <span className="text-lg font-bold text-ui-light-textPrimary dark:text-ui-dark-textPrimary leading-none mt-0.5">02</span>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-ui-light-textPrimary dark:text-ui-dark-textPrimary mb-1">Guest Lecture: AI</h4>
                        <div className="flex flex-col gap-1 text-[11px] text-ui-light-textSecondary dark:text-ui-dark-textSecondary font-medium">
                            <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> 2:00 PM</span>
                            <span className="flex items-center gap-1.5"><Video className="h-3.5 w-3.5" /> Online</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-4 p-4 rounded-xl bg-brand-orange/5 border border-brand-orange/30">
                    <div className="flex flex-col items-center justify-center w-14 h-14 bg-white dark:bg-ui-dark-surface rounded-lg shadow-sm border border-brand-orange/40 shrink-0">
                        <span className="text-[10px] font-bold text-brand-orange uppercase">Nov</span>
                        <span className="text-lg font-bold text-ui-light-textPrimary dark:text-ui-dark-textPrimary leading-none mt-0.5">15</span>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-ui-light-textPrimary dark:text-ui-dark-textPrimary mb-1">Midterm Exams Begin</h4>
                        <div className="flex flex-col gap-1 text-[11px] text-ui-light-textSecondary dark:text-ui-dark-textSecondary font-medium">
                            <span className="flex items-center gap-1.5"><Info className="h-3.5 w-3.5" /> All Campus</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

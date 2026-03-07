import { Flame } from "lucide-react"

export function DailyReward() {
    return (
        <div className="bg-gradient-to-br from-brand-purple/90 to-brand-purple rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-semibold opacity-90">Daily Reward</h3>
                        <p className="text-3xl font-bold mt-1">+50 <span className="text-sm font-medium opacity-80">pts</span></p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1 flex items-center gap-1.5">
                        <Flame className="text-brand-orange h-4 w-4" />
                        <span className="font-bold text-sm">12 Day Streak</span>
                    </div>
                </div>
                <button className="mt-6 w-full bg-white text-brand-purple hover:bg-gray-50 font-semibold py-2.5 rounded-xl transition-colors shadow-sm">
                    Claim Points
                </button>
            </div>
        </div>
    )
}

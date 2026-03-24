import { Trophy, Flame } from "lucide-react"

export function TopStudents() {
    return (
        <div className="bg-ui-light-surface dark:bg-ui-dark-surface rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-ui-light-textPrimary dark:text-ui-dark-textPrimary flex items-center gap-2">
                    <Trophy className="text-brand-orange h-5 w-5" />
                    Top Students
                </h3>
                <div className="flex bg-ui-light-bg dark:bg-ui-dark-bg rounded-lg p-1 hidden sm:flex">
                    <button className="px-3 py-1 text-xs font-medium rounded-md bg-ui-light-surface dark:bg-ui-dark-surface text-ui-light-textPrimary dark:text-ui-dark-textPrimary shadow-sm">Weekly</button>
                    <button className="px-3 py-1 text-xs font-medium rounded-md text-ui-light-textSecondary hover:text-ui-light-textPrimary dark:text-ui-dark-textSecondary dark:hover:text-white">Monthly</button>
                    <button className="px-3 py-1 text-xs font-medium rounded-md text-ui-light-textSecondary hover:text-ui-light-textPrimary dark:text-ui-dark-textSecondary dark:hover:text-white">All Time</button>
                </div>
            </div>
            <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-brand-orange/10 border border-brand-orange/20">
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-brand-orange text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">1</div>
                        <img alt="Student" className="w-10 h-10 rounded-full border-2 border-white dark:border-ui-dark-surface shrink-0" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBbP3bJ7eEm9ihb4Ut1SAeC2Qp5BOcHmGZC1G8DpGMYTzHg8oOg21vesfkmE6rsyTRnd-Lkf2SJ1CBGxBGjtKPmzQqFqiMrSoVEteNyl76b6dheR1eeq7Fl5XXnX8UsxsV1VdJEgaBoq8IUNro1_ETZiVPRg0mQGgTMQugE8QI9BmVDQMnfwCnCUUP0livipHJO1L1zdf8v2lkRBUOqiuhiO-qmzEHe3XbzD7vtZd0rpu9mlFsldAB_KgtwKyAeboPGHEMPgU45Rvt2" />
                        <div className="min-w-0">
                            <h4 className="text-sm font-semibold text-ui-light-textPrimary dark:text-ui-dark-textPrimary truncate">Sarah Jenkins</h4>
                            <p className="text-xs text-ui-light-textSecondary dark:text-ui-dark-textSecondary truncate">Computer Science</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-ui-light-textPrimary dark:text-ui-dark-textPrimary">12,450</p>
                            <p className="text-[10px] text-ui-light-textSecondary dark:text-ui-dark-textSecondary uppercase tracking-wide">Points</p>
                        </div>
                        <div className="flex items-center gap-1 bg-ui-light-surface dark:bg-ui-dark-bg px-2 py-1 rounded-md shadow-sm border border-gray-100 dark:border-gray-700">
                            <Flame className="text-brand-orange h-4 w-4" />
                            <span className="text-xs font-bold text-ui-light-textSecondary dark:text-ui-dark-textSecondary">45</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors border border-transparent">
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-ui-light-bg dark:bg-ui-dark-bg text-ui-light-textSecondary dark:text-ui-dark-textSecondary flex items-center justify-center font-bold text-sm shrink-0">2</div>
                        <img alt="Student" className="w-10 h-10 rounded-full border-2 border-white dark:border-ui-dark-surface shrink-0" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBEnEcqzCaHAr_gs-v05uZZiG4t4A9J-0YiTRM7Ku3St53bwjfNa7lOG1OIVim7jNSsJ4mmmsybO7KkNnFzzikmhgwRm6ARRNx8usiGDZZFXV_Rwc7aRlZHoOZmGl1i91Czzd-8OnQNyzkFct_Myjog30zpEERefuiu-aw3N2ee0DNKSkuLcmcKY537axXUH-ERGjqC2Fk3P6xqt6LHOGxR_TrTT-UjEm1Z-bZhwBdPmhF-FmWqh--6n5Yam_XCpgSKvm0RjDtAWEYv" />
                        <div className="min-w-0">
                            <h4 className="text-sm font-semibold text-ui-light-textPrimary dark:text-ui-dark-textPrimary flex items-center gap-2 truncate">Michael Chang</h4>
                            <p className="text-xs text-ui-light-textSecondary dark:text-ui-dark-textSecondary truncate">Engineering</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-ui-light-textPrimary dark:text-ui-dark-textPrimary">11,200</p>
                            <p className="text-[10px] text-ui-light-textSecondary dark:text-ui-dark-textSecondary uppercase tracking-wide">Points</p>
                        </div>
                        <div className="flex items-center gap-1 bg-ui-light-surface dark:bg-ui-dark-bg px-2 py-1 rounded-md shadow-sm border border-gray-100 dark:border-gray-700">
                            <Flame className="text-brand-orange h-4 w-4" />
                            <span className="text-xs font-bold text-ui-light-textSecondary dark:text-ui-dark-textSecondary">32</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors border border-transparent">
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-ui-light-bg dark:bg-ui-dark-bg text-ui-light-textSecondary dark:text-ui-dark-textSecondary flex items-center justify-center font-bold text-sm shrink-0">3</div>
                        <img alt="Student" className="w-10 h-10 rounded-full border-2 border-white dark:border-ui-dark-surface shrink-0" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCwlwlK6Uedy78dcK40sIS1c6oeiiqMbt0FlOSMPInijBmII9Yr6_iWT5bT6L0diSuiU1QtjSREntaBObkyBqTFO6OUR0mxKGpTUFcLspyy-uiFSOe6Lnwb6G_nHTuZsAWIGSdHaHcjCbRA7L-cQY6ihl-s3JHBTC_5mmmsc1qcHHtAOh_s10p_rMuBpUiGn2t56LmFihO5LW6SdBwsRhQu1tFC5AkkYKLMsSOKBBgJf1xbRAk-zuu6O-o3lVC_oNkl2-UgbfWzT_sX" />
                        <div className="min-w-0">
                            <h4 className="text-sm font-semibold text-ui-light-textPrimary dark:text-ui-dark-textPrimary truncate">Emily Davis</h4>
                            <p className="text-xs text-ui-light-textSecondary dark:text-ui-dark-textSecondary truncate">Arts & Design</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-ui-light-textPrimary dark:text-ui-dark-textPrimary">10,850</p>
                            <p className="text-[10px] text-ui-light-textSecondary dark:text-ui-dark-textSecondary uppercase tracking-wide">Points</p>
                        </div>
                        <div className="flex items-center gap-1 bg-ui-light-surface dark:bg-ui-dark-bg px-2 py-1 rounded-md shadow-sm border border-gray-100 dark:border-gray-700">
                            <Flame className="text-brand-orange h-4 w-4" />
                            <span className="text-xs font-bold text-ui-light-textSecondary dark:text-ui-dark-textSecondary">28</span>
                        </div>
                    </div>
                </div>

                <div className="relative py-2">
                    <div aria-hidden="true" className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-dashed border-gray-200 dark:border-gray-700"></div>
                    </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-brand-purple/5 dark:bg-brand-purple/10 border border-brand-purple/20">
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-ui-light-bg dark:bg-ui-dark-bg text-ui-light-textSecondary flex items-center justify-center font-bold text-sm shrink-0">15</div>
                        <img alt="User" className="w-10 h-10 rounded-full border-2 border-brand-purple shrink-0" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCDopsLSNFM5T_pAgwvF1YOCzLGz6ZQPYXcr9VJV-eYRlBEJQm2Rhej6e7odWmyLSrUgEvbVO1-gnzyUJoIM0ZAilRC6B7KRrMYhhb5ESIAThzvkscRKajpUWcmdxX9foYg_ivkEJieqxPFYZhLbhiXLRQAYeKq6e4Zb_g6sSlKmpwnZw0FO5cVIMBb6rQ3i-kG8RF1R7-crKUC8HC9pdUdFp1r7Ib0P4badtGd94JwIdNrJEksb3wF-lM7DOjHAQDnD702Y41_QKqY" />
                        <div className="min-w-0">
                            <h4 className="text-sm font-semibold text-brand-purple truncate">Alex Johnson (You)</h4>
                            <p className="text-xs text-ui-light-textSecondary dark:text-ui-dark-textSecondary truncate">Business Admin</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-ui-light-textPrimary dark:text-ui-dark-textPrimary">5,420</p>
                            <p className="text-[10px] text-ui-light-textSecondary dark:text-ui-dark-textSecondary uppercase tracking-wide">Points</p>
                        </div>
                        <div className="flex items-center gap-1 bg-ui-light-surface dark:bg-ui-dark-bg px-2 py-1 rounded-md shadow-sm border border-gray-100 dark:border-gray-700">
                            <Flame className="text-brand-orange h-4 w-4" />
                            <span className="text-xs font-bold text-ui-light-textSecondary dark:text-ui-dark-textSecondary">12</span>
                        </div>
                    </div>
                </div>
            </div>
            <button className="w-full mt-4 py-2 text-sm font-medium text-brand-purple hover:underline transition-colors">
                View Full Leaderboard
            </button>
        </div>
    )
}

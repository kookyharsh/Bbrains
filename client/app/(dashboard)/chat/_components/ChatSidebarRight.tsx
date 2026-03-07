import React from "react"

export function ChatSidebarRight() {
    return (
        <aside className="w-60 bg-gray-50 dark:bg-gray-800/50 border-l border-gray-200 dark:border-gray-800 flex flex-col hidden lg:flex shrink-0">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 text-sm">
                <h3 className="font-semibold text-gray-900 dark:text-white">Members</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <div>
                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Admin — 1</h4>
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors relative group">
                            <div className="relative">
                                <img alt="Admin avatar" className="w-8 h-8 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBt-rumJrdi6bTlxuZ5zWTfgyuwv6PZkLwGKbf_XcihLAK8fx3c6bEXi_k1jRGsbFg3pV2Za_89oO6j3mO6W6EmQplFDVMw6cIRE7z5GCCjQrROJgxRgXvyrS5LtAJUo10S3diIvam9yF4p12_FKTEvpdi-SXV7KPDc6v4qNDeNCu3F1Cgeu-aGEEzvkyxNR693YYhFNi9Yzo_xLwFqv2ilPBAzp79mjc9XVJ_9i9TSKHm3NL9tnN3OFK3SzHHWYEoyO2ZrKFTnjv35" />
                                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                            </div>
                            <span className="font-medium text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">Admin Sarah</span>
                        </div>
                    </div>
                </div>
                <div>
                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Teachers — 2</h4>
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors group">
                            <div className="relative">
                                <img alt="Teacher avatar" className="w-8 h-8 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDeeNc0JnO42H1doTdI_VdKpVotGGgvEOZr86EYgNsGTRfDHh5PE1kOGz3Homu6oqZU9VBvvPYdfrV_WBV8De-tdja_wi0EZY4heu-8k7x4pmBFD2llwuil_X7y8RTiV1suDYd8yuhre4Ihq_oywV7FsjAWxwHAokuGoLAfwqmYUuRCzTsKaO5q29sV4c7EqHHaFgj5CNItrDW9IjRT1SOd8kTmqikFTXwvxH4TuafWNuRdn9pOjGTGpSPye6J0i3WRDgPFl8om5VfN" />
                                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-yellow-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                            </div>
                            <span className="font-medium text-sm text-red-600 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300">Prof. Williams</span>
                        </div>
                        <div className="flex items-center gap-3 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors group opacity-60">
                            <div className="relative">
                                <img alt="Teacher avatar" className="w-8 h-8 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuArt0UbJ94-ZTD0jlJSoNUpIb1tgqK4G5WkN8Z1xrm0rlGNawtLkvv3Ycb9FL5pcACdbQp8iXOCvazh2cuakx0spPvfl0Xkmn7XEiUMltvmTkDIL-TnNKaCws-VA8dANDGQpIAZW8OeVr8TyA_OtSW_QpC3mYrkhFNFpoXp6DiRebRqBBX8UVI1M7tIlZHwKfHevlTm7bgSn3kxEVjNWu-fMVM7SVbg55CrjNab4_QhFSu3W9eVihysA1XWdYDXjAsCn9OHMo8DTe-M" />
                                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-gray-400 border-2 border-white dark:border-gray-800 rounded-full"></div>
                            </div>
                            <span className="font-medium text-sm text-red-600 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300">Dr. Evans</span>
                        </div>
                    </div>
                </div>
                <div>
                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Students — Online</h4>
                    <div className="space-y-2">
                        {/* Current User */}
                        <div className="relative group/user">
                            <div className="flex items-center gap-3 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors group">
                                <div className="relative">
                                    <img alt="Student avatar" className="w-8 h-8 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCLC4NZWYer3fglpeJ01KX4ZenbbJOhCuFID96KI8dKdH9wA3-IWqUF8XMzzfG51ejvU4mFZZuK8R8L2qsQ3FZTMlOGP_zyYeI7eBHhWZg0G1Go5hykK3AZkvPdmhh9NQ4wfyOjPUhOfR0e-fu4AJL1Zeeahdg-lzL0YEkr8LdusnYecd6lVX7cozvHxxTOYKgz5NGFWSsKYgNkxrmNDABeXStULtxRzO46jxZIf1TLcQZKcJTcaP2uGfXoha85GXkr7JaWKYNBRBiO" />
                                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                                </div>
                                <span className="font-medium text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">John Doe (You)</span>
                            </div>
                            {/* Hover Popup */}
                            <div className="absolute top-0 right-[100%] mr-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden opacity-0 invisible group-hover/user:opacity-100 group-hover/user:visible transition-all z-50">
                                <div className="h-16 bg-gradient-to-r from-blue-400 to-indigo-500" />
                                <div className="px-4 pb-4 relative">
                                    <img alt="Student avatar large" className="w-16 h-16 rounded-full border-4 border-white dark:border-gray-800 absolute -top-8 left-4" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCtevSmCGuMRC1DX29xnmQergEiijjx48_A-jRUvHc-0-Ewc5d6WFDwadEQU3CSsTWherDFKexzAAG5LNhtFFtuHZqrhedaCvgVVbkmaMGgCJZcWG3HqQOgU7McIXBfqLlWvwqvpTdEQOdN2_wddAYAQLr59qCBEN9ye9vhgWik8au9t2NHK5QWPIp_9hAZ_Ajca1S73muabR2xJDrmQ1lHWLZp6BVceBwwjAg_ig-q691_Zjn3G2SueWoEmo5a_xDuOWF3RYHkAXhM" />
                                    <div className="pt-10">
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">John Doe</h3>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">@johndoe • he/him</div>
                                        <div className="mt-3">
                                            <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-md font-medium">Student</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Other Students */}
                        <div className="flex items-center gap-3 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors group">
                            <div className="relative">
                                <img alt="Student avatar" className="w-8 h-8 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAgkM_ZPQOFWZd1qkSvQk3osU1zCnAys5bIQoAB03iSTlxzhYi0E0_yQl-2JvnAw2ZZ7qJA-IQaTbSla8FrzDPl67eoJ-RAhICaU5QpRHbtxKmc91c-0kfxULXq8RjjBuP0R99Fr9P2Wc21yKRRZKfr-iTKaqWzEg1cBXdQJ6XwbM9ps-PuSYQqwkhOuutHtXb28LOJd_wcdjnfT_fPd0h7IL30xXOPMwNH9ZKh0xv-V9RMwLjvMlQ_EOoGlFqR5TP6XXyB3Af5c3Un" />
                                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                            </div>
                            <span className="font-medium text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">Jane Smith</span>
                        </div>
                        <div className="flex items-center gap-3 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors group">
                            <div className="relative">
                                <img alt="Student avatar" className="w-8 h-8 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD_DyTPIuCuobvG9nSyOXaXkKR5uYsBdpQU46IC8Jyy7PcvI6qnAFi4BHr3DMolH6YehQTVyZ0qvxyY-IlTMl-mYuZLcKzkQlmk6RIj_FQMtx7iIjKdrA6z8Ws5EgsKmKReWG3hUp2R7aVMVhMQflrn1ctRCQDgP1WqQHphgBo4aKj9f8KCJRCwPxb0vtbkHTQMfuSPpuOx6RrwYycHbBnU4_BDdEMtdl-F-DAJPEdLWnzzLnsalRdZIhLPGelF1VJZX1V9xn9KFmnj" />
                                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                            </div>
                            <span className="font-medium text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">Alex Johnson</span>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    )
}

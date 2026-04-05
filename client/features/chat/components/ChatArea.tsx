import Image from "next/image"
import { Hash, Reply, Copy, Edit, Trash2 } from "lucide-react"

export function ChatArea() {
    return (
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 relative">
            {/* Header / Title */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-10 absolute top-0 w-full shrink-0">
                <Hash className="text-gray-400 dark:text-gray-500 h-5 w-5" />
                <h2 className="font-bold text-lg text-gray-900 dark:text-white">Global Chat</h2>
                <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline-block">| Talk about anything!</span>
            </div>

            {/* Message List */}
            <div className="flex-1 overflow-y-auto p-6 pt-20 space-y-6">

                {/* Date Divider: Yesterday */}
                <div className="flex items-center justify-center relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
                    </div>
                    <span className="relative bg-white dark:bg-gray-900 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Yesterday</span>
                </div>

                {/* Message Item */}
                <div className="group flex gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 p-2 -mx-2 rounded-xl transition-colors relative">
                    <Image alt="Jane Smith" width={40} height={40} className="w-10 h-10 rounded-full mt-1 object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCzos9RzH54rNyLiSgreh6VR62qQCcPhCteRzY3BM7URRbNdIcuxUrFIqHltlKaNTPnZUSyYawK35uGfN832b-Yft32xicBjVQJ_eASs3TpfyInSRgNOxyk_o4PcfGQuZj5OnfYMk75Wu7sdXGbUGUbgFVzbtMxUoA5O4RYcSLVZ7qCj8ZfD8Jmjt08DKmvRKhBDFZI_BvqjNpdvRRa4Tcjtge_j4x0t-rERZd5HYWURLe1lvAbtPFbZMtS22ltLa81H1ANhI2iQwMV" />
                    <div className="flex-1">
                        <div className="flex items-baseline gap-2 mb-1">
                            <span className="font-semibold text-gray-900 dark:text-white">Jane Smith</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Yesterday at 14:30</span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 text-sm">Hey everyone! Has anyone started on the new computer science assignment yet? I&apos;m finding the second part a bit tricky.</p>
                    </div>
                    {/* Hover Actions */}
                    <div className="absolute top-0 right-4 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-lg flex items-center divide-x divide-gray-200 dark:divide-gray-700">
                        <button className="p-1.5 text-gray-500 hover:text-indigo-600 dark:hover:text-white" title="Reply"><Reply className="h-4 w-4" /></button>
                        <button className="p-1.5 text-gray-500 hover:text-indigo-600 dark:hover:text-white" title="Copy"><Copy className="h-4 w-4" /></button>
                    </div>
                </div>

                {/* Message Item */}
                <div className="group flex gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 p-2 -mx-2 rounded-xl transition-colors relative">
                    <Image alt="Alex Johnson" width={40} height={40} className="w-10 h-10 rounded-full mt-1 object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAe7bpcUcCjr9t88LPidJvh29WW9JJS8XvxdI-4XfZ7yzPoyqnVBhNbJk4y0r5-a7Qxw_AQYiR2ubdNwOxAmB2JLmkhIbXgv9knQ5_h5VN7Nkn6vG9z0Z3d4Bwifgx47lIO86Dj-iaOJ6bTzFcU3uRraKfLfNKQhzuy0OoAXdj3g3FyNKPQQTIYZ3s81nlHoOEX9SjK27kolM2VMvhygvDjcKjVESpkZ6no4i6lRtXfyE9KVGN4GR9jdFZBuv3ZgV85ojXHnaJvXFPG" />
                    <div className="flex-1">
                        <div className="flex items-baseline gap-2 mb-1">
                            <span className="font-semibold text-gray-900 dark:text-white">Alex Johnson</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Yesterday at 15:45</span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 text-sm">Yeah, I looked at it. For the second part, try reviewing the lecture notes from last Tuesday. It covers the specific algorithm needed.</p>
                    </div>
                    {/* Hover Actions */}
                    <div className="absolute top-0 right-4 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-lg flex items-center divide-x divide-gray-200 dark:divide-gray-700">
                        <button className="p-1.5 text-gray-500 hover:text-indigo-600 dark:hover:text-white" title="Reply"><Reply className="h-4 w-4" /></button>
                        <button className="p-1.5 text-gray-500 hover:text-indigo-600 dark:hover:text-white" title="Copy"><Copy className="h-4 w-4" /></button>
                    </div>
                </div>

                {/* Date Divider: Today */}
                <div className="flex items-center justify-center relative mt-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
                    </div>
                    <span className="relative bg-white dark:bg-gray-900 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Today</span>
                </div>

                {/* Mention Message Item */}
                <div className="group flex gap-4 bg-yellow-50 dark:bg-yellow-900/10 hover:bg-yellow-100 dark:hover:bg-yellow-900/20 p-2 -mx-2 rounded-xl transition-colors relative border-l-4 border-yellow-400">
                    <Image alt="John Doe" width={40} height={40} className="w-10 h-10 rounded-full mt-1 object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDrwGY41theBgHakpItLhif7EKL0IXy-DrWh9GKvYwHEUDh0TaxHNKnCJB2IpbGpnlANtVPBXYoj_qrJ-3PbW9KF101Bnm2wiScPMF76rD2ZwIrowJOydPrHYCUY_bnFG14tpLnuc5nR8gu_NPc5NfQnEiPCGyA6_ehWYotqPlWU4e7CE8Lk5WrChIna2JnofzFrkTL-IvJCrj5s_mEoiHfVlZQp6BCttZMROpIUQ71sdxgyb_PKOB7dag1ziVxs10-9TbRJdQuWCtu" />
                    <div className="flex-1">
                        <div className="flex items-baseline gap-2 mb-1">
                            <span className="font-semibold text-gray-900 dark:text-white">John Doe</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Today at 09:12</span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 text-sm">
                            Thanks Alex! <span className="bg-yellow-200 dark:bg-yellow-800/50 text-yellow-800 dark:text-yellow-200 px-1 py-0.5 rounded font-medium">@Alex Johnson</span> That helped a lot. Also, does anyone know what time the library closes tonight?
                        </p>
                    </div>
                    {/* Hover Actions */}
                    <div className="absolute top-0 right-4 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-lg flex items-center divide-x divide-gray-200 dark:divide-gray-700">
                        <button className="p-1.5 text-gray-500 hover:text-indigo-600 dark:hover:text-white" title="Reply"><Reply className="h-4 w-4" /></button>
                        <button className="p-1.5 text-gray-500 hover:text-indigo-600 dark:hover:text-white" title="Edit"><Edit className="h-4 w-4" /></button>
                        <button className="p-1.5 text-red-500 hover:text-red-600" title="Delete"><Trash2 className="h-4 w-4" /></button>
                    </div>
                </div>

                {/* Notice Message Item */}
                <div className="group flex gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 p-2 -mx-2 rounded-xl transition-colors relative">
                    <Image alt="Prof. Williams" width={40} height={40} className="w-10 h-10 rounded-full mt-1 object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDM4uF5pqSJdACjFmQG2-Xb-ZZfbYNFSMxKAB9xaoA4ngwGaYr2vbRWuV86465B08gwYGL1HQLhCVZn_3t6Vhdj1jv5s3HmSYLICiKkdURtY2mVWJ3WiMXkK-4Qu6Hu1N9QM1h1YqgbmAt3u2xBsY_Ecj1oFandRTqla3omdIFawrPAwmGXyjk2DVigmgjkNm3-odDCLN3-t6kDg74WgTPIIBUgMIaJCXqtQ6B9GHcsHaVPWvmvd_6LOzwL9yGe4iPM_MJzB1d_bRZ6" />
                    <div className="flex-1">
                        <div className="flex items-baseline gap-2 mb-1">
                            <span className="font-semibold text-red-600 dark:text-red-400">Prof. Williams</span>
                            <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">Teacher</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Today at 10:05</span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 text-sm">Just a reminder that the deadline for the physics project is extended to Friday. Please check the announcements page for details.</p>
                    </div>
                </div>

            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shrink-0">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-2 flex items-center gap-2">
                    <button className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        <span className="material-icons text-lg">add_circle_outline</span>
                    </button>
                    <input
                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 outline-none"
                        placeholder="Message #global-chat..."
                        type="text"
                    />
                    <button className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        <span className="material-icons text-lg">mood</span>
                    </button>
                    <button className="p-2 bg-indigo-600 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center h-9 w-9">
                        <span className="material-icons text-[18px]">send</span>
                    </button>
                </div>
            </div>
        </div>
    )
}

import type { Member } from "@/features/chat/data"

// ─── Status Dot ───────────────────────────────────────────────────────────────

export function StatusDot({ status }: { status: Member["status"] }) {
    const colors: Record<Member["status"], string> = {
        online: "bg-green-500",
        idle: "bg-yellow-500",
        offline: "bg-gray-400",
    }
    return (
        <span
            className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full border-2 border-white dark:border-gray-800 ${colors[status]}`}
        />
    )
}

// ─── User Badge ───────────────────────────────────────────────────────────────

export function UserBadge({ text, color }: { text: string; color: string }) {
    // If we have "Teacher" use the red styling exactly like mock map.
    // Otherwise fallback to something generic based on the `color` string or standard.
    if (text.toLowerCase() === 'teacher') {
        return (
            <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                {text}
            </span>
        )
    }

    return (
        <span
            className={`ml-1 inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold uppercase leading-none text-white ${color}`}
        >
            {text}
        </span>
    )
}

// ─── Date Separator ───────────────────────────────────────────────────────────

export function DateSeparator({ date }: { date: string }) {
    return (
        <div className="flex items-center justify-center relative mt-8 mb-6">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
            </div>
            <span className="relative bg-ui-light-bg dark:bg-ui-dark-bg px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {date}
            </span>
        </div>
    )
}

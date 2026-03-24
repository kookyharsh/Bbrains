"use client"

import React from "react"
import { MapPin } from "lucide-react"

// Minimal types for the demo
export interface CalendarEvent {
    id: string
    title: string
    subtitle: string
    location: string
    type: "class" | "exam" | "study" | "assignment"
    dayOfWeek: number // 1=Mon, 2=Tue ... 5=Fri
    startHour: number // 9 = 9 AM
    durationHours: number
}

interface CalendarViewProps {
    view: "day" | "week" | "month"
    events: CalendarEvent[]
}

const HOURS = [9, 10, 11, 12, 13, 14, 15]
const DAYS = [
    { id: 1, name: "Mon", date: "12" },
    { id: 2, name: "Tue", date: "13" },
    { id: 3, name: "Wed", date: "14" },
    { id: 4, name: "Thu", date: "15" },
    { id: 5, name: "Fri", date: "16" },
]

export function CalendarView({ view, events }: CalendarViewProps) {

    const getTypeStyles = (type: CalendarEvent["type"]) => {
        switch (type) {
            case "class": return "bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-400"
            case "exam": return "bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800 text-red-700 dark:text-red-400"
            case "study": return "bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800 text-orange-700 dark:text-orange-400"
            case "assignment": return "bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800 text-purple-700 dark:text-purple-400"
        }
    }

    const formatHour = (h: number) => {
        if (h === 12) return "12 PM"
        return h > 12 ? `${h - 12} PM` : `${h} AM`
    }

    if (view === "month") {
        const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
        // Start on Monday (Jan 1, 2025 was a Wed) - but for dummy we just do a 7 col grid
        const monthDays = Array.from({ length: 31 }, (_, i) => i + 1)

        return (
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                    {weekdays.map(d => (
                        <div key={d} className="p-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-tighter">{d}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7 bg-gray-100 dark:bg-gray-800 gap-px">
                    {Array.from({ length: 2 }).map((_, i) => (
                        <div key={`empty-${i}`} className="bg-gray-50/50 dark:bg-gray-800/20 h-32"></div>
                    ))}
                    {monthDays.map(day => {
                        const isFocusDay = day >= 12 && day <= 16
                        const dayOfWeek = isFocusDay ? (day - 11) : -1
                        const dayEvents = events.filter(e => e.dayOfWeek === dayOfWeek)

                        return (
                            <div key={day} className="bg-white dark:bg-gray-900 h-32 p-2 relative group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                <span className={`text-xs font-medium ${day === 13 ? 'bg-black dark:bg-white text-white dark:text-black w-6 h-6 flex items-center justify-center rounded-full' : 'text-gray-500'}`}>
                                    {day}
                                </span>
                                <div className="mt-1 space-y-1">
                                    {dayEvents.slice(0, 3).map(e => (
                                        <div key={e.id} className={`text-[9px] px-1.5 py-0.5 rounded border truncate ${getTypeStyles(e.type)}`}>
                                            {e.title}
                                        </div>
                                    ))}
                                    {dayEvents.length > 3 && (
                                        <div className="text-[9px] text-gray-400 pl-1 font-medium">+{dayEvents.length - 3} more</div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }

    if (view === "day") {
        // Just showing Monday (Focus day 12)
        const dayEvents = events.filter(e => e.dayOfWeek === 1)
        return (
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl flex flex-col shadow-sm relative overflow-hidden min-h-[600px]">
                <div className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-6 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Monday</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">January 12, 2025</p>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {HOURS.map((hour) => (
                        <div key={hour} className="border-b border-gray-100 dark:border-gray-800 h-32 flex group">
                            <div className="w-24 border-r border-gray-100 dark:border-gray-800 text-right pr-6 pt-4 text-sm font-medium text-gray-400">
                                {formatHour(hour)}
                            </div>
                            <div className="flex-1 relative p-4">
                                {dayEvents.filter(e => e.startHour === hour).map(e => (
                                    <div
                                        key={e.id}
                                        className={`absolute top-4 left-4 right-4 z-10 border rounded-xl p-4 flex flex-col hover:shadow-lg transition-all cursor-pointer ${getTypeStyles(e.type)}`}
                                        style={{ height: `calc(${e.durationHours * 100}% + 1rem)` }}
                                    >
                                        <div className="flex justify-between items-start">
                                            <span className="text-sm font-bold">{e.title}</span>
                                            <span className="text-xs opacity-70 font-medium">
                                                {formatHour(e.startHour)} - {formatHour(e.startHour + e.durationHours)}
                                            </span>
                                        </div>
                                        <span className="text-xs opacity-80 mt-1">{e.subtitle}</span>
                                        <span className="text-xs opacity-70 mt-auto flex items-center gap-1.5">
                                            <MapPin className="size-3.5" /> {e.location}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    // Default Week View matches Stitch exactly
    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden flex flex-col shadow-sm">
            {/* Header Row */}
            <div className="grid grid-cols-[60px_repeat(5,1fr)] sm:grid-cols-[80px_repeat(5,1fr)] border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <div className="p-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400">Time</div>
                {DAYS.map(day => (
                    <div key={day.id} className="p-2 sm:p-4 text-center border-l border-gray-100 dark:border-gray-800">
                        <span className="block text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">{day.name}</span>
                        <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">{day.date}</span>
                    </div>
                ))}
            </div>

            {/* Grid Body */}
            <div className="grid grid-cols-[60px_repeat(5,1fr)] sm:grid-cols-[80px_repeat(5,1fr)] bg-gray-100 dark:bg-gray-800 gap-px">
                {HOURS.map(hour => (
                    <React.Fragment key={hour}>
                        <div className="bg-white dark:bg-gray-900 p-2 text-right text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 pt-4 border-r border-gray-100 dark:border-gray-800">
                            {formatHour(hour)}
                        </div>
                        {DAYS.map(day => {
                            // Find events that start at this hour & day
                            const slotEvents = events.filter(e => e.dayOfWeek === day.id && e.startHour === hour)

                            return (
                                <div key={`${day.id}-${hour}`} className="bg-white dark:bg-gray-900 p-1 sm:p-2 relative h-24 sm:h-28">
                                    {slotEvents.map(e => (
                                        <div
                                            key={e.id}
                                            // The height spans multiple boxes if duration > 1
                                            style={{ height: `calc(${e.durationHours * 100}% + ${(e.durationHours - 1) * 2}px)` }}
                                            className={`absolute top-1 sm:top-2 left-1 sm:left-2 right-1 sm:right-2 z-10 border rounded-lg p-1.5 sm:p-3 flex flex-col hover:shadow-md transition-shadow cursor-pointer ${getTypeStyles(e.type)}`}
                                        >
                                            <span className="text-[10px] sm:text-xs font-bold leading-tight">{e.title}</span>
                                            {e.durationHours > 0.5 && <span className="hidden sm:block text-[10px] opacity-80 mt-1 truncate">{e.subtitle}</span>}
                                            {e.durationHours > 0.5 && (
                                                <span className="hidden sm:flex text-[10px] opacity-70 mt-auto items-center gap-1 shrink-0 truncate">
                                                    <MapPin className="size-3 shrink-0" /> {e.location}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )
                        })}
                    </React.Fragment>
                ))}
            </div>
        </div>
    )
}

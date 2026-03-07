"use client"

import React, { useState } from "react"
import { CalendarHeader } from "./_components/CalendarHeader"
import { CalendarFilters } from "./_components/CalendarFilters"
import { CalendarView, CalendarEvent } from "./_components/CalendarView"

// Dummy data matching the classes in the Stitch view
const dummyEvents: CalendarEvent[] = [
    {
        id: "1",
        title: "CS 101",
        subtitle: "Intro to Programming",
        location: "Room 302",
        type: "class",
        dayOfWeek: 1, // Mon
        startHour: 9, // 9 AM
        durationHours: 1, // 1 box height
    },
    {
        id: "2",
        title: "CS 101",
        subtitle: "Intro to Programming",
        location: "Room 302",
        type: "class",
        dayOfWeek: 3, // Wed
        startHour: 9,
        durationHours: 1,
    },
    {
        id: "3",
        title: "ENG 204",
        subtitle: "Modern Literature",
        location: "Main Hall",
        type: "assignment",
        dayOfWeek: 2, // Tue
        startHour: 10,
        durationHours: 1,
    },
    {
        id: "4",
        title: "ENG 204",
        subtitle: "Modern Literature",
        location: "Main Hall",
        type: "assignment",
        dayOfWeek: 4, // Thu
        startHour: 10,
        durationHours: 1,
    },
    {
        id: "5",
        title: "Midterm Exam",
        subtitle: "Calculus II",
        location: "Exam Hall A",
        type: "exam",
        dayOfWeek: 5, // Fri
        startHour: 11,
        durationHours: 1.5, // Taller box
    },
    {
        id: "6",
        title: "Study Group",
        subtitle: "CS Project",
        location: "Library",
        type: "study",
        dayOfWeek: 1, // Mon
        startHour: 12,
        durationHours: 2, // Much taller box
    }
]

export default function CalendarPage() {
    const [view, setView] = useState<"day" | "week" | "month">("week")

    return (
        <div className="flex-1 flex flex-col h-full bg-white dark:bg-gray-950 overflow-hidden">
            <CalendarHeader />
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar">
                <CalendarFilters activeView={view} onViewChange={setView} />
                <CalendarView view={view} events={dummyEvents} />
            </div>
        </div>
    )
}

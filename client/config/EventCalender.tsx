"use client"

import { useState } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import { MoreHorizontal } from "lucide-react";
import { Event as ApiEvent } from "@/services/api/client";

export interface EventCalenderProps {
    events?: ApiEvent[];
}

export function EventCalender({ events = [] }: EventCalenderProps) {
    const [value, onChange] = useState<any>(new Date());

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm h-full">            
            <div className="mb-4 flex justify-center">
                <Calendar 
                    onChange={onChange} 
                    value={value} 
                    className="!w-full !border-none !bg-transparent dark:!text-gray-300"
                />
            </div>
            <div className="flex items-center justify-between mb-4 border-t border-gray-100 dark:border-gray-800 pt-4">
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Events</h1>
                <MoreHorizontal className="text-gray-400 cursor-pointer" size={20} />
            </div>
            <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                {events.length > 0 ? (
                    events.map((event)=>(
                        <div key={event.id} className="border border-gray-100 dark:border-gray-800 rounded-md p-3 border-t-4 odd:border-t-blue-200 even:border-t-purple-300 bg-gray-50/50 dark:bg-gray-800/30">
                            <div className="flex items-center justify-between">
                                <h1 className="font-semibold text-gray-700 dark:text-gray-200 text-sm">{event.title}</h1>
                                <span className="text-[10px] text-gray-400">{event.time || "All day"}</span>
                            </div>
                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{event.description}</p>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-gray-400 text-sm italic">
                        No upcoming events
                    </div>
                )}
            </div>
        </div>
    );
}

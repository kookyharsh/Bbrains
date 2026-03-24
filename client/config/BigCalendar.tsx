"use client"

import { useState } from "react";
import { Calendar, momentLocalizer, Views, View } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Event as ApiEvent } from "@/services/api/client";

const localizer = momentLocalizer(moment);

export interface BigCalendarProps {
  events: ApiEvent[];
  onSelectEvent?: (event: ApiEvent) => void;
}

export function BigCalendar({ events, onSelectEvent }: BigCalendarProps) {
  const [view, setView] = useState<View>(Views.WORK_WEEK);

  // Map API events to BigCalendar events
  const calendarEvents = events.map(event => ({
    ...event,
    start: new Date(event.startDate),
    end: new Date(event.endDate),
  }));

  return (
    <div className="h-[700px] w-full bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        views={[Views.WORK_WEEK, Views.DAY, Views.MONTH]}
        view={view}
        onView={(newView) => setView(newView)}
        defaultDate={new Date()}
        onSelectEvent={(event) => onSelectEvent?.(event as unknown as ApiEvent)}
        style={{ height: "100%" }}
        className="custom-big-calendar"
      />
    </div>
  );
}

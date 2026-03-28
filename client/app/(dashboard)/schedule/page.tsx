"use client";

import { DashboardContent } from "@/components/dashboard-content";
import { WeeklySchedulePanel } from "@/features/schedule/components/WeeklySchedulePanel";
import { defaultWeeklySchedule } from "@/features/schedule/data";

export default function SchedulePage() {
  return (
    <DashboardContent>
      <WeeklySchedulePanel
        schedule={defaultWeeklySchedule}
        title="Schedule"
        description="Your weekly class schedule"
      />
    </DashboardContent>
  );
}

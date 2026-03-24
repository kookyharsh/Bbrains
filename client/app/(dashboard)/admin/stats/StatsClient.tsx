"use client";

import { StatsCards } from "./_components/StatsCards";
import { EnrollmentTrendChart } from "./_components/EnrollmentTrendChart";
import { GenderDistributionChart } from "./_components/GenderDistributionChart";
import { StudentsByCourseChart } from "./_components/StudentsByCourseChart";
import type { AdminStats, StatItem } from "./_types";

interface StatsClientProps {
  stats: AdminStats;
}

export function StatsClient({ stats }: StatsClientProps) {
  const statItems: StatItem[] = [
    {
      label: "Total Students",
      value: stats.summary.totalStudents,
      change: "+12%",
    },
    {
      label: "Total Teachers",
      value: stats.summary.totalTeachers,
      change: "+3%",
    },
    {
      label: "Active Courses",
      value: stats.summary.activeCourses,
      change: "+5%",
    },
    {
      label: "Avg Attendance",
      value: `${stats.summary.avgAttendance}%`,
      change: "+2%",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Statistics</h1>

      <StatsCards stats={statItems} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EnrollmentTrendChart data={stats.enrollmentTrend} />
        <GenderDistributionChart data={stats.genderDistribution} />
        <StudentsByCourseChart data={stats.studentsByCourse} />
      </div>
    </div>
  );
}

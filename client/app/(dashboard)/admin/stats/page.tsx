"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { StatsClient } from "@/app/(dashboard)/admin/stats/StatsClient";
import { fetchAdminStats } from "@/app/(dashboard)/admin/stats/data";
import type { AdminStats } from "@/app/(dashboard)/admin/stats/_types";

const emptyStats: AdminStats = {
  summary: {
    totalStudents: 0,
    totalTeachers: 0,
    activeCourses: 0,
    avgAttendance: 0,
  },
  enrollmentTrend: [],
  genderDistribution: [],
  studentsByCourse: [],
};

export default function StatsPage() {
  const [stats, setStats] = useState<AdminStats>(emptyStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const data = await fetchAdminStats();
        if (mounted) setStats(data);
      } catch (error) {
        console.error("Failed to fetch admin stats:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="size-6 animate-spin text-muted-foreground/50" />
      </div>
    );
  }

  return <StatsClient stats={stats} />;
}

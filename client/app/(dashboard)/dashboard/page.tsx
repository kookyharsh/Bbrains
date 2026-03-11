"use client";

import { useEffect, useState } from "react";
import { redirect } from 'next/navigation'

import { DailyRewardCard } from "@/components/dashboard/DailyRewardCard";
import { WalletMiniCard } from "@/components/dashboard/WalletMiniCard";
import { AttendanceCard } from "@/components/dashboard/AttendanceCard";
import { LeaderboardCard } from "@/components/dashboard/LeaderboardCard";
import { UpcomingEventsCard } from "@/components/dashboard/UpcomingEventsCard";
import { AnnouncementsCard } from "@/components/dashboard/AnnouncementsCard";
import { MyTasksCard } from "@/components/dashboard/MyTasksCard";
import { dashboardApi, User } from "@/lib/api-services";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardOverview() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await dashboardApi.getUser();
        if (response.success && response.data) {
          setUser(response.data);
        } else {
          setError(response.message || "Failed to load user");
        }
      } catch (err) {
        setError("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const username = user?.firstName || user?.username || "User";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          ) : (
            <>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Welcome back, {username}! 👋
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Here's what's happening with your studies today.
              </p>
            </>
          )}
        </div>
        <div className="text-xs text-muted-foreground bg-card border border-border px-3 py-1.5 rounded-lg self-start">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </div>
      </div>

      {/* Top row cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DailyRewardCard />
        <WalletMiniCard />
        <AttendanceCard />
      </div>

      {/* Mid row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LeaderboardCard />
        <MyTasksCard />
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AnnouncementsCard />
        <UpcomingEventsCard />
      </div>
    </div>
  );
}

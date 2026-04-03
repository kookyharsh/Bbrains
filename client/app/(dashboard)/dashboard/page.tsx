import Link from "next/link";
import { DailyRewardCard } from "@/features/dashboard/components/DailyRewardCard";
import { WalletMiniCard } from "@/features/dashboard/components/WalletMiniCard";
import { AttendanceCard } from "@/features/dashboard/components/AttendanceCard";
import { LeaderboardCard } from "@/features/dashboard/components/LeaderboardCard";
import { UpcomingEventsCard } from "@/features/dashboard/components/UpcomingEventsCard";
import { AnnouncementsCard } from "@/features/dashboard/components/AnnouncementsCard";
import { MyTasksCard } from "@/features/dashboard/components/MyTasksCard";
import { DashboardContent } from "@/components/dashboard-content";
import { LevelWidget } from "@/features/dashboard/components/LevelWidget";
import { CurrentDate } from "@/features/dashboard/components/CurrentDate";
import { FeeStatusCard } from "@/features/dashboard/components/FeeStatusCard";
import { getDashboardOverviewData } from "@/features/dashboard/data";

export default async function DashboardOverview() {
  const { dashboardData, transformedLeaderboard, username } = await getDashboardOverviewData();
  const resolvedLevel = dashboardData?.stats?.level ?? dashboardData?.user?.xp?.level ?? 1;
  const resolvedXp = dashboardData?.stats?.xp ?? dashboardData?.user?.xp?.xp ?? 0;

  return (
    <DashboardContent className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Welcome back, {username}! 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Here&apos;s what&apos;s happening with your studies today.
          </p>
        </div>
        <CurrentDate />
      </div>

      {/* Top row cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <LevelWidget 
          level={resolvedLevel} 
          xp={resolvedXp} 
          nextLevelXp={dashboardData?.stats?.nextLevelRequiredXp}
          currentLevelXp={dashboardData?.stats?.currentLevelRequiredXp}
        />
        <DailyRewardCard initialStreak={dashboardData?.streak} />
        <WalletMiniCard initialWallet={dashboardData?.wallet} />
        <Link href="/transactions" className="block h-full">
          <FeeStatusCard feeSummary={dashboardData?.feeSummary} />
        </Link>
        <AttendanceCard initialAttendance={dashboardData?.attendance} />
      </div>

      {/* Mid row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LeaderboardCard initialLeaderboard={transformedLeaderboard} />
        <MyTasksCard />
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AnnouncementsCard initialAnnouncements={dashboardData?.announcements?.slice(0, 5)} />
        <UpcomingEventsCard initialEvents={dashboardData?.events?.slice(0, 5)} />
      </div>
    </DashboardContent>
  );
}

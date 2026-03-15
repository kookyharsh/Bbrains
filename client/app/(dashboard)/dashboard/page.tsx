import { DailyRewardCard } from "@/components/dashboard/DailyRewardCard";
import { WalletMiniCard } from "@/components/dashboard/WalletMiniCard";
import { AttendanceCard } from "@/components/dashboard/AttendanceCard";
import { LeaderboardCard } from "@/components/dashboard/LeaderboardCard";
import { UpcomingEventsCard } from "@/components/dashboard/UpcomingEventsCard";
import { AnnouncementsCard } from "@/components/dashboard/AnnouncementsCard";
import { MyTasksCard } from "@/components/dashboard/MyTasksCard";
import { dashboardApi } from "@/lib/api-services";
import { DashboardContent } from "@/components/dashboard-content";

export default async function DashboardOverview() {
  let dashboardData = null;
  let error = null;

  try {
    const response = await dashboardApi.getDashboard();
    if (response.success && response.data) {
      dashboardData = response.data;
    } else {
      error = response.message || "Failed to load dashboard data";
    }
  } catch (err) {
    error = "Failed to load dashboard data";
  }

  // Handle Leaderboard transformation if data exists
  const transformedLeaderboard = dashboardData?.leaderboard ? (dashboardData.leaderboard as any[]).map((entry) => ({
    id: entry.userId || entry.id || "",
    rank: entry.rank,
    xp: entry.score ?? entry.xp ?? 0,
    username: entry.user?.username || entry.username || 'Unknown',
    firstName: entry.user?.userDetails?.firstName || entry.firstName || "",
    lastName: entry.user?.userDetails?.lastName || entry.lastName || "",
    avatar: entry.user?.userDetails?.avatar || entry.avatar || "",
  })) : [];

  const username = dashboardData?.user?.firstName || dashboardData?.user?.username || "User";

  return (
    <DashboardContent className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Welcome back, {username}! 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Here's what's happening with your studies today.
          </p>
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
        <DailyRewardCard initialStreak={dashboardData?.streak} />
        <WalletMiniCard initialWallet={dashboardData?.wallet} />
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

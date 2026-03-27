import { redirect } from "next/navigation";
import { DailyRewardCard } from "@/features/dashboard/components/DailyRewardCard";
import { WalletMiniCard } from "@/features/dashboard/components/WalletMiniCard";
import { AttendanceCard } from "@/features/dashboard/components/AttendanceCard";
import { LeaderboardCard } from "@/features/dashboard/components/LeaderboardCard";
import { UpcomingEventsCard } from "@/features/dashboard/components/UpcomingEventsCard";
import { AnnouncementsCard } from "@/features/dashboard/components/AnnouncementsCard";
import { MyTasksCard } from "@/features/dashboard/components/MyTasksCard";
import { dashboardApi, type DashboardData } from "@/services/api/client";
import { DashboardContent } from "@/components/dashboard-content";
import { LevelWidget } from "@/features/dashboard/components/LevelWidget";
import { CurrentDate } from "@/features/dashboard/components/CurrentDate";
import { getServerSupabase as createClient } from "@/services/supabase/server";

type RoleRow = {
  role?: { name?: string | null } | { name?: string | null }[] | null;
};

type LeaderboardLikeEntry = {
  userId?: string;
  id?: string;
  rank?: number;
  score?: number;
  xp?: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  user?: {
    username?: string;
    userDetails?: {
      firstName?: string;
      lastName?: string;
      avatar?: string;
    };
  };
};

export default async function DashboardOverview() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const [{ data: dbUser }, { data: roleRows }] = await Promise.all([
    supabase
      .from("user")
      .select("type")
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("user_roles")
      .select("role:role_id(name)")
      .eq("user_id", user.id),
  ]);

  const roleNames = ((roleRows || []) as RoleRow[]).flatMap((row) => {
    if (Array.isArray(row?.role)) {
      return row.role.map((role) => role?.name).filter(Boolean) as string[];
    }

    return row?.role?.name ? [row.role.name] : [];
  });

  const isManager = roleNames.some((name: string) =>
    name.toLowerCase().includes("manager")
  );

  if (dbUser?.type === "admin") {
    redirect("/admin/overview");
  }

  if (isManager) {
    redirect("/manager/overview");
  }

  if (dbUser?.type === "teacher") {
    redirect("/teacher/overview");
  }

  let dashboardData: DashboardData | null = null;

  try {
    const response = await dashboardApi.getDashboard();
    if (response.success && response.data) {
      dashboardData = response.data;
    }
  } catch {
    dashboardData = null;
  }

  // Handle Leaderboard transformation if data exists
  const transformedLeaderboard = dashboardData?.leaderboard
    ? (dashboardData.leaderboard as LeaderboardLikeEntry[]).map((entry) => ({
        id: entry.userId || entry.id || "",
        rank: entry.rank,
        xp: entry.score ?? entry.xp ?? 0,
        username: entry.user?.username || entry.username || "Unknown",
        firstName: entry.user?.userDetails?.firstName || entry.firstName || "",
        lastName: entry.user?.userDetails?.lastName || entry.lastName || "",
        avatar: entry.user?.userDetails?.avatar || entry.avatar || "",
      }))
    : [];

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
            Here&apos;s what&apos;s happening with your studies today.
          </p>
        </div>
        <CurrentDate />
      </div>

      {/* Top row cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <LevelWidget 
          level={dashboardData?.stats?.level ?? 1} 
          xp={dashboardData?.stats?.xp ?? 0} 
          nextLevelXp={dashboardData?.stats?.nextLevelRequiredXp} 
        />
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

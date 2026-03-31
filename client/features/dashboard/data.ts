import { redirect } from "next/navigation";
import { dashboardApi, type DashboardData } from "@/services/api/client";
import { getServerSupabase as createClient } from "@/services/supabase/server";
import { LeaderboardLikeEntry, RoleRow } from "./types";
import { transformLeaderboard } from "./utils";

export async function getDashboardOverviewData() {
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

  const transformedLeaderboard = dashboardData?.leaderboard
    ? transformLeaderboard(dashboardData.leaderboard as LeaderboardLikeEntry[])
    : [];

  const username = dashboardData?.user?.firstName || dashboardData?.user?.username || "User";

  return {
    dashboardData,
    transformedLeaderboard,
    username,
  };
}

import { redirect } from "next/navigation";
import { dashboardApi, type DashboardData, getAuthToken } from "@/services/api/client";
import { cookies } from "next/headers";
import { LeaderboardLikeEntry, RoleRow } from "./types";
import { transformLeaderboard } from "./utils";

export async function getDashboardOverviewData() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/auth/login");
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  let dbUserType: string | null = null;
  let roleNames: string[] = [];

  try {
    const userResponse = await fetch(`${baseUrl}/user/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (userResponse.ok) {
      const userData = await userResponse.json();
      if (userData.success && userData.data) {
        dbUserType = userData.data.type;
        roleNames = (userData.data.roles || []).flatMap((row: RoleRow) => {
          if (Array.isArray(row?.role)) {
            return row.role.map((role) => role?.name).filter(Boolean) as string[];
          }
          return row?.role?.name ? [row.role.name] : [];
        });
      }
    }
  } catch {
  }

  const isManager = roleNames.some((name: string) =>
    name.toLowerCase().includes("manager")
  );

  if (dbUserType === "superadmin") {
    redirect("/superadmin/overview");
  }
  if (dbUserType === "admin") {
    redirect("/admin/overview");
  }

  if (isManager) {
    redirect("/manager/overview");
  }

  if (dbUserType === "teacher") {
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

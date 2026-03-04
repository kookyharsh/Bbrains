import { getAuthedClient } from "@/lib/http"

export interface DashboardData {
  user: {
    id: string
    username: string
    email: string
    type: string
    userDetails?: { avatar?: string; firstName?: string; lastName?: string }
    college?: { name: string }
  }
  stats: {
    totalCourses: number
    xp: number
    level: number
    walletBalance: number
    leaderboardRank: number | null
    totalAchievements: number
    streak: number
  }
  enrollments: { courseId: number; course: { name: string; id: number } }[]
  recentGrades: { grade: string; assignment: { title: string } }[]
  recentAchievements: { achievement: { name: string; description?: string } }[]
  announcements: { id: number; title: string; createdAt: string }[]
}

export async function fetchDashboard(
  getToken: () => Promise<string | null>,
): Promise<DashboardData> {
  const client = await getAuthedClient(getToken)
  const response = await client.get<{ success: boolean; data: DashboardData }>("/dashboard")

  if (!response.data?.success || !response.data.data) {
    throw new Error("Failed to load dashboard data")
  }

  return response.data.data
}


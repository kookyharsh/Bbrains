import { getAuthedClient } from "@/services/api/client"
import { DashboardData } from "@/lib/types/api"

export async function fetchDashboard(): Promise<DashboardData> {
  const client = await getAuthedClient()
  const response = await client.get<{ success: boolean; data: DashboardData }>("/dashboard")

  if (!response.data?.success || !response.data.data) {
    throw new Error("Failed to load dashboard data")
  }

  return response.data.data
}

import { getAuthedClient } from "@/services/api/client";
import type { AdminStats } from "./_types";

export async function fetchAdminStats(): Promise<AdminStats> {
  const client = await getAuthedClient();
  const response = await client.get<{ success: boolean; data: AdminStats }>("/admin/stats");

  if (!response.data?.success || !response.data.data) {
    throw new Error("Failed to load admin statistics");
  }

  return response.data.data;
}

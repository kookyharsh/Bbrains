import { getAuthToken } from "@/services/api/client"
import type { ManagerOverviewStats } from "./_types"

const getBaseUrl = () => {
    if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL
    return "http://localhost:5000"
}

export async function fetchManagerOverviewStats(): Promise<ManagerOverviewStats> {
    const token = await getAuthToken()

    const response = await fetch(`${getBaseUrl()}/dashboard/manager-overview`, {
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`)
    }

    if (!data.success || !data.data) {
        throw new Error(data.message || "Failed to fetch manager overview")
    }

    return data.data as ManagerOverviewStats
}

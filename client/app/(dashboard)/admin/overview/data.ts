import { getAuthToken } from "@/services/api/client"
import { type OverviewStats } from "./_types"

const getBaseUrl = () => {
    if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL
    return "http://localhost:5000"
}

export async function fetchOverviewStats(): Promise<OverviewStats> {
    const token = await getAuthToken()

    const response = await fetch(`${getBaseUrl()}/dashboard/admin-overview`, {
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    })

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (!data.success || !data.data) {
        throw new Error(data.message || "Failed to fetch admin overview")
    }

    return data.data as OverviewStats
}

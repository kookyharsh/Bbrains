import { getAuthToken } from "@/services/api/client"
import { type OverviewStats, emptyStats } from "./_types"

const getBaseUrl = () => {
    if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL
    return "http://localhost:5000"
}

async function fetchArray<T>(endpoint: string, token: string | null): Promise<T[]> {
    const response = await fetch(`${getBaseUrl()}${endpoint}`, {
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    })

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (!data.success) {
        return []
    }

    return data.data || []
}

export async function fetchOverviewStats(): Promise<OverviewStats> {
    const token = await getAuthToken()

    const results = await Promise.allSettled([
        fetchArray<unknown>("/user/teachers", token),
        fetchArray<unknown>("/user/students", token),
        fetchArray<unknown>("/market/products", token),
        fetchArray<unknown>("/market/pending", token),
        fetchArray<unknown>("/roles", token),
        fetchArray<unknown>("/achievements", token),
        fetchArray<unknown>("/announcements", token),
        fetchArray<unknown>("/academic/assignments", token),
    ])

    const getCount = (index: number): number => {
        const res = results[index]
        if (res.status === "fulfilled" && Array.isArray(res.value)) {
            return res.value.length
        }
        return 0
    }

    return {
        teachers: getCount(0),
        students: getCount(1),
        products: getCount(2),
        pending: getCount(3),
        roles: getCount(4),
        achievements: getCount(5),
        announcements: getCount(6),
        assignments: getCount(7),
    }
}

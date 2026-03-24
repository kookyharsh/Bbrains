import { getAuthToken } from "@/services/api/client"
import type { ApiUser } from "./_types"

const getBaseUrl = () => {
    if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL
    return "http://localhost:5000"
}

export async function fetchTeachers(): Promise<ApiUser[]> {
    const token = await getAuthToken()

    const response = await fetch(`${getBaseUrl()}/user/teachers`, {
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
        throw new Error(data.message || "Failed to fetch teachers")
    }

    return data.data || []
}

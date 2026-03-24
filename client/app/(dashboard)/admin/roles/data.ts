import { getAuthToken } from "@/services/api/client"
import type { Role, UserWithRoles } from "./_types"

const getBaseUrl = () => {
    if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL
    return "http://localhost:5000"
}

async function fetchWithAuth<T>(endpoint: string): Promise<T> {
    const token = await getAuthToken()

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
        throw new Error(data.message || "Request failed")
    }

    return data.data as T
}

export interface RolesData {
    roles: Role[]
    users: UserWithRoles[]
}

export async function fetchRolesData(): Promise<RolesData> {
    const [roles, users] = await Promise.all([
        fetchWithAuth<Role[]>("/roles"),
        fetchWithAuth<UserWithRoles[]>("/roles/users"),
    ])

    return { roles, users }
}

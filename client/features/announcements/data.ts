// ─── Types ────────────────────────────────────────────────────────────────────

export interface AnnouncementUser {
    id: string
    username: string
    type: "admin" | "teacher" | "student" | "staff"
    userDetails?: {
        avatar?: string
        firstName?: string
        lastName?: string
    }
}

export interface AnnouncementFromAPI {
    id: number
    userId: string
    title: string
    description?: string
    image?: string
    createdAt: string
    user: AnnouncementUser
}

export interface Announcement {
    id: number
    user: {
        name: string
        role: "admin" | "teacher" | "student" | "staff"
        badge: string
        badgeColor: string
    }
    title: string
    content: string
    timestamp: string
    date: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const AVATAR_COLORS = [
    "bg-indigo-500", "bg-green-500", "bg-yellow-500", "bg-red-500",
    "bg-pink-500", "bg-purple-500", "bg-teal-500",
]

export const BADGE_COLORS: Record<string, string> = {
    admin: "bg-red-500",
    teacher: "bg-purple-500",
    student: "bg-blue-500",
    staff: "bg-green-500",
}

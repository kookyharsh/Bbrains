import type { AnnouncementUser, AnnouncementFromAPI, Announcement } from "./data"
import { AVATAR_COLORS, BADGE_COLORS } from "./data"

// ─── String Helpers ───────────────────────────────────────────────────────────

export function getInitials(name: string): string {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase()
}

export function getAvatarColor(name: string): string {
    return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
}

// ─── Date / Time Formatters ───────────────────────────────────────────────────

export function formatTimestamp(dateStr: string): string {
    const date = new Date(dateStr)
    const now = new Date()
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffHours < 1) return "Just now"
    if (diffHours < 24) return `${diffHours} hours ago`
    if (diffHours < 48) return "Yesterday"
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}

export function formatDateGroup(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "2-digit", month: "long", year: "numeric",
    })
}

export function getUserDisplayName(user: AnnouncementUser): string {
    if (user.userDetails?.firstName) {
        return `${user.userDetails.firstName}${user.userDetails.lastName ? " " + user.userDetails.lastName : ""}`
    }
    return user.username
}

// ─── API Mappers ──────────────────────────────────────────────────────────────

export function mapApiToAnnouncement(item: AnnouncementFromAPI): Announcement {
    const name = getUserDisplayName(item.user)
    return {
        id: item.id,
        user: {
            name,
            role: item.user.type,
            badge: item.user.type.toUpperCase(),
            badgeColor: BADGE_COLORS[item.user.type] || "bg-gray-500",
        },
        title: item.title,
        content: item.description || "",
        timestamp: formatTimestamp(item.createdAt),
        date: formatDateGroup(item.createdAt),
    }
}

// ─── Grouping ─────────────────────────────────────────────────────────────────

export function groupByDate(items: Announcement[]): Map<string, Announcement[]> {
    return items.reduce((map, item) => {
        const group = map.get(item.date) ?? []
        group.push(item)
        map.set(item.date, group)
        return map
    }, new Map<string, Announcement[]>())
}
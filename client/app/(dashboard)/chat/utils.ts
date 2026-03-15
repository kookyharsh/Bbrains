import type { ApiMessage, ApiMember, Message, Member } from "./data"
import { AVATAR_COLORS } from "./data"

// ─── String Helpers ───────────────────────────────────────────────────────────

export function getInitials(name: string): string {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

export function getAvatarColor(name: string): string {
    return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
}

// ─── Message Grouping ─────────────────────────────────────────────────────────

export function groupMessagesByDate(messages: Message[]): Map<string, Message[]> {
    return messages.reduce((map, msg) => {
        const group = map.get(msg.date) ?? []
        group.push(msg)
        map.set(msg.date, group)
        return map
    }, new Map<string, Message[]>())
}

// ─── API Mappers ──────────────────────────────────────────────────────────────

export function extractMentions(content: string): string[] {
    const matches = content.match(/@(\w+)/g)
    return matches ? matches.map((m) => m.slice(1)) : []
}

export function mapApiMessage(m: ApiMessage): Message {
    return {
        id: m._id,
        user: {
            id: m.userId,
            username: m.username,
            name: m.displayName || m.username,
            avatar: m.avatar || "",
            badge: m.role === "admin" ? "ADMIN" : ["staff", "teacher"].includes(m.role) ? "MOD" : undefined,
            badgeColor: m.role === "admin" ? "bg-red-500" : ["staff", "teacher"].includes(m.role) ? "bg-blue-500" : undefined,
        },
        content: m.content,
        timestamp: new Date(m.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
        date: new Date(m.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }),
        createdAt: m.createdAt,
        editedAt: m.editedAt ?? null,
        replyTo: m.replyTo ?? null,
        mentions: m.mentions || [],
    }
}

export function mapApiMember(m: ApiMember, activeUserIds: string[]): Member {
    const memberId = String(m.userId)
    const isOnline = activeUserIds.includes(memberId)
    const isAdmin = m.roles.includes("admin") || m.type === "admin"
    const isMod = m.roles.includes("staff") || m.roles.includes("teacher") || m.type === "teacher" || m.type === "staff"

    return {
        id: m.userId,
        username: m.username,
        name: m.displayName || m.username,
        avatar: m.avatar || "",
        pronouns: m.pronouns || "they/them",
        grade: m.grade || "N/A",
        roles: m.roles || [],
        type: m.type,
        badge: isAdmin ? "ADMIN" : isMod ? "MOD" : undefined,
        badgeColor: isAdmin ? "bg-red-500" : isMod ? "bg-blue-500" : undefined,
        role: isAdmin ? "admin" : isMod ? "moderator" : "member",
        status: isOnline ? "online" : "offline",
    }
}

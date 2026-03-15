// ─── Types ────────────────────────────────────────────────────────────────────

export interface Message {
    id: string
    user: {
        id: string
        username: string
        name: string
        avatar: string
        badge?: string
        badgeColor?: string
    }
    content: string
    timestamp: string
    date: string
    createdAt: string
    editedAt?: string | null
    replyTo?: {
        messageId: string
        username: string
        content: string
    } | null
    mentions?: string[]
    attachments?: { url: string; type: string; name?: string }[]
}

export interface Member {
    id: string
    username: string
    name: string
    avatar: string
    pronouns: string
    grade: string
    roles: string[]
    type: string
    badge?: string
    badgeColor?: string
    role: "admin" | "moderator" | "member"
    status: "online" | "idle" | "offline"
}

export interface ApiMessage {
    _id: string
    userId: string
    username: string
    displayName: string
    avatar: string
    role: string
    content: string
    mentions: string[]
    editedAt?: string | null
    replyTo?: {
        messageId: string
        username: string
        content: string
    } | null
    createdAt: string
}

export interface ApiMember {
    userId: string
    username: string
    displayName: string
    avatar: string
    pronouns: string
    grade: string
    roles: string[]
    type: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const CHANNEL_NAME = "General Discussion"

const getBaseUrl = () => {
    if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
    if (typeof window !== "undefined") {
      return `http://${window.location.hostname}:5000`;
    }
    return "http://localhost:5000";
};

export const API_BASE_URL = getBaseUrl();

export const AVATAR_COLORS = [
    "bg-indigo-500", "bg-green-500", "bg-yellow-500", "bg-red-500",
    "bg-pink-500", "bg-purple-500", "bg-teal-500",
]

export const ROLE_ORDER: Member["role"][] = ["admin", "moderator", "member"]

export const ROLE_LABELS: Record<Member["role"], string> = {
    admin: "Admin",
    moderator: "Moderators",
    member: "Members",
}

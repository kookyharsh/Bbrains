import { LeaderboardLikeEntry, TransformedLeaderboardEntry } from "./types";

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount)
}

export function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  if (hours < 1) return "Just now"
  if (hours < 24) return `${hours} hours ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days > 1 ? "s" : ""} ago`
}

export function transformLeaderboard(leaderboard: LeaderboardLikeEntry[]): TransformedLeaderboardEntry[] {
  return leaderboard.map((entry, index) => ({
    id: entry.userId || entry.id || "",
    rank: entry.rank ?? index + 1,
    xp: entry.score ?? entry.xp ?? 0,
    username: entry.user?.username || entry.username || "Unknown",
    firstName: entry.user?.userDetails?.firstName || entry.firstName || "",
    lastName: entry.user?.userDetails?.lastName || entry.lastName || "",
    avatar: entry.user?.userDetails?.avatar || entry.avatar || "",
  }));
}

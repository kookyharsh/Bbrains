export { type ApiAuditLog, type LogCategory } from "@/lib/types/api";

export const LOG_CATEGORIES: LogCategory[] = [
    "AUTH",
    "ACADEMIC",
    "MARKET",
    "FINANCE",
    "USER",
    "SYSTEM",
];

export const categoryColors: Record<string, string> = {
    AUTH: "bg-blue-500/15 text-blue-600",
    ACADEMIC: "bg-green-500/15 text-green-600",
    MARKET: "bg-orange-500/15 text-orange-600",
    FINANCE: "bg-yellow-500/15 text-yellow-600",
    USER: "bg-purple-500/15 text-purple-600",
    SYSTEM: "bg-gray-500/15 text-gray-600",
};

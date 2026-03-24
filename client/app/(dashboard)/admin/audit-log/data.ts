import { getAuthToken } from "@/services/api/client";
import type { ApiAuditLog } from "./_types";

const getBaseUrl = () => {
    if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
    return "http://localhost:5000";
};

export interface AuditLogFilters {
    category?: string;
    userId?: string;
    limit?: number;
}

export async function fetchAuditLogs(filters: AuditLogFilters = {}): Promise<ApiAuditLog[]> {
    const token = await getAuthToken();

    const params = new URLSearchParams();
    params.set("limit", String(filters.limit ?? 100));
    if (filters.category) params.set("category", filters.category);
    if (filters.userId) params.set("userId", filters.userId);

    const response = await fetch(`${getBaseUrl()}/logs?${params.toString()}`, {
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });

    if (!response.ok) {
        throw new Error("Failed to fetch audit logs");
    }

    const data = await response.json();

    if (!data.success) {
        throw new Error(data.message || "Failed to load audit logs");
    }

    return data.data || [];
}

import { getAuthToken } from "@/services/api/client";
import type { ApiProduct } from "./_types";

const getBaseUrl = () => {
    if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
    return "http://localhost:5000";
};

async function fetchWithAuth<T>(endpoint: string): Promise<T> {
    const token = await getAuthToken();

    const response = await fetch(`${getBaseUrl()}${endpoint}`, {
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
        throw new Error(data.message || "Request failed");
    }

    return data.data as T;
}

export interface ProductsData {
    all: ApiProduct[];
    pending: ApiProduct[];
}

export async function fetchProducts(): Promise<ApiProduct[]> {
    const [all, pending] = await Promise.all([
        fetchWithAuth<ApiProduct[]>("/market/products"),
        fetchWithAuth<ApiProduct[]>("/market/pending"),
    ]);

    const merged = [
        ...pending,
        ...all.filter((p) => !pending.some((q) => q.id === p.id)),
    ];

    return merged;
}

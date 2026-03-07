import type { ChartConfig } from "@/components/ui/chart"

// ─── Types ───────────────────────────────────────────────────────────────────

export interface WalletUser {
    id: string
    name: string
    walletId: string
    balance: number
    avatarUrl: string
}

export interface SearchUser {
    id: string
    name: string
    avatarUrl: string
}

export type TransactionType = "credit" | "debit" | "unsuccessful"

export interface Transaction {
    id: string
    date: string
    recipientName: string
    recipientAvatar: string
    amount: number
    type: TransactionType
    note: string
}

export interface ApiTransaction {
    id: number
    userId: string
    transactionDate: string
    amount: string | number
    type: "credit" | "debit"
    status: "success" | "failed" | "pending"
    note?: string
}

export interface ApiWallet {
    id: string
    userId: string
    balance: string | number
    user: { username: string; email: string }
}

export const chartConfig = {
    spent: {
        label: "Spent",
        color: "hsl(0, 84%, 60%)",
    },
    received: {
        label: "Received",
        color: "hsl(142, 71%, 45%)",
    },
} satisfies ChartConfig
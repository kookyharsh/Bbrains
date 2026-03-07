import type { ApiTransaction, Transaction, TransactionType } from "./data"

// ─── Formatters ───────────────────────────────────────────────────────────────

export function formatCurrency(amount: number) {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount)
}

export function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}

export function getInitials(name: string) {
    return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
}

export function generateTxnId() {
    return `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
}

// ─── API Mappers ──────────────────────────────────────────────────────────────

export function mapApiTransaction(t: ApiTransaction): Transaction {
    const txnType: TransactionType = t.status === "failed" ? "unsuccessful" : t.type
    return {
        id: `TXN-${t.id}`,
        date: new Date(t.transactionDate).toISOString().split("T")[0],
        recipientName: t.note?.match(/(?:Sent to|Received from) Wallet #\d+: (.+)/)?.[1] || t.note || "Transaction",
        recipientAvatar: "",
        amount: Number(t.amount),
        type: txnType,
        note: t.note || "",
    }
}
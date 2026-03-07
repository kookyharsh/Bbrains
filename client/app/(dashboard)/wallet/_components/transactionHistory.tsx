"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowDownLeft, ArrowUpRight, Receipt, Search, Wallet, XCircle } from "lucide-react"
import type { Transaction, TransactionType } from "../data"
import { formatCurrency, formatDate, getInitials } from "../utils"

interface TransactionHistoryProps {
    transactions: Transaction[]
    txnFilter: "this_month" | "last_30" | "last_90"
    txnSearch: string
    onFilterChange: (filter: "this_month" | "last_30" | "last_90") => void
    onSearchChange: (val: string) => void
    onTxnClick: (txn: Transaction) => void
}

const FILTER_OPTIONS = [
    { key: "this_month", label: "This Month" },
    { key: "last_30", label: "Last 30 Days" },
    { key: "last_90", label: "Last 90 Days" },
] as const

export function getTxnBadge(type: TransactionType) {
    switch (type) {
        case "credit":
            return (
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800">
                    <ArrowDownLeft className="size-3 mr-0.5" />Credit
                </Badge>
            )
        case "debit":
            return (
                <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800">
                    <ArrowUpRight className="size-3 mr-0.5" />Debit
                </Badge>
            )
        case "unsuccessful":
            return (
                <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800">
                    <XCircle className="size-3 mr-0.5" />Failed
                </Badge>
            )
    }
}

export function TransactionHistory({
    transactions, txnFilter, txnSearch,
    onFilterChange, onSearchChange, onTxnClick,
}: TransactionHistoryProps) {
    return (
        <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-start justify-between gap-4 flex-wrap">
                <div>
                    <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                        <Receipt className="size-4 text-primary" />
                        Transaction History
                    </CardTitle>
                    <CardDescription>{transactions.length} transactions found</CardDescription>
                </div>
                <CardAction>
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                            <Input
                                placeholder="Search amount or name..."
                                value={txnSearch}
                                onChange={e => onSearchChange(e.target.value)}
                                className="pl-8 h-8 w-48 text-xs"
                            />
                        </div>
                        {/* Filter pills */}
                        <div className="flex gap-1 bg-muted/50 rounded-full p-0.5">
                            {FILTER_OPTIONS.map(opt => (
                                <button
                                    key={opt.key}
                                    onClick={() => onFilterChange(opt.key)}
                                    className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${txnFilter === opt.key
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                        }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </CardAction>
            </CardHeader>

            <CardContent>
                {transactions.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <Wallet className="size-10 mx-auto mb-3 opacity-30" />
                        <p className="font-medium">No transactions found</p>
                        <p className="text-xs mt-1">Try adjusting your filters or search</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {transactions.map(txn => (
                            <button
                                key={txn.id}
                                onClick={() => onTxnClick(txn)}
                                className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-muted/50 transition-all text-left group"
                            >
                                <Avatar className="size-9 shrink-0">
                                    <AvatarFallback className={`font-bold text-xs ${txn.type === "credit"
                                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                        : txn.type === "debit"
                                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                        }`}>
                                        {getInitials(txn.recipientName)}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-foreground truncate">{txn.recipientName}</span>
                                        <span className="text-[10px] text-muted-foreground font-medium shrink-0">{formatDate(txn.date)}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground font-medium mt-0.5">
                                        {txn.type === "credit" ? "+" : txn.type === "debit" ? "-" : ""}
                                        {formatCurrency(txn.amount)}
                                    </p>
                                </div>

                                <div className="flex flex-col items-end gap-1 shrink-0">
                                    {getTxnBadge(txn.type)}
                                    <span className={`text-sm font-bold ${txn.type === "credit"
                                        ? "text-green-600 dark:text-green-400"
                                        : txn.type === "debit"
                                            ? "text-red-600 dark:text-red-400"
                                            : "text-yellow-600 dark:text-yellow-400"
                                        }`}>
                                        {txn.type === "credit" ? "+" : txn.type === "debit" ? "-" : ""}
                                        {formatCurrency(txn.amount)}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
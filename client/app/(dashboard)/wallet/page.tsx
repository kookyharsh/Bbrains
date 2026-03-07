"use client"

import React, { useState, useMemo, useRef, useEffect } from 'react'
import { useAuth } from "@clerk/nextjs"
import { getAuthedClient } from "@/lib/http"
import { Loader2 } from 'lucide-react'

import type { WalletUser, SearchUser, Transaction, ApiTransaction, ApiWallet } from "./data"
import { mapApiTransaction, formatCurrency, generateTxnId } from "./utils"
import { BalanceCard } from "./_components/balancecard"
import { SendMoneyCard } from "./_components/SendMoneyCard"
import { SpendingChart } from "./_components/spendingschart"
import { TransactionHistory } from "./_components/transactionHistory"

import {
    PinDialog, ReceiptDialog, TxnReceiptDialog,
    ShowQRDialog, ScanQRDialog,
} from "./_components/dialogs"


export default function WalletPage() {
    const { getToken } = useAuth()

    // ── Live data ──
    const [walletUser, setWalletUser] = useState<WalletUser>({ id: "", name: "", walletId: "", balance: 0, avatarUrl: "" })
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)

    // ── UI state ──
    const [balanceVisible, setBalanceVisible] = useState(true)

    // Send money form
    const [recipientQuery, setRecipientQuery] = useState("")
    const [selectedRecipient, setSelectedRecipient] = useState<SearchUser | null>(null)
    const [amount, setAmount] = useState("")
    const [note, setNote] = useState("")
    const [showUserDropdown, setShowUserDropdown] = useState(false)
    const [searchResults, setSearchResults] = useState<SearchUser[]>([])

    // Dialogs
    const [pinDialogOpen, setPinDialogOpen] = useState(false)
    const [receiptDialogOpen, setReceiptDialogOpen] = useState(false)
    const [qrShowDialogOpen, setQrShowDialogOpen] = useState(false)
    const [qrScanDialogOpen, setQrScanDialogOpen] = useState(false)
    const [txnReceiptDialogOpen, setTxnReceiptDialogOpen] = useState(false)

    // PIN
    const [pin, setPin] = useState(["", "", "", "", "", ""])
    const [pinError, setPinError] = useState("")
    const pinRef1 = useRef<HTMLInputElement>(null)
    const pinRef2 = useRef<HTMLInputElement>(null)
    const pinRef3 = useRef<HTMLInputElement>(null)
    const pinRef4 = useRef<HTMLInputElement>(null)
    const pinRef5 = useRef<HTMLInputElement>(null)
    const pinRef6 = useRef<HTMLInputElement>(null)
    const pinRefs = [pinRef1, pinRef2, pinRef3, pinRef4, pinRef5, pinRef6]



    // Receipts
    const [lastReceipt, setLastReceipt] = useState<Transaction | null>(null)
    const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null)

    // Chart / filter state
    const [chartRange, setChartRange] = useState<"week" | "month" | "3months">("month")
    const [txnFilter, setTxnFilter] = useState<"this_month" | "last_30" | "last_90">("this_month")
    const [txnSearch, setTxnSearch] = useState("")

    // ── Fetch wallet data ──
    useEffect(() => {
        async function fetchWalletData() {
            try {
                setLoading(true)
                const client = await getAuthedClient(getToken)
                const [walletRes, historyRes] = await Promise.all([
                    client.get<{ success: boolean; data: ApiWallet }>("/wallet/me"),
                    client.get<{ success: boolean; data: ApiTransaction[] }>("/wallet/history"),
                ])
                const w = walletRes.data.data
                setWalletUser({
                    id: w.userId,
                    name: w.user.username,
                    walletId: w.id,
                    balance: Number(w.balance),
                    avatarUrl: "",
                })
                setTransactions(historyRes.data.data.map(mapApiTransaction))
            } catch (err) {
                console.error("Failed to load wallet data:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchWalletData()
    }, [getToken])

    // ── User search ──
    useEffect(() => {
        if (!recipientQuery.trim() || selectedRecipient) {
            setSearchResults([])
            return
        }
        const timeout = setTimeout(async () => {
            try {
                const client = await getAuthedClient(getToken)
                const res = await client.get<{
                    success: boolean
                    data: Array<{ id: string; username: string; userDetails?: { firstName?: string; lastName?: string } }>
                }>(`/user/search?name=${encodeURIComponent(recipientQuery)}`)
                setSearchResults(res.data.data.map(u => ({
                    id: u.id,
                    name: u.userDetails?.firstName
                        ? `${u.userDetails.firstName} ${u.userDetails.lastName || ""}`.trim()
                        : u.username,
                    avatarUrl: "",
                })))
            } catch {
                setSearchResults([])
            }
        }, 300)
        return () => clearTimeout(timeout)
    }, [recipientQuery, selectedRecipient, getToken])

    // ── Chart data ──
    const chartData = useMemo(() => {
        const now = new Date()

        if (chartRange === "week") {
            const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7)
            const filtered = transactions.filter(t => new Date(t.date) >= weekAgo)
            return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => {
                const dayTxns = filtered.filter(t => new Date(t.date).toLocaleDateString("en-US", { weekday: "short" }) === day)
                return {
                    day,
                    spent: dayTxns.filter(t => t.type === "debit").reduce((s, t) => s + t.amount, 0),
                    received: dayTxns.filter(t => t.type === "credit").reduce((s, t) => s + t.amount, 0),
                }
            })
        }

        if (chartRange === "month") {
            const monthAgo = new Date(now); monthAgo.setDate(monthAgo.getDate() - 30)
            const filtered = transactions.filter(t => new Date(t.date) >= monthAgo)
            return ["Week 1", "Week 2", "Week 3", "Week 4"].map((label, i) => {
                const start = new Date(monthAgo); start.setDate(start.getDate() + i * 7)
                const end = new Date(start); end.setDate(end.getDate() + 7)
                const weekTxns = filtered.filter(t => { const d = new Date(t.date); return d >= start && d < end })
                return {
                    day: label,
                    spent: weekTxns.filter(t => t.type === "debit").reduce((s, t) => s + t.amount, 0),
                    received: weekTxns.filter(t => t.type === "credit").reduce((s, t) => s + t.amount, 0),
                }
            })
        }

        // 3 months
        const threeMonthsAgo = new Date(now); threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
        const filtered = transactions.filter(t => new Date(t.date) >= threeMonthsAgo)
        const months = Array.from({ length: 3 }, (_, i) => {
            const d = new Date(now); d.setMonth(d.getMonth() - (2 - i))
            return d.toLocaleDateString("en-US", { month: "short" })
        })
        return months.map(month => {
            const monthTxns = filtered.filter(t => new Date(t.date).toLocaleDateString("en-US", { month: "short" }) === month)
            return {
                day: month,
                spent: monthTxns.filter(t => t.type === "debit").reduce((s, t) => s + t.amount, 0),
                received: monthTxns.filter(t => t.type === "credit").reduce((s, t) => s + t.amount, 0),
            }
        })
    }, [transactions, chartRange])

    // ── Filtered transactions ──
    const filteredTransactions = useMemo(() => {
        const now = new Date()
        let filtered = transactions.filter(txn => {
            const d = new Date(txn.date)
            if (txnFilter === "this_month") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
            if (txnFilter === "last_30") { const ago = new Date(now); ago.setDate(ago.getDate() - 30); return d >= ago }
            const ago = new Date(now); ago.setDate(ago.getDate() - 90); return d >= ago
        })
        if (txnSearch.trim()) {
            const q = txnSearch.toLowerCase()
            filtered = filtered.filter(t => t.recipientName.toLowerCase().includes(q) || t.amount.toString().includes(q))
        }
        return filtered
    }, [txnFilter, txnSearch, transactions])

    // ── Handlers ──

    function handlePinInput(index: number, value: string) {
        if (!/^\d?$/.test(value)) return
        const newPin = [...pin]
        newPin[index] = value
        setPin(newPin)
        setPinError("")
        if (value && index < 5) pinRefs[index + 1].current?.focus()
    }

    function handlePinKeyDown(index: number, e: React.KeyboardEvent) {
        if (e.key === "Backspace" && !pin[index] && index > 0) pinRefs[index - 1].current?.focus()
    }

    async function handlePinSubmit() {
        const fullPin = pin.join("")
        if (fullPin.length < 6) { setPinError("Please enter all 6 digits"); return }
        try {
            const client = await getAuthedClient(getToken)
            await client.post("/wallet/verify-pin", { pin: fullPin })
            await client.post("/wallet/transfer", {
                recipientWalletId: parseInt(selectedRecipient!.id) || 1,
                amount: parseFloat(amount),
                note: note || "Money transfer",
                pin: fullPin,
            })
            const receipt: Transaction = {
                id: generateTxnId(),
                date: new Date().toISOString().split("T")[0],
                recipientName: selectedRecipient!.name,
                recipientAvatar: selectedRecipient!.avatarUrl,
                amount: parseFloat(amount),
                type: "debit",
                note: note || "Money transfer",
            }
            setLastReceipt(receipt)
            setTransactions(prev => [receipt, ...prev])
            setWalletUser(prev => ({ ...prev, balance: prev.balance - parseFloat(amount) }))
            setPinDialogOpen(false)
            setReceiptDialogOpen(true)
            setPin(["", "", "", "", "", ""])
            setPinError("")
            setRecipientQuery("")
            setSelectedRecipient(null)
            setAmount("")
            setNote("")
        } catch (err) {
            setPinError(err instanceof Error ? err.message : "Transfer failed")
        }
    }

    function handleDownload() {
        const target = lastReceipt || selectedTxn
        if (!target) return
        const text = `
TRANSACTION RECEIPT
═══════════════════
Status: ${target.type === "unsuccessful" ? "Failed" : "Success"}
Date: ${target.date}
Transaction ID: ${target.id}
Recipient: ${target.recipientName}
Amount: ${formatCurrency(target.amount)}
Note: ${target.note}
═══════════════════`.trim()
        const blob = new Blob([text], { type: "text/plain" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url; a.download = `receipt-${target.id}.txt`; a.click()
        URL.revokeObjectURL(url)
    }

    function handleShareReceipt() {
        if (navigator.share && lastReceipt) {
            navigator.share({
                title: "Transaction Receipt",
                text: `Sent ${formatCurrency(lastReceipt.amount)} to ${lastReceipt.recipientName}. Txn ID: ${lastReceipt.id}`,
            }).catch(() => { })
        }
    }

    // ── Loading ──
    if (loading) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-3 bg-background">
                <Loader2 className="size-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading wallet...</p>
            </div>
        )
    }

    // ── Render ──
    return (
        <div className="flex h-full w-full flex-col overflow-hidden bg-background">
            <div className="shrink-0 px-4 pb-3 pt-4 md:px-6">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Wallet</h1>
                <p className="mt-1 text-sm text-muted-foreground">Manage balance, transfers, and transactions.</p>
            </div>

            <div className="flex-1 overflow-y-auto border-t border-border/60 px-4 pb-6 pt-4 md:px-6 custom-scrollbar">
                <div className="space-y-6">
                    {/* Balance + Send Money */}
                    <div className="grid gap-6 md:grid-cols-2">
                        <BalanceCard
                            walletUser={walletUser}
                            balanceVisible={balanceVisible}
                            onToggleBalance={() => setBalanceVisible(v => !v)}
                        />
                        <SendMoneyCard
                            recipientQuery={recipientQuery}
                            selectedRecipient={selectedRecipient}
                            amount={amount}
                            note={note}
                            showUserDropdown={showUserDropdown}
                            searchResults={searchResults}
                            onRecipientQueryChange={setRecipientQuery}
                            onRecipientSelect={(u) => { setSelectedRecipient(u); setRecipientQuery(u.name); setShowUserDropdown(false) }}
                            onRecipientClear={() => { setSelectedRecipient(null); setRecipientQuery("") }}
                            onAmountChange={setAmount}
                            onNoteChange={setNote}
                            onShowDropdown={setShowUserDropdown}
                            onSend={() => { if (selectedRecipient && amount && parseFloat(amount) > 0) setPinDialogOpen(true) }}
                            onShowQR={() => setQrShowDialogOpen(true)}
                            onScanQR={() => setQrScanDialogOpen(true)}
                        />
                    </div>

                    {/* Spending Chart */}
                    <SpendingChart
                        chartData={chartData}
                        chartRange={chartRange}
                        onRangeChange={setChartRange}
                    />

                    {/* Transaction History */}
                    <TransactionHistory
                        transactions={filteredTransactions}
                        txnFilter={txnFilter}
                        txnSearch={txnSearch}
                        onFilterChange={setTxnFilter}
                        onSearchChange={setTxnSearch}
                        onTxnClick={(txn) => { setSelectedTxn(txn); setTxnReceiptDialogOpen(true) }}
                    />
                </div>
            </div>

            {/* ── Dialogs ── */}
            <PinDialog
                open={pinDialogOpen}
                onOpenChange={(open) => { setPinDialogOpen(open); if (!open) { setPin(["", "", "", "", "", ""]); setPinError("") } }}
                pin={pin}
                pinError={pinError}
                amount={amount}
                recipientName={selectedRecipient?.name}
            pinRefs={pinRefs as unknown as React.RefObject<HTMLInputElement>[]}
            onPinInput={handlePinInput}
            onPinKeyDown={handlePinKeyDown}
            onSubmit={handlePinSubmit}

            />
            <ReceiptDialog
                open={receiptDialogOpen}
                onOpenChange={setReceiptDialogOpen}
                receipt={lastReceipt}
                onShare={handleShareReceipt}
                onDownload={handleDownload}
            />
            <TxnReceiptDialog
                open={txnReceiptDialogOpen}
                onOpenChange={setTxnReceiptDialogOpen}
                txn={selectedTxn}
                onDownload={handleDownload}
            />
            <ShowQRDialog
                open={qrShowDialogOpen}
                onOpenChange={setQrShowDialogOpen}
                walletUser={walletUser}
            />
            <ScanQRDialog
                open={qrScanDialogOpen}
                onOpenChange={setQrScanDialogOpen}
                onScanSuccess={(walletId, name) => {
                    setSelectedRecipient({ id: walletId, name, avatarUrl: "" })
                    setRecipientQuery(name)
                    setQrScanDialogOpen(false)
                }}
            />
        </div>
    )
}

"use client"

import Link from "next/link"
import { useMemo, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { ArrowLeftRight, BadgeIndianRupee, Loader2, ReceiptText } from "lucide-react"
import { toast } from "sonner"
import { SectionHeader } from "@/features/admin/components/SectionHeader"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { transactionApi, type Transaction } from "@/services/api/client"

type TransactionView = "all" | "fees" | "salary"

function formatCurrency(amount: number | string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0))
}

function formatDate(value: string) {
  if (!value) return "Not set"
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return "Not set"
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed)
}

function formatCategory(value?: string | null) {
  if (!value) return "Other"
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function getCompactUser(user: Transaction["user"] | Transaction["relatedUser"] | Transaction["recordedByUser"]) {
  if (!user) return "Not linked"
  const fullName = [user.userDetails?.firstName, user.userDetails?.lastName].filter(Boolean).join(" ").trim()
  return fullName ? `${fullName} (@${user.username})` : `@${user.username}`
}

function isOwnFeeTransaction(transaction: Transaction) {
  return transaction.category === "fee" && transaction.type === "debit"
}

function isOwnSalaryTransaction(transaction: Transaction) {
  return transaction.category === "salary" && transaction.type === "credit"
}

function getViewCopy(view: TransactionView) {
  if (view === "fees") {
    return {
      title: "Fees Paid",
      subtitle: "Your own fee payment history with payment details, references, and recording information.",
      empty: "No fee payment transactions found.",
    }
  }

  if (view === "salary") {
    return {
      title: "Salary Received",
      subtitle: "Your own salary receipt history with payment details, references, and recording information.",
      empty: "No salary receipt transactions found.",
    }
  }

  return {
    title: "My Transactions",
    subtitle: "Your own fee payments and salary receipts only.",
    empty: "No personal fee or salary transactions found.",
  }
}

export default function PersonalTransactionsPage() {
  const searchParams = useSearchParams()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  const view = (searchParams.get("view") || "all") as TransactionView
  const activeView: TransactionView = view === "fees" || view === "salary" ? view : "all"
  const copy = getViewCopy(activeView)

  useEffect(() => {
    let mounted = true

    const load = async () => {
      try {
        setLoading(true)
        const response = await transactionApi.getMyTransactions({ limit: 200, status: "success" })
        if (!mounted) return

        if (response.success) {
          setTransactions(response.data || [])
        } else {
          toast.error(response.message || "Failed to load your transactions")
        }
      } catch (error) {
        console.error(error)
        if (mounted) toast.error("Failed to load your transactions")
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [])

  const personalTransactions = useMemo(() => {
    const ownPerspectiveTransactions = transactions.filter(
      (transaction) => isOwnFeeTransaction(transaction) || isOwnSalaryTransaction(transaction)
    )

    if (activeView === "fees") {
      return ownPerspectiveTransactions.filter(isOwnFeeTransaction)
    }

    if (activeView === "salary") {
      return ownPerspectiveTransactions.filter(isOwnSalaryTransaction)
    }

    return ownPerspectiveTransactions
  }, [activeView, transactions])

  const totalAmount = personalTransactions.reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0)

  return (
    <div className="space-y-6">
      <SectionHeader title={copy.title} subtitle={copy.subtitle} />

      <div className="flex flex-wrap gap-2">
        <Badge asChild variant={activeView === "all" ? "default" : "outline"}>
          <Link href="/transactions">All</Link>
        </Badge>
        <Badge asChild variant={activeView === "fees" ? "default" : "outline"}>
          <Link href="/transactions?view=fees">Fees</Link>
        </Badge>
        <Badge asChild variant={activeView === "salary" ? "default" : "outline"}>
          <Link href="/transactions?view=salary">Salary</Link>
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Transactions</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{personalTransactions.length}</p>
            <p className="mt-1 text-sm text-muted-foreground">Only your own fee payments and salary receipts are shown here.</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Total Amount</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{formatCurrency(totalAmount)}</p>
            <p className="mt-1 text-sm text-muted-foreground">Combined amount for the currently selected personal transaction view.</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="size-6 animate-spin text-muted-foreground/50" />
            </div>
          ) : personalTransactions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Day</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Counterparty</TableHead>
                  <TableHead>Recorded By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Note</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {personalTransactions.map((transaction) => (
                  <TableRow key={String(transaction.id)}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {transaction.category === "fee" ? (
                            <ReceiptText className="size-4 text-amber-600" />
                          ) : (
                            <BadgeIndianRupee className="size-4 text-emerald-600" />
                          )}
                          <span className="font-medium text-foreground">
                            {transaction.category === "fee" ? "Fees Paid" : "Salary Received"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatCategory(transaction.category)} - {transaction.type === "debit" ? "Debit" : "Credit"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-foreground">{formatCurrency(transaction.amount)}</TableCell>
                    <TableCell>{formatDate(transaction.transactionDate)}</TableCell>
                    <TableCell>{transaction.paymentMode ? formatCategory(transaction.paymentMode) : "Not set"}</TableCell>
                    <TableCell>{transaction.referenceId || "-"}</TableCell>
                    <TableCell>{getCompactUser(transaction.relatedUser)}</TableCell>
                    <TableCell>{getCompactUser(transaction.recordedByUser)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{formatCategory(transaction.status)}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[260px] whitespace-normal text-muted-foreground">
                      {transaction.note || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-10 text-center">
              <ArrowLeftRight className="size-8 text-muted-foreground/50" />
              <p className="text-sm font-medium text-foreground">{copy.empty}</p>
              <p className="text-sm text-muted-foreground">Transactions will appear here once fee or salary payments are recorded for your account.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, BadgeIndianRupee, Loader2 } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SectionHeader } from "@/features/admin/components/SectionHeader";
import { fetchOverviewStats } from "@/app/(dashboard)/admin/overview/data";
import { emptyStats, type OverviewStats } from "@/app/(dashboard)/admin/overview/_types";

function formatCurrency(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `INR ${amount.toLocaleString("en-IN")}`;
  }
}

function formatDate(value: string) {
  if (!value) return "Not available";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function AdminFinancePage() {
  const [stats, setStats] = useState<OverviewStats>(emptyStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const data = await fetchOverviewStats();
        if (mounted) setStats(data);
      } catch (error) {
        console.error("Failed to fetch admin finance data:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="size-6 animate-spin text-muted-foreground/50" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Finance Overview"
        subtitle="Received income, accrued fees, receivables, and recent successful transactions."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Income Received</p>
            <p className="mt-2 text-3xl font-bold text-foreground">
              {formatCurrency(stats.finance.receivedIncome, stats.finance.currency)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Source: {stats.finance.receivedSource === "config" ? "configured totals" : "fee-tagged transactions"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Accrued Income</p>
            <p className="mt-2 text-3xl font-bold text-foreground">
              {formatCurrency(stats.finance.accruedIncome, stats.finance.currency)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {stats.finance.accruedSource === "classes"
                ? "Calculated from class fee per student multiplied by enrolled students in each class"
                : "No class fee data is available yet"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Receivable Amount</p>
            <p className="mt-2 text-3xl font-bold text-foreground">
              {formatCurrency(stats.finance.receivableIncome, stats.finance.currency)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Outstanding amount after subtracting received income from class-based accrual
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle>Recent Successful Transactions</CardTitle>
          <CardDescription>
            Latest successful entries associated with the current finance snapshot.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {stats.finance.latestTransactions.length > 0 ? (
            stats.finance.latestTransactions.map((transaction, index) => (
              <div key={`${transaction.transactionDate}-${index}`} className="flex items-start justify-between gap-4 rounded-2xl border border-border/60 p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">{transaction.note || "Transaction entry"}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{formatDate(transaction.transactionDate)}</p>
                </div>
                <span className={transaction.type === "credit" ? "text-sm font-semibold text-emerald-600" : "text-sm font-semibold text-rose-600"}>
                  {transaction.type === "credit" ? "+" : "-"}
                  {formatCurrency(transaction.amount, stats.finance.currency)}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No recent successful transactions found.</p>
          )}
        </CardContent>
      </Card>

      <Link href="/admin/config" className="block">
        <Card className="border-dashed border-border/70 shadow-sm transition-all hover:border-primary/40 hover:shadow-md">
          <CardContent className="flex items-start justify-between gap-4 p-5">
            <div>
              <div className="flex items-center gap-2 text-primary">
                <BadgeIndianRupee className="size-4" />
                <span className="text-xs font-semibold uppercase tracking-[0.16em]">Configuration</span>
              </div>
              <p className="mt-2 text-lg font-semibold text-foreground">Open system config</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Update fee-related config values if you want accrued income and configured totals to stay current.
              </p>
            </div>
            <ArrowUpRight className="size-4 text-muted-foreground" />
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}

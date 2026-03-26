"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Search, AlertCircle, TrendingUp, TrendingDown, Share2, Download } from "lucide-react";
import { Transaction } from "@/services/api/client";
import { format, isToday, isYesterday, isThisWeek, parseISO } from "date-fns";

interface TransactionHistoryProps {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
}

interface GroupedTransactions {
  today: Transaction[];
  yesterday: Transaction[];
  thisWeek: Transaction[];
  earlier: Transaction[];
}

export function TransactionHistory({ transactions, loading, error }: TransactionHistoryProps) {
  const [txnSearch, setTxnSearch] = useState("");
  const [showTxnReceipt, setShowTxnReceipt] = useState<Transaction | null>(null);

  const formatTxnDate = (dateStr: string | undefined) => {
    if (!dateStr) return "Unknown date";
    try {
      const date = parseISO(dateStr);
      if (isToday(date)) return `Today, ${format(date, "hh:mm a")}`;
      if (isYesterday(date)) return `Yesterday, ${format(date, "hh:mm a")}`;
      return format(date, "MMM dd, yyyy • hh:mm a");
    } catch (e) {
      return dateStr;
    }
  };

  const groupTransactionsByDate = (txns: Transaction[]): GroupedTransactions => {
    return txns.reduce(
      (acc, txn) => {
        const date = txn.createdAt ? parseISO(txn.createdAt) : null;
        if (!date) {
          acc.earlier.push(txn);
          return acc;
        }
        if (isToday(date)) {
          acc.today.push(txn);
        } else if (isYesterday(date)) {
          acc.yesterday.push(txn);
        } else if (isThisWeek(date)) {
          acc.thisWeek.push(txn);
        } else {
          acc.earlier.push(txn);
        }
        return acc;
      },
      { today: [], yesterday: [], thisWeek: [], earlier: [] } as GroupedTransactions
    );
  };

  const filteredTxns = transactions.filter((t) => {
    const desc = t.description || "";
    const amt = t.amount?.toString() || "";
    if (txnSearch && !desc.toLowerCase().includes(txnSearch.toLowerCase()) && !amt.includes(txnSearch)) return false;
    return true;
  });

  const groupedTxns = groupTransactionsByDate(filteredTxns);

  const isCredit = (type: string | undefined) => {
    const t = type?.toLowerCase() || "";
    return t === "credit" || t === "received";
  };

  const renderTransactionCard = (txn: Transaction) => (
    <Card
      key={txn.id}
      className="cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/20"
      onClick={() => setShowTxnReceipt(txn)}
    >
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
              isCredit(txn.type) ? "bg-green-500/10" : "bg-destructive/10"
            }`}
          >
            {isCredit(txn.type) ? (
              <TrendingUp className="w-6 h-6 text-green-600" />
            ) : (
              <TrendingDown className="w-6 h-6 text-destructive" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-base text-foreground leading-tight">
                  {txn.description || "No description"}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs capitalize font-medium">
                    {txn.type || "unknown"}
                  </Badge>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className={`text-xl font-bold ${isCredit(txn.type) ? "text-green-600" : "text-destructive"}`}>
                  {isCredit(txn.type) ? "+" : "-"}{txn.amount ?? 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {txn.createdAt ? formatTxnDate(txn.createdAt) : "Unknown date"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderDateGroup = (title: string, txns: Transaction[]) => {
    if (txns.length === 0) return null;
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground px-1">{title}</h3>
        <div className="space-y-3">{txns.map(renderTransactionCard)}</div>
      </div>
    );
  };

  return (
    <>
      <Card className="border-0 shadow-none bg-transparent">
        <CardHeader className="px-0 pt-0">
          <div className="flex flex-col gap-3">
            <CardTitle className="text-xl font-semibold">Recent Transactions</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={txnSearch}
                onChange={(e) => setTxnSearch(e.target.value)}
                className="pl-9 h-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="w-full">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <Skeleton className="w-12 h-12 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-5 w-48 mb-3" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <div className="text-right">
                        <Skeleton className="h-7 w-20 ml-auto" />
                        <Skeleton className="h-3 w-24 mt-2 ml-auto" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 p-6 text-sm text-red-500 rounded-lg bg-red-500/5">
              <AlertCircle className="h-5 w-5" />
              {error}
            </div>
          ) : filteredTxns.length === 0 ? (
            <div className="p-8 text-base text-muted-foreground text-center rounded-lg border border-dashed">
              No transactions yet
            </div>
          ) : (
            <div className="space-y-6">
              {renderDateGroup("Today", groupedTxns.today)}
              {renderDateGroup("Yesterday", groupedTxns.yesterday)}
              {renderDateGroup("This Week", groupedTxns.thisWeek)}
              {renderDateGroup("Earlier", groupedTxns.earlier)}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!showTxnReceipt} onOpenChange={() => setShowTxnReceipt(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center">Transaction Receipt</DialogTitle>
            <DialogDescription className="text-center text-[10px] opacity-50 truncate">
              ID: {showTxnReceipt?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="text-center space-y-4 pt-4">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
                isCredit(showTxnReceipt?.type) ? "bg-green-500/10" : "bg-destructive/10"
              }`}
            >
              {isCredit(showTxnReceipt?.type) ? (
                <TrendingUp className="w-8 h-8 text-green-600" />
              ) : (
                <TrendingDown className="w-8 h-8 text-destructive" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground capitalize">Transaction Details</h3>
              <p className="text-sm text-muted-foreground">
                {showTxnReceipt?.createdAt ? formatTxnDate(showTxnReceipt.createdAt) : ""}
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm text-left">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-bold text-foreground">{showTxnReceipt?.amount ?? 0} B-Coins</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <Badge variant="outline" className="capitalize">
                  {showTxnReceipt?.type || "unknown"}
                </Badge>
              </div>
              {showTxnReceipt?.description && (
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground shrink-0">Description</span>
                  <span className="text-foreground text-right">{showTxnReceipt.description}</span>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">
                <Share2 className="w-4 h-4 mr-1" /> Share
              </Button>
              <Button variant="outline" className="flex-1">
                <Download className="w-4 h-4 mr-1" /> Download
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

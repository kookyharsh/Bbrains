"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Search, AlertCircle, TrendingUp, TrendingDown, Share2, Download } from "lucide-react";
import { Transaction } from "@/services/api/client";
import { format, isToday, isYesterday, parseISO } from "date-fns";

interface TransactionHistoryProps {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
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

  const filteredTxns = transactions.filter((t) => {
    const desc = t.description || "";
    const amt = t.amount?.toString() || "";
    if (txnSearch && !desc.toLowerCase().includes(txnSearch.toLowerCase()) && !amt.includes(txnSearch)) return false;
    return true;
  });

  const isCredit = (type: string | undefined) => {
    const t = type?.toLowerCase() || "";
    return t === "credit" || t === "received";
  };

  return (
    <>
      <Card className="border-0 shadow-none bg-transparent">
        <CardHeader className="px-0 pt-0">
          <div className="flex flex-col gap-3">
            <CardTitle className="text-lg">Recent Transactions</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search..." value={txnSearch} onChange={(e) => setTxnSearch(e.target.value)} className="pl-9 h-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0">
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3 w-full p-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 p-4 text-sm text-red-500">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          ) : filteredTxns.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground text-center">No transactions yet</div>
          ) : (
            <div className="space-y-2">
              {filteredTxns.map((txn) => (
                <button
                  key={txn.id}
                  onClick={() => setShowTxnReceipt(txn)}
                  className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
                >
                  <Avatar className="w-10 h-10 shrink-0">
                    <AvatarFallback className={`text-sm ${isCredit(txn.type) ? "bg-green-500/10 text-green-600" : "bg-destructive/10 text-destructive"}`}>
                      {isCredit(txn.type) ? "+" : "-"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm">{txn.description || "No description"}</p>
                    <p className="text-xs text-muted-foreground">{txn.createdAt ? formatTxnDate(txn.createdAt) : "Unknown date"}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1">
                      {isCredit(txn.type) ? (
                        <TrendingUp className="w-3 h-3 text-green-600" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-destructive" />
                      )}
                      <span className={`font-semibold text-sm ${isCredit(txn.type) ? "text-green-600" : "text-destructive"}`}>
                        {isCredit(txn.type) ? "+" : "-"}{txn.amount ?? 0}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-[10px] capitalize">{txn.type || "unknown"}</Badge>
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Embedded Transaction Receipt Dialog */}
      <Dialog open={!!showTxnReceipt} onOpenChange={() => setShowTxnReceipt(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center">Transaction Receipt</DialogTitle>
            <DialogDescription className="text-center text-[10px] opacity-50 truncate">
              ID: {showTxnReceipt?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="text-center space-y-4 pt-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${isCredit(showTxnReceipt?.type) ? 'bg-green-500/10' : 'bg-destructive/10'}`}>
              {isCredit(showTxnReceipt?.type) ? (
                <TrendingUp className="w-8 h-8 text-green-600" />
              ) : (
                <TrendingDown className="w-8 h-8 text-destructive" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground capitalize">Transaction Details</h3>
              <p className="text-sm text-muted-foreground">{showTxnReceipt?.createdAt ? formatTxnDate(showTxnReceipt.createdAt) : ''}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm text-left">
              <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span className="font-bold text-foreground">{showTxnReceipt?.amount ?? 0} B-Coins</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Type</span><Badge variant="outline" className="capitalize">{showTxnReceipt?.type || "unknown"}</Badge></div>
              {showTxnReceipt?.description && <div className="flex justify-between gap-4"><span className="text-muted-foreground shrink-0">Description</span><span className="text-foreground text-right">{showTxnReceipt.description}</span></div>}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1"><Share2 className="w-4 h-4 mr-1" /> Share</Button>
              <Button variant="outline" className="flex-1"><Download className="w-4 h-4 mr-1" /> Download</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Search, AlertCircle, TrendingUp, TrendingDown, Share2, Download, Calendar, MessageSquare } from "lucide-react";
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
    const desc = t.note || t.description || "";
    const amt = t.amount?.toString() || "";
    const username = t.relatedUser?.username || t.user?.username || "";
    if (txnSearch && 
        !desc.toLowerCase().includes(txnSearch.toLowerCase()) && 
        !amt.includes(txnSearch) &&
        !username.toLowerCase().includes(txnSearch.toLowerCase())
    ) return false;
    return true;
  });

  const isCredit = (type: string | undefined) => {
    const t = type?.toLowerCase() || "";
    return t === "credit" || t === "received" || t === "deposit";
  };

  return (
    <>

        <CardHeader className="px-0 pt-0">
          <div className="flex flex-col gap-3">
            <CardTitle className="text-lg">Recent Transactions</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search by note, amount, or user..." value={txnSearch} onChange={(e) => setTxnSearch(e.target.value)} className="pl-9 h-10" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0">
          {loading ? (
            <div className="grid gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="border-muted p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 p-4 text-sm text-red-500">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          ) : filteredTxns.length === 0 ? (
            <div className="p-8 text-sm text-muted-foreground text-center border-2 border-dashed rounded-xl">
              No transactions found
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredTxns.map((txn) => {
                const credit = isCredit(txn.type);
                const user = txn.relatedUser || txn.user;
                const username = user?.username || "System";
                const avatarUrl = (user as { avatar?: string })?.avatar;
                const note = txn.note || txn.description;

                return (
                  <Card
                    key={txn.id}
                    onClick={() => setShowTxnReceipt(txn)}
                    className="group hover:border-primary/30 transition-all cursor-pointer overflow-hidden shadow-sm hover:shadow-md"
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 min-w-0">
                            <Avatar className="w-10 h-10 border border-muted ring-offset-background group-hover:ring-2 group-hover:ring-primary/20 transition-all">
                              {avatarUrl && <AvatarImage src={avatarUrl} alt={username} />}
                              <AvatarFallback name={username} className="bg-primary/5 text-primary text-xs font-bold">
                                {username.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="font-bold text-sm text-foreground truncate">{username}</p>
                              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {txn.transactionDate ? formatTxnDate(txn.transactionDate) : "Unknown date"}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right flex flex-col items-end gap-1">
                            <div className="flex items-center gap-1">
                              {credit ? (
                                <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                              ) : (
                                <TrendingDown className="w-3.5 h-3.5 text-destructive" />
                              )}
                              <span className={`font-bold text-base ${credit ? "text-green-600" : "text-destructive"}`}>
                                {credit ? "+" : "-"}{txn.amount ?? 0}
                              </span>
                            </div>
                            <Badge 
                              variant="outline" 
                              className={`text-[10px] py-0 h-4 capitalize font-medium ${
                                credit ? "border-green-500/30 text-green-600 bg-green-500/5" : "border-destructive/30 text-destructive bg-destructive/5"
                              }`}
                            >
                              {txn.type || "unknown"}
                            </Badge>
                          </div>
                        </div>

                        {note && (
                          <div className="flex items-start gap-2 bg-muted/30 rounded-lg p-2.5 border border-muted/50 group-hover:bg-muted/50 transition-colors">
                            <MessageSquare className="w-3 h-3 mt-0.5 text-muted-foreground shrink-0" />
                            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 italic">
                             &quot;{note}&quot;
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>


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
              <h3 className="text-lg font-bold text-foreground capitalize">
                {isCredit(showTxnReceipt?.type) ? "Credit Received" : "Debit Transaction"}
              </h3>
              <p className="text-sm text-muted-foreground">{showTxnReceipt?.transactionDate ? formatTxnDate(showTxnReceipt.transactionDate) : ''}</p>
            </div>
            <div className="bg-muted/50 rounded-xl p-4 space-y-3 text-sm text-left border border-muted">
              <div className="flex justify-between items-center pb-2 border-b border-muted">
                <span className="text-muted-foreground">Amount</span>
                <span className={`font-bold text-lg ${isCredit(showTxnReceipt?.type) ? 'text-green-600' : 'text-destructive'}`}>
                  {isCredit(showTxnReceipt?.type) ? "+" : "-"}{showTxnReceipt?.amount ?? 0} B-Coins
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="outline" className="bg-green-500/5 text-green-600 border-green-500/20">Success</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Type</span>
                <Badge variant="outline" className="capitalize">{showTxnReceipt?.type || "unknown"}</Badge>
              </div>
              {(showTxnReceipt?.note || showTxnReceipt?.description) && (
                <div className="pt-2 border-t border-muted">
                  <span className="text-muted-foreground block mb-1">Note</span>
                  <p className="text-foreground text-xs bg-background/50 p-2 rounded-md italic">
                    &quot;{showTxnReceipt.note || showTxnReceipt.description}&quot;
                  </p>
                </div>
              )}
              {(showTxnReceipt?.relatedUser || showTxnReceipt?.user) && (
                <div className="pt-2 border-t border-muted">
                  <span className="text-muted-foreground block mb-1">Party Involved</span>
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback name={showTxnReceipt.relatedUser?.username || showTxnReceipt.user?.username} className="text-[10px]">
                        {(showTxnReceipt.relatedUser?.username || showTxnReceipt.user?.username || "??").substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-xs">
                      {showTxnReceipt.relatedUser?.username || showTxnReceipt.user?.username}
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 h-10"><Share2 className="w-4 h-4 mr-2" /> Share</Button>
              <Button variant="default" className="flex-1 h-10"><Download className="w-4 h-4 mr-2" /> Download</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}


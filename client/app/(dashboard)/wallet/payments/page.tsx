"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DashboardContent } from "@/components/dashboard-content";
import {
  Search,
  CreditCard,
  ShoppingBag,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Eye,
  Filter,
  Calendar,
  TrendingUp,
  TrendingDown,
  Receipt,
  Share2,
  Download,
  Building2,
} from "lucide-react";
import { transactionApi, type Transaction } from "@/services/api/client";

interface PaymentItem {
  name: string;
  quantity: number;
  price: number;
  image: string;
}

interface PaymentDetails {
  id: string;
  date: string;
  status: "completed" | "pending" | "cancelled" | "failed";
  total: number;
  items?: PaymentItem[];
  paymentMethod?: string;
  transactionId?: string;
}

interface Payment {
  id: string;
  type: "wallet" | "market";
  amount: number;
  status: "completed" | "pending" | "cancelled" | "failed";
  description: string;
  createdAt: string;
  details?: PaymentDetails;
}

const mockMarketOrders: PaymentDetails[] = [
  {
    id: "ORD-001",
    date: "2026-03-07",
    status: "completed",
    total: 330,
    paymentMethod: "B-Coins Wallet",
    transactionId: "TXN-W-001",
    items: [
      { name: "Wireless Earbuds", quantity: 1, price: 250, image: "🎧" },
      { name: "Notebook Set (5 Pack)", quantity: 1, price: 80, image: "📓" },
    ],
  },
  {
    id: "ORD-002",
    date: "2026-03-05",
    status: "completed",
    total: 45,
    paymentMethod: "B-Coins Wallet",
    transactionId: "TXN-W-002",
    items: [{ name: "Water Bottle (1L)", quantity: 1, price: 45, image: "🍶" }],
  },
  {
    id: "ORD-003",
    date: "2026-03-04",
    status: "pending",
    total: 350,
    paymentMethod: "B-Coins Wallet",
    transactionId: "TXN-W-003",
    items: [{ name: "Campus Hoodie", quantity: 1, price: 350, image: "🧥" }],
  },
  {
    id: "ORD-004",
    date: "2026-02-28",
    status: "cancelled",
    total: 200,
    paymentMethod: "B-Coins Wallet",
    transactionId: "TXN-W-004",
    items: [{ name: "Graphing Calculator", quantity: 1, price: 200, image: "🔢" }],
  },
];

const mockWalletPayments: Payment[] = [
  {
    id: "TXN-001",
    type: "wallet",
    amount: 500,
    status: "completed",
    description: "Wallet Top-up via Bank Transfer",
    createdAt: "2026-03-10T10:30:00Z",
  },
  {
    id: "TXN-002",
    type: "wallet",
    amount: -150,
    status: "completed",
    description: "Sent to @john_doe",
    createdAt: "2026-03-09T14:22:00Z",
  },
  {
    id: "TXN-003",
    type: "wallet",
    amount: 200,
    status: "completed",
    description: "Received from @jane_smith",
    createdAt: "2026-03-08T09:15:00Z",
  },
  {
    id: "TXN-004",
    type: "wallet",
    amount: -75,
    status: "completed",
    description: "Service Fee",
    createdAt: "2026-03-07T16:45:00Z",
  },
  {
    id: "TXN-005",
    type: "wallet",
    amount: 1000,
    status: "completed",
    description: "Wallet Top-up via Credit Card",
    createdAt: "2026-03-06T11:00:00Z",
  },
];

export default function PaymentHistoryPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      
      const txnRes = await transactionApi.getMyTransactions();
      
      let walletPayments: Payment[] = [];
      if (txnRes.success && txnRes.data) {
        const txns = Array.isArray(txnRes.data) ? txnRes.data : [];
        walletPayments = txns.map((t: Transaction) => ({
          id: String(t.id),
          type: "wallet" as const,
          amount: t.type === "credit" ? Math.abs(Number(t.amount)) : -Math.abs(Number(t.amount)),
          status: (t.status === "success" ? "completed" : t.status === "pending" ? "pending" : "failed") as any,
          description: t.note || "Wallet Transaction",
          createdAt: t.transactionDate,
        }));
      }

      const marketPayments: Payment[] = mockMarketOrders.map((order) => ({
        id: order.id,
        type: "market",
        amount: -order.total,
        status: order.status,
        description: order.items?.map(i => i.name).join(", ") || "Market Order",
        createdAt: order.date,
        details: order,
      }));

      setPayments([...walletPayments, ...marketPayments]);
    } catch (err) {
      setError("Failed to load payment history");
      setPayments([...mockWalletPayments, ...mockMarketOrders.map((order) => ({
        id: order.id,
        type: "market" as const,
        amount: -order.total,
        status: order.status,
        description: order.items?.map(i => i.name).join(", ") || "Market Order",
        createdAt: order.date,
        details: order,
      }))]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filteredPayments = payments.filter((payment) => {
    if (searchQuery && !payment.description.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !payment.id.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (typeFilter !== "all" && payment.type !== typeFilter) {
      return false;
    }
    if (statusFilter !== "all" && payment.status !== statusFilter) {
      return false;
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">Completed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20">Pending</Badge>;
      case "cancelled":
        return <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20">Cancelled</Badge>;
      case "failed":
        return <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatShortDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const totalSpent = filteredPayments
    .filter(p => p.amount < 0)
    .reduce((sum, p) => sum + Math.abs(p.amount), 0);
  
  const totalReceived = filteredPayments
    .filter(p => p.amount > 0)
    .reduce((sum, p) => sum + p.amount, 0);

  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment);
  };

  return (
    <DashboardContent>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <CreditCard className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Payment History</h1>
              <p className="text-sm text-muted-foreground">View all your payment transactions</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <ArrowUpRight className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Received</p>
                  <p className="text-xl font-bold text-green-600">{totalReceived} B-Coins</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-destructive/10">
                  <ArrowDownLeft className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-xl font-bold text-destructive">{totalSpent} B-Coins</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Receipt className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Transactions</p>
                  <p className="text-xl font-bold text-foreground">{filteredPayments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <CardTitle className="text-lg">All Payments</CardTitle>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search payments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 w-full sm:w-50"
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-32.5 h-9">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="wallet">Wallet</SelectItem>
                    <SelectItem value="market">Market</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32.5 h-9">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
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
            ) : filteredPayments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No payment history found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 shrink-0">
                        <AvatarFallback className={
                          payment.type === "market" 
                            ? "bg-blue-500/10 text-blue-600"
                            : payment.amount > 0 
                              ? "bg-green-500/10 text-green-600"
                              : "bg-destructive/10 text-destructive"
                        }>
                          {payment.type === "market" ? (
                            <ShoppingBag className="w-4 h-4" />
                          ) : payment.amount > 0 ? (
                            <ArrowUpRight className="w-4 h-4" />
                          ) : (
                            <ArrowDownLeft className="w-4 h-4" />
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground text-sm truncate max-w-50">
                          {payment.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {formatShortDate(payment.createdAt)}
                          <span className="mx-1">•</span>
                          {payment.type === "market" ? (
                            <span className="flex items-center gap-1">
                              <ShoppingBag className="w-3 h-3" />
                              Market Order
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <Wallet className="w-3 h-3" />
                              Wallet
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className={`font-semibold text-sm ${payment.amount > 0 ? "text-green-600" : "text-destructive"}`}>
                          {payment.amount > 0 ? "+" : "-"}{Math.abs(payment.amount)} B-Coins
                        </p>
                        {getStatusBadge(payment.status)}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleViewDetails(payment)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedPayment && selectedPayment.type === "market" ? (
                  <>
                    <ShoppingBag className="w-5 h-5 text-blue-600" />
                    Market Order Details
                  </>
                ) : (
                  <>
                    <Wallet className="w-5 h-5 text-primary" />
                    Transaction Details
                  </>
                )}
              </DialogTitle>
              <DialogDescription>
                {selectedPayment && formatDate(selectedPayment.createdAt)}
              </DialogDescription>
            </DialogHeader>
            
            {selectedPayment && (
              <div className="space-y-4">
                <div className="flex items-center justify-center py-4">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                    selectedPayment.status === "completed" 
                      ? "bg-green-500/10"
                      : selectedPayment.status === "pending"
                        ? "bg-yellow-500/10"
                        : "bg-red-500/10"
                  }`}>
                    {selectedPayment.status === "completed" ? (
                      <TrendingUp className="w-10 h-10 text-green-600" />
                    ) : selectedPayment.status === "pending" ? (
                      <Calendar className="w-10 h-10 text-yellow-600" />
                    ) : (
                      <TrendingDown className="w-10 h-10 text-red-600" />
                    )}
                  </div>
                </div>

                <div className="text-center mb-4">
                  <p className={`text-3xl font-bold ${
                    selectedPayment.amount > 0 ? "text-green-600" : "text-destructive"
                  }`}>
                    {selectedPayment.amount > 0 ? "+" : "-"}{Math.abs(selectedPayment.amount)} B-Coins
                  </p>
                  <div className="mt-2">{getStatusBadge(selectedPayment.status)}</div>
                </div>

                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Receipt className="w-4 h-4" />
                      ID
                    </span>
                    <span className="font-medium text-foreground font-mono text-sm">{selectedPayment.id}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Date
                    </span>
                    <span className="font-medium text-foreground">{formatShortDate(selectedPayment.createdAt)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Type
                    </span>
                    <span className="font-medium text-foreground capitalize">
                      {selectedPayment.type}
                    </span>
                  </div>

                  {selectedPayment.details && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground flex items-center gap-2">
                          <CreditCard className="w-4 h-4" />
                          Payment Method
                        </span>
                        <span className="font-medium text-foreground">
                          {selectedPayment.details.paymentMethod || "B-Coins Wallet"}
                        </span>
                      </div>

                      {selectedPayment.details.items && (
                        <div className="border-t border-border pt-3 mt-3">
                          <p className="text-muted-foreground text-sm mb-2">Items</p>
                          <div className="space-y-2">
                            {selectedPayment.details.items.map((item: PaymentItem, i: number) => (
                              <div key={i} className="flex items-center gap-3">
                                <span className="text-xl">{item.image}</span>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-foreground text-sm truncate">{item.name}</p>
                                  <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                </div>
                                <span className="font-semibold text-foreground text-sm">{item.price} B-Coins</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1">
                    <Share2 className="w-4 h-4 mr-1" />
                    Share
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardContent>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowUpRight,
  ArrowDownLeft,
  QrCode,
  Search,
  Download,
  Share2,
  TrendingUp,
  TrendingDown,
  CreditCard,
  ScanLine,
  AlertCircle,
} from "lucide-react";
import QRCode from "react-qr-code";
import { Scanner } from "@yudiel/react-qr-scanner";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { walletApi, transactionApi, Transaction, WalletData } from "@/lib/api-services";
import { validate, hasErrors, ValidationErrors, commonRules } from "@/lib/validation";

const chartData = [
  { month: "Jan", sent: 450, received: 800 },
  { month: "Feb", sent: 320, received: 600 },
  { month: "Mar", sent: 180, received: 350 },
];

export default function WalletPage() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);
  const [showQrDialog, setShowQrDialog] = useState(false);
  const [showScanDialog, setShowScanDialog] = useState(false);
  const [showTxnReceipt, setShowTxnReceipt] = useState<Transaction | null>(null);
  
  const [sendTo, setSendTo] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [sendNote, setSendNote] = useState("");
  const [pin, setPin] = useState("");
  const [sending, setSending] = useState(false);
  
  const [txnFilter, setTxnFilter] = useState("this-month");
  const [txnSearch, setTxnSearch] = useState("");
  const [chartFilter, setChartFilter] = useState("this-month");
  const [formErrors, setFormErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [walletRes, txnRes] = await Promise.all([
          walletApi.getWallet(),
          transactionApi.getMyTransactions(),
        ]);

        if (walletRes.success && walletRes.data) {
          setWallet(walletRes.data);
        }
        if (txnRes.success && txnRes.data) {
          setTransactions(txnRes.data);
        }
      } catch (err) {
        setError("Failed to load wallet data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredTxns = transactions.filter((t) => {
    if (txnSearch && !t.description.toLowerCase().includes(txnSearch.toLowerCase()) && !t.amount.toString().includes(txnSearch)) return false;
    return true;
  });

  const handleSendMoney = () => {
    const errors = validate(
      { amount: sendAmount },
      { amount: { required: true, min: 1 } }
    );
    
    if (!sendTo.trim()) {
      setFormErrors({ recipient: "Recipient is required" });
      return;
    }
    
    if (hasErrors(errors)) {
      setFormErrors(errors);
      return;
    }

    const amount = Number(sendAmount);
    const currentBalance = Number(wallet?.balance ?? 0);
    if (amount > currentBalance) {
      setFormErrors({ amount: `Insufficient balance. Available: ${currentBalance}` });
      return;
    }
    
    setFormErrors({});
    setShowSendDialog(false);
    setShowPinDialog(true);
  };

  const handlePinSubmit = async () => {
    if (pin.length < 4) {
      toast.error("Please enter your PIN");
      return;
    }

    setSending(true);
    try {
      const response = await walletApi.transfer(sendTo, Number(sendAmount), pin);
      
      if (response.success) {
        setShowPinDialog(false);
        setPin("");
        
        const newTxn: Transaction = {
          id: `TXN${Date.now()}`,
          amount: Number(sendAmount),
          type: "debit",
          description: sendNote || `Transfer to ${sendTo}`,
          createdAt: new Date().toISOString(),
        };
        setTransactions((prev) => [newTxn, ...prev]);
        
        if (wallet) {
          setWallet({ ...wallet, balance: Number(wallet.balance) - Number(sendAmount) });
        }
        
        setShowReceiptDialog(true);
        toast.success("Transfer successful!");
      } else {
        toast.error(response.message || "Transfer failed");
      }
    } catch (err) {
      toast.error("Transfer failed");
    } finally {
      setSending(false);
    }
  };

  const handleInputChange = useCallback((field: string, value: string) => {
    if (field === 'sendTo') setSendTo(value);
    if (field === 'sendAmount') setSendAmount(value);
    if (field === 'sendNote') setSendNote(value);
    if (field === 'pin') setPin(value);
    setFormErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Wallet</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Wallet Card */}
        <Card className="lg:col-span-1 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-0">
          <CardContent className="p-6">
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-12 w-32" />
                <Skeleton className="h-4 w-28" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <CreditCard className="w-8 h-8 opacity-80" />
                  <span className="text-xs opacity-70">B-Wallet</span>
                </div>
                <p className="text-sm opacity-80 mb-1">Total Balance</p>
                <p className="text-4xl font-bold mb-4">{Number(wallet?.balance ?? 0).toLocaleString()}</p>
                <p className="text-sm opacity-80">Wallet Holder</p>
                <p className="text-xs opacity-60 mt-1">
                  {wallet?.pinSet ? 'PIN Set' : 'PIN Not Set'}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" onClick={async () => {
                try {
                  const balanceRes = await walletApi.getBalance();
                  if (balanceRes.success && balanceRes.data && wallet) {
                    setWallet({ ...wallet, balance: balanceRes.data.balance });
                  }
                } catch (err) {
                  console.error("Failed to fetch latest balance");
                }
                setShowSendDialog(true);
              }}>
                <ArrowUpRight className="w-6 h-6 text-destructive" />
                <span className="text-sm">Send Money</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
                <ArrowDownLeft className="w-6 h-6 text-green-600" />
                <span className="text-sm">Receive</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" onClick={() => setShowQrDialog(true)}>
                <QrCode className="w-6 h-6 text-primary" />
                <span className="text-sm">Show QR</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" onClick={() => setShowScanDialog(true)}>
                <ScanLine className="w-6 h-6 text-primary" />
                <span className="text-sm">Scan QR</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg">Spending Overview</CardTitle>
          <Tabs value={chartFilter} onValueChange={setChartFilter}>
            <TabsList className="h-8">
              <TabsTrigger value="this-week" className="text-xs px-2">This Week</TabsTrigger>
              <TabsTrigger value="this-month" className="text-xs px-2">This Month</TabsTrigger>
              <TabsTrigger value="3-months" className="text-xs px-2">3 Months</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <RechartsTooltip />
                <Bar dataKey="sent" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} name="Sent" />
                <Bar dataKey="received" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Received" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-lg">Transaction History</CardTitle>
            <div className="flex gap-2">
              <div className="relative flex-1 sm:w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search..." value={txnSearch} onChange={(e) => setTxnSearch(e.target.value)} className="pl-9 h-9" />
              </div>
              <Select value={txnFilter} onValueChange={setTxnFilter}>
                <SelectTrigger className="w-[140px] h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="this-month">This Month</SelectItem>
                  <SelectItem value="30-days">Last 30 Days</SelectItem>
                  <SelectItem value="90-days">Last 90 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
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
            <div className="p-4 text-sm text-muted-foreground text-center">
              No transactions yet
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTxns.map((txn) => (
                <button
                  key={txn.id}
                  onClick={() => setShowTxnReceipt(txn)}
                  className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
                >
                  <Avatar className="w-10 h-10 shrink-0">
                    <AvatarFallback className={`text-sm ${txn.type === "credit" || txn.type === "received" ? "bg-green-500/10 text-green-600" : "bg-destructive/10 text-destructive"}`}>
                      {txn.type === "credit" || txn.type === "received" ? "+" : "-"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm">{txn.description}</p>
                    <p className="text-xs text-muted-foreground">{new Date(txn.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1">
                      {txn.type === "credit" || txn.type === "received" ? (
                        <TrendingUp className="w-3 h-3 text-green-600" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-destructive" />
                      )}
                      <span className={`font-semibold text-sm ${txn.type === "credit" || txn.type === "received" ? "text-green-600" : "text-destructive"}`}>
                        {txn.type === "credit" || txn.type === "received" ? "+" : "-"}{txn.amount}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {txn.type}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Send Money Dialog */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Money</DialogTitle>
            <DialogDescription>Transfer B-Coins to another user</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Send to (User ID or Username)</Label>
              <Input 
                placeholder="Search username..." 
                value={sendTo} 
                onChange={(e) => handleInputChange('sendTo', e.target.value)} 
                className={formErrors.recipient ? 'border-red-500' : ''}
              />
              {formErrors.recipient && <p className="text-sm text-red-500 mt-1">{formErrors.recipient}</p>}
            </div>
            <div>
              <Label>Amount</Label>
              <Input 
                type="number" 
                placeholder="0" 
                value={sendAmount} 
                onChange={(e) => handleInputChange('sendAmount', e.target.value)}
                className={formErrors.amount ? 'border-red-500' : ''}
              />
              {formErrors.amount && <p className="text-sm text-red-500 mt-1">{formErrors.amount}</p>}
            </div>
            <div>
              <Label>Note (optional)</Label>
              <Input placeholder="What's this for?" value={sendNote} onChange={(e) => handleInputChange('sendNote', e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSendMoney} disabled={!sendTo || !sendAmount || sending}>
              Send Money
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PIN Dialog */}
      <Dialog open={showPinDialog} onOpenChange={setShowPinDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Enter Wallet PIN</DialogTitle>
            <DialogDescription>Enter your PIN to confirm transfer of {sendAmount} B-Coins</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>PIN (4-6 digits)</Label>
            <Input
              type="password"
              placeholder="Enter your PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              className="text-center tracking-widest text-lg"
            />
          </div>
          <DialogFooter>
            <Button onClick={handlePinSubmit} disabled={pin.length < 4 || sending} className="w-full">
              {sending ? 'Confirming...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={showReceiptDialog} onOpenChange={setShowReceiptDialog}>
        <DialogContent className="sm:max-w-sm">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Transaction Successful</h3>
              <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString()}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Recipient</span><span className="font-medium text-foreground">{sendTo}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span className="font-bold text-foreground">{sendAmount} B-Coins</span></div>
              {sendNote && <div className="flex justify-between"><span className="text-muted-foreground">Note</span><span className="text-foreground">{sendNote}</span></div>}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1"><Share2 className="w-4 h-4 mr-1" /> Share</Button>
              <Button variant="outline" className="flex-1"><Download className="w-4 h-4 mr-1" /> Download</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Transaction Receipt */}
      <Dialog open={!!showTxnReceipt} onOpenChange={() => setShowTxnReceipt(null)}>
        <DialogContent className="sm:max-w-sm">
          <div className="text-center space-y-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto bg-green-500/10`}>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground capitalize">Transaction</h3>
              <p className="text-sm text-muted-foreground">{showTxnReceipt ? new Date(showTxnReceipt.createdAt).toLocaleDateString() : ''}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Transaction ID</span><span className="font-medium text-foreground">{showTxnReceipt?.id}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span className="font-bold text-foreground">{showTxnReceipt?.amount} B-Coins</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Type</span><Badge variant="outline" className="capitalize">{showTxnReceipt?.type}</Badge></div>
              {showTxnReceipt?.description && <div className="flex justify-between"><span className="text-muted-foreground">Description</span><span className="text-foreground">{showTxnReceipt.description}</span></div>}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1"><Share2 className="w-4 h-4 mr-1" /> Share</Button>
              <Button variant="outline" className="flex-1"><Download className="w-4 h-4 mr-1" /> Download</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Dialog */}
      <Dialog open={showQrDialog} onOpenChange={setShowQrDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Your Wallet QR</DialogTitle>
            <DialogDescription>Others can scan this to send you money</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center py-4">
            <div className="p-4 bg-white rounded-xl shadow-inner">
              <QRCode
                value={JSON.stringify({ walletId: wallet?.id || '', name: wallet?.user?.username || '' })}
                size={180}
                level="H"
              />
            </div>
            <p className="text-sm text-muted-foreground mt-3 font-mono">{wallet?.id}</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Scan QR Dialog */}
      <Dialog open={showScanDialog} onOpenChange={setShowScanDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Scan QR Code</DialogTitle>
            <DialogDescription>Point your camera at a wallet QR code to send money</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4">
            <div className="w-64 h-64 overflow-hidden rounded-2xl border-2 border-border shadow-inner">
              <Scanner
                onScan={(result) => {
                  if (result && result.length > 0) {
                    try {
                      const data = JSON.parse(result[0].rawValue);
                      if (data.walletId) {
                        setSendTo(data.walletId);
                        setShowScanDialog(false);
                        setShowSendDialog(true);
                      }
                    } catch {
                      toast.error("Invalid QR code");
                    }
                  }
                }}
                scanDelay={500}
                allowMultiple={false}
                components={{ finder: true }}
              />
            </div>
            <p className="text-xs text-muted-foreground text-center px-4">
              Point your camera at another user's wallet QR code to send them money.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

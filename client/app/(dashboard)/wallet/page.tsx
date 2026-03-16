"use client";

import { useState, useEffect } from "react";
import { AlertCircle, ArrowUpRight, ArrowDownLeft, QrCode, ScanLine } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardContent } from "@/components/dashboard-content";

// API and Types
import { walletApi, transactionApi, dashboardApi, Transaction, WalletData, User } from "@/lib/api-services";

// Modular Components
import { WalletHero } from "./_components/wallethero";
import { SpendingsChart } from "./_components/spendingschart";
import { TransactionHistory } from "./_components/transactionHistory";
import { WalletDialogs } from "./_components/dialogs"; // Ensure you move your dialogs here!

export default function WalletPage() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog States
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showQrDialog, setShowQrDialog] = useState(false);
  const [showScanDialog, setShowScanDialog] = useState(false);
  const [scannedWalletId, setScannedWalletId] = useState("");

  const fetchData = async () => {
    try {
      const [walletRes, txnRes, userRes] = await Promise.all([
        walletApi.getWallet(),
        transactionApi.getMyTransactions(),
        dashboardApi.getUser(),
      ]);

      if (walletRes.success && walletRes.data) setWallet(walletRes.data);
      if (userRes.success && userRes.data) setUser(userRes.data);
      if (txnRes.success && txnRes.data) {
        const txnData = (txnRes.data as { data?: Transaction[] })?.data || txnRes.data;
        setTransactions(Array.isArray(txnData) ? txnData : []);
      }
    } catch (err) {
      setError("Failed to load wallet data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleScanSuccess = (walletId: string) => {
    setScannedWalletId(walletId);
    setShowScanDialog(false);
    setShowSendDialog(true);
  };

  // Calculations
  const walletBalance = Number(wallet?.balance ?? 0);
  const xpValue = typeof user?.xp === 'object' && user.xp !== null ? Number(user.xp.xp || 0) : Number(user?.xp || 0);
  const levelValue = typeof user?.xp === 'object' && user.xp !== null ? Number(user.xp.level || Math.floor(xpValue / 1000) + 1) : Math.floor(xpValue / 1000) + 1;
  const nextLevel = { levelNumber: levelValue + 1, requiredXp: levelValue * 1000 };
  const progressPercent = Math.min(Math.floor(((xpValue % 1000) / 1000) * 100), 100);

  return (
    <DashboardContent>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Wallet</h1>

        <WalletHero 
          walletBalance={walletBalance} 
          xp={xpValue} 
          level={levelValue} 
          nextLevel={nextLevel} 
          progressPercent={progressPercent} 
        />

        {error && (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Quick Actions Card */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" onClick={() => setShowSendDialog(true)}>
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

          <SpendingsChart />

          <TransactionHistory 
            transactions={transactions} 
            loading={loading} 
            error={error} 
          />
        </div>

        {/* Global Dialogs isolated into a separate component for cleanliness */}
        <WalletDialogs
          wallet={wallet}
          showSendDialog={showSendDialog}
          setShowSendDialog={setShowSendDialog}
          showQrDialog={showQrDialog}
          setShowQrDialog={setShowQrDialog}
          showScanDialog={showScanDialog}
          setShowScanDialog={setShowScanDialog}
          prefilledWalletId={scannedWalletId}
          onScanSuccess={handleScanSuccess}
          onTransferSuccess={fetchData} // Refresh data on success
        />
      </div>
    </DashboardContent>
  );
}
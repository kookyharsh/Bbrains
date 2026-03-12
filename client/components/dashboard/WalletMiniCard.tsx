"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, TrendingUp, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { walletApi, WalletData } from "@/lib/api-services";

interface WalletMiniCardProps {
  initialWallet?: WalletData | null;
  initialBalance?: number;
}

export function WalletMiniCard({ initialWallet, initialBalance }: WalletMiniCardProps) {
  const [wallet, setWallet] = useState<WalletData | null>(initialWallet || null);
  const [loading, setLoading] = useState(!initialWallet);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialWallet) {
      setLoading(false);
      return;
    }

    const fetchWallet = async () => {
      try {
        const response = await walletApi.getWallet();
        if (response.success && response.data) {
          setWallet(response.data);
        } else {
          setError(response.message || "Failed to load wallet");
        }
      } catch (err) {
        setError("Failed to load wallet");
      } finally {
        setLoading(false);
      }
    };

    fetchWallet();
  }, [initialWallet]);

  const balance = Number(wallet?.balance ?? initialBalance ?? 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Wallet className="h-5 w-5 text-muted-foreground" />
            Wallet
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-1">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 text-sm text-red-500">
            <AlertCircle className="h-4 w-4" />
            <span>Error</span>
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-2xl font-bold">${balance.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total balance</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

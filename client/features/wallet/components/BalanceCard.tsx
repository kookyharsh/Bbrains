"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Copy, Eye, EyeOff, Wallet } from "lucide-react"
import type { WalletUser } from "../data"
import { formatCurrency, getInitials } from "../utils"

interface BalanceCardProps {
    walletUser: WalletUser
    balanceVisible: boolean
    onToggleBalance: () => void
}

export function BalanceCard({ walletUser, balanceVisible, onToggleBalance }: BalanceCardProps) {
    const displayBalance = Number(walletUser.balance ?? 0);
    return (
        <Card className="relative overflow-hidden bg-linear-to-br from-primary/90 to-primary dark:from-primary/80 dark:to-primary/60 text-primary-foreground border-0 shadow-xl shadow-primary/20">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15)_0%,transparent_60%)]" />
            <CardContent className="relative pt-6 pb-6 space-y-5">
                {/* User info */}
                <div className="flex items-center gap-3">
                    <Avatar size="lg" className="border-2 border-white/20">
                        <AvatarImage src={walletUser.avatarUrl} />
                        <AvatarFallback className="bg-white/20 text-primary-foreground font-bold text-sm">
                            {getInitials(walletUser.name)}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-sm font-medium opacity-80">Welcome back,</p>
                        <p className="text-lg font-bold leading-tight">{walletUser.name}</p>
                    </div>
                </div>

                {/* Balance */}
                <div>
                    <p className="text-xs font-medium opacity-70 uppercase tracking-wider mb-1">Available Balance</p>
                    <div className="flex items-center gap-3">
                        <span className="text-4xl font-extrabold tracking-tight">
                            {balanceVisible ? formatCurrency(displayBalance) : "₹ ••••••"}
                        </span>
                        <button
                            onClick={onToggleBalance}
                            className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
                        >
                            {balanceVisible
                                ? <Eye className="size-5 opacity-70" />
                                : <EyeOff className="size-5 opacity-70" />
                            }
                        </button>
                    </div>
                </div>

                {/* Wallet ID */}
                <div className="flex items-center gap-2 pt-1">
                    <div className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-white/15">
                        <Wallet className="size-3" />
                        <span className="font-mono text-[11px]">{walletUser.walletId}</span>
                    </div>
                    <button
                        onClick={() => navigator.clipboard?.writeText(walletUser.walletId)}
                        className="p-1 rounded-full hover:bg-white/10 transition-colors"
                        title="Copy Wallet ID"
                    >
                        <Copy className="size-3.5 opacity-60" />
                    </button>
                </div>
            </CardContent>
        </Card>
    )
}

"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { CheckCircle2, Download, Share2, XCircle } from "lucide-react"
import QRCode from "react-qr-code"
import { Scanner } from "@yudiel/react-qr-scanner"
import type { Transaction, WalletUser } from "../data"
import { formatCurrency, formatDate } from "../utils"
import { getTxnBadge } from "./transactionHistory"

// ─── PIN Dialog ────────────────────────────────────────────────────────────────

interface PinDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    pin: string[]
    pinError: string
    amount: string
    recipientName: string | undefined
    pinRefs: React.RefObject<HTMLInputElement>[]
    onPinInput: (index: number, value: string) => void
    onPinKeyDown: (index: number, e: React.KeyboardEvent) => void
    onSubmit: () => void
}

export function PinDialog({
    open, onOpenChange, pin, pinError, amount, recipientName,
    pinRefs, onPinInput, onPinKeyDown, onSubmit,
}: PinDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle className="text-center text-lg font-bold">Enter PIN</DialogTitle>
                    <DialogDescription className="text-center">
                        Enter your 6-digit PIN to send{" "}
                        <strong>{formatCurrency(parseFloat(amount) || 0)}</strong> to{" "}
                        <strong>{recipientName}</strong>
                    </DialogDescription>
                </DialogHeader>

                <div className="flex justify-center gap-2 my-4">
                    {pin.map((digit, i) => (
                        <input
                            key={i}
                            ref={pinRefs[i]}
                            type="password"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={e => onPinInput(i, e.target.value)}
                            onKeyDown={e => onPinKeyDown(i, e)}
                            className="w-10 h-12 text-center text-xl font-bold rounded-xl border border-border bg-muted/30 focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none transition-all"
                        />
                    ))}
                </div>

                {pinError && (
                    <p className="text-center text-xs text-destructive font-medium">{pinError}</p>
                )}

                <DialogFooter className="flex-col gap-2 sm:flex-col">
                    <Button onClick={onSubmit} className="w-full font-bold" size="lg">
                        <CheckCircle2 className="size-4 mr-2" />
                        Confirm Payment
                    </Button>
                    <DialogClose asChild>
                        <Button variant="ghost" className="w-full">Cancel</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// ─── Receipt Dialog (after send) ──────────────────────────────────────────────

interface ReceiptDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    receipt: Transaction | null
    onShare: () => void
    onDownload: () => void
}

export function ReceiptDialog({ open, onOpenChange, receipt, onShare, onDownload }: ReceiptDialogProps) {
    if (!receipt) return null
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle className="sr-only">Payment Receipt</DialogTitle>
                </DialogHeader>
                <div className="text-center space-y-3 pt-2">
                    <div className="mx-auto w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <CheckCircle2 className="size-7 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-foreground">Payment Successful!</h3>
                        <p className="text-xs text-muted-foreground mt-1">Your transaction is complete</p>
                    </div>
                </div>

                <ReceiptDetails txn={receipt} />

                <div className="flex gap-3">
                    <Button variant="outline" className="flex-1 font-semibold" onClick={onShare}>
                        <Share2 className="size-4 mr-1.5" />Share
                    </Button>
                    <Button variant="outline" className="flex-1 font-semibold" onClick={onDownload}>
                        <Download className="size-4 mr-1.5" />Download
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

// ─── Transaction Receipt Dialog (from history) ────────────────────────────────

interface TxnReceiptDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    txn: Transaction | null
    onDownload: () => void
}

export function TxnReceiptDialog({ open, onOpenChange, txn, onDownload }: TxnReceiptDialogProps) {
    if (!txn) return null

    function handleShare() {
        if (navigator.share) {
            navigator.share({
                title: "Transaction Receipt",
                text: `${txn!.type === "credit" ? "Received" : "Sent"} ${formatCurrency(txn!.amount)} ${txn!.type === "credit" ? "from" : "to"} ${txn!.recipientName}. Txn ID: ${txn!.id}`,
            }).catch(() => { })
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle className="sr-only">Transaction Receipt</DialogTitle>
                </DialogHeader>
                <div className="text-center space-y-3 pt-2">
                    <div className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center ${txn.type === "unsuccessful"
                        ? "bg-yellow-100 dark:bg-yellow-900/30"
                        : "bg-green-100 dark:bg-green-900/30"
                        }`}>
                        {txn.type === "unsuccessful"
                            ? <XCircle className="size-7 text-yellow-600 dark:text-yellow-400" />
                            : <CheckCircle2 className="size-7 text-green-600 dark:text-green-400" />
                        }
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-foreground">
                            {txn.type === "unsuccessful" ? "Transaction Failed" : "Transaction Successful"}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                            {txn.type === "credit" ? "Money received" : txn.type === "debit" ? "Money sent" : "Payment could not be processed"}
                        </p>
                    </div>
                </div>

                <ReceiptDetails txn={txn} showStatus />

                <div className="flex gap-3">
                    <Button variant="outline" className="flex-1 font-semibold" onClick={handleShare}>
                        <Share2 className="size-4 mr-1.5" />Share
                    </Button>
                    <Button variant="outline" className="flex-1 font-semibold" onClick={onDownload}>
                        <Download className="size-4 mr-1.5" />Download
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

// ─── Shared receipt details block ─────────────────────────────────────────────

function ReceiptDetails({ txn, showStatus = false }: { txn: Transaction; showStatus?: boolean }) {
    return (
        <div className="bg-muted/30 rounded-xl p-4 space-y-3 border border-border/50">
            <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium text-foreground">{formatDate(txn.date)}</span>
            </div>
            <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Transaction ID</span>
                <span className="font-mono text-xs font-medium text-foreground">{txn.id}</span>
            </div>
            <div className="border-t border-border/50" />
            <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Recipient</span>
                <span className="font-medium text-foreground">{txn.recipientName}</span>
            </div>
            <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-bold text-lg text-foreground">{formatCurrency(txn.amount)}</span>
            </div>
            <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Note</span>
                <span className="font-medium text-foreground text-right max-w-[60%]">{txn.note}</span>
            </div>
            {showStatus && (
                <div className="flex justify-between text-sm items-center">
                    <span className="text-muted-foreground">Status</span>
                    {getTxnBadge(txn.type)}
                </div>
            )}
        </div>
    )
}

// ─── Show QR Dialog ───────────────────────────────────────────────────────────

interface ShowQRDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    walletUser: WalletUser
}

export function ShowQRDialog({ open, onOpenChange, walletUser }: ShowQRDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xs">
                <DialogHeader>
                    <DialogTitle className="text-center text-lg font-bold">Your QR Code</DialogTitle>
                    <DialogDescription className="text-center">Share this QR code to receive money</DialogDescription>
                </DialogHeader>
                <div className="flex justify-center p-6">
                    <div className="p-4 bg-white rounded-2xl shadow-inner">
                        <QRCode
                            value={JSON.stringify({ walletId: walletUser.walletId, name: walletUser.name })}
                            size={180}
                            level="H"
                        />
                    </div>
                </div>
                <div className="text-center space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground">Wallet ID</p>
                    <p className="font-mono text-sm font-bold text-foreground">{walletUser.walletId}</p>
                </div>
            </DialogContent>
        </Dialog>
    )
}

// ─── Scan QR Dialog ───────────────────────────────────────────────────────────

interface ScanQRDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onScanSuccess: (walletId: string, name: string) => void
}

export function ScanQRDialog({ open, onOpenChange, onScanSuccess }: ScanQRDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle className="text-center text-lg font-bold">Scan QR Code</DialogTitle>
                    <DialogDescription className="text-center">
                        Point your camera at a QR code to send money
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center gap-4">
                    <div className="w-64 h-64 overflow-hidden rounded-2xl border-2 border-border shadow-inner mt-2">
                        <Scanner
                            onScan={(result) => {
                                if (result && result.length > 0) {
                                    try {
                                        const data = JSON.parse(result[0].rawValue)
                                        if (data.walletId && data.name) {
                                            onScanSuccess(String(data.walletId), data.name)
                                        }
                                    } catch {
                                        console.error("Invalid QR code format")
                                    }
                                }
                            }}
                            scanDelay={500}
                            allowMultiple={false}
                            components={{ finder: true }}
                        />
                    </div>
                    <p className="text-xs text-muted-foreground text-center px-4">
                        Point your camera at another users wallet QR code to instantly send them money.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    )
}
"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { QrCode, ScanLine, Search, Send, XCircle } from "lucide-react"
import type { SearchUser } from "../data"
import { getInitials } from "../utils"

interface SendMoneyCardProps {
    recipientQuery: string
    selectedRecipient: SearchUser | null
    amount: string
    note: string
    showUserDropdown: boolean
    searchResults: SearchUser[]
    onRecipientQueryChange: (val: string) => void
    onRecipientSelect: (user: SearchUser) => void
    onRecipientClear: () => void
    onAmountChange: (val: string) => void
    onNoteChange: (val: string) => void
    onShowDropdown: (show: boolean) => void
    onSend: () => void
    onShowQR: () => void
    onScanQR: () => void
}

export function SendMoneyCard({
    recipientQuery, selectedRecipient, amount, note,
    showUserDropdown, searchResults,
    onRecipientQueryChange, onRecipientSelect, onRecipientClear,
    onAmountChange, onNoteChange, onShowDropdown,
    onSend, onShowQR, onScanQR,
}: SendMoneyCardProps) {
    return (
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Send className="size-4 text-primary" />
                    Send Money
                </CardTitle>
                <CardDescription>Transfer to another user instantly</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">

                {/* Recipient search */}
                <div className="relative">
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Send money to</label>
                    {selectedRecipient ? (
                        <div className="flex items-center gap-2 bg-muted/50 rounded-2xl px-3 py-2 border border-border">
                            <Avatar className="size-6">
                                <AvatarFallback name={selectedRecipient.id} className="text-[10px] font-bold bg-primary/10 text-primary">
                                    {getInitials(selectedRecipient.name)}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium flex-1">{selectedRecipient.name}</span>
                            <button onClick={onRecipientClear} className="text-muted-foreground hover:text-foreground">
                                <XCircle className="size-4" />
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name..."
                                    value={recipientQuery}
                                    onChange={e => { onRecipientQueryChange(e.target.value); onShowDropdown(true) }}
                                    onFocus={() => onShowDropdown(true)}
                                    onBlur={() => setTimeout(() => onShowDropdown(false), 200)}
                                    className="pl-9"
                                />
                            </div>
                            {showUserDropdown && searchResults.length > 0 && (
                                <div className="absolute z-50 w-[calc(100%-3rem)] mt-1 bg-background border border-border rounded-xl shadow-lg max-h-40 overflow-y-auto">
                                    {searchResults.map(u => (
                                        <button
                                            key={u.id}
                                            className="flex items-center gap-2 w-full px-3 py-2 hover:bg-muted/50 transition-colors text-left"
                                            onMouseDown={() => onRecipientSelect(u)}
                                        >
                                            <Avatar className="size-6">
                                                <AvatarFallback name={u.id} className="text-[10px] font-bold bg-primary/10 text-primary">
                                                    {getInitials(u.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm font-medium">{u.name}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Amount */}
                <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Amount (₹)</label>
                    <Input
                        type="number"
                        placeholder="0.00"
                        min="1"
                        value={amount}
                        onChange={e => onAmountChange(e.target.value)}
                        className="text-lg font-bold"
                    />
                </div>

                {/* Note */}
                <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Note (optional)</label>
                    <Input
                        placeholder="What's this for?"
                        value={note}
                        onChange={e => onNoteChange(e.target.value)}
                    />
                </div>

                {/* Send Button */}
                <Button
                    size="lg"
                    className="w-full font-bold text-base shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all active:scale-[0.98]"
                    disabled={!selectedRecipient || !amount || parseFloat(amount) <= 0}
                    onClick={onSend}
                >
                    <Send className="size-4 mr-2" />
                    Send Money
                </Button>

                {/* QR Buttons */}
                <div className="flex gap-3">
                    <Button variant="outline" className="flex-1 font-semibold" onClick={onShowQR}>
                        <QrCode className="size-4 mr-1.5" />
                        Show QR
                    </Button>
                    <Button variant="outline" className="flex-1 font-semibold" onClick={onScanQR}>
                        <ScanLine className="size-4 mr-1.5" />
                        Scan QR
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

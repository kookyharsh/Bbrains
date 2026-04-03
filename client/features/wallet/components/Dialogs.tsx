"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Share2, Download, TrendingUp, X, Search, Loader2 } from "lucide-react";

import QRCode from "react-qr-code";
import { Scanner } from "@yudiel/react-qr-scanner";

import { walletApi, WalletData, dashboardApi, User } from "@/services/api/client";
import { validate, hasErrors, ValidationErrors } from "@/lib/validation";
import { getInitials } from "../utils";
import type { SearchUser } from "../data";

interface WalletDialogsProps {
  wallet: WalletData | null;
  showSendDialog: boolean;
  setShowSendDialog: (show: boolean) => void;
  showQrDialog: boolean;
  setShowQrDialog: (show: boolean) => void;
  showScanDialog: boolean;
  setShowScanDialog: (show: boolean) => void;
  prefilledWalletId?: string;
  onScanSuccess: (walletId: string) => void;
  onTransferSuccess: () => void;
}

export function WalletDialogs({
  wallet,
  showSendDialog,
  setShowSendDialog,
  showQrDialog,
  setShowQrDialog,
  showScanDialog,
  setShowScanDialog,
  prefilledWalletId,
  onScanSuccess,
  onTransferSuccess,
}: WalletDialogsProps) {
  // Local state for the forms
  const [sendTo, setSendTo] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [sendNote, setSendNote] = useState("");
  const [pin, setPin] = useState("");
  const [sending, setSending] = useState(false);
  const [formErrors, setFormErrors] = useState<ValidationErrors>({});
  
  // User search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SearchUser | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Local state for sequential dialogs
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-fill recipient if scanned via QR
  useEffect(() => {
    if (prefilledWalletId) {
      setSendTo(prefilledWalletId);
    }
  }, [prefilledWalletId]);

  // Search users with debounce
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setSearchResults([]);
    setSelectedUser(null);
    setSendTo("");
    
    if (!value.trim()) {
      setShowDropdown(false);
      return;
    }

    setShowDropdown(true);
    setSearching(true);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await dashboardApi.searchUsers(value);
        if (response.success && response.data) {
          const data = Array.isArray(response.data) ? response.data : [response.data];
          const users: SearchUser[] = data.map((user: User) => ({
            id: user.id,
            name: `${user.firstName || user.username}${user.lastName ? ` ${user.lastName}` : ""}`,
            avatarUrl: user.avatar || "",
          }));
          setSearchResults(users);
        }
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setSearching(false);
      }
    }, 300);
  }, []);

  const handleSelectUser = useCallback((user: SearchUser) => {
    setSelectedUser(user);
    setSearchQuery(user.name);
    setSendTo(user.id);
    setShowDropdown(false);
    setSearchResults([]);
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedUser(null);
    setSearchQuery("");
    setSendTo("");
    setSearchResults([]);
  }, []);

  const handleInputChange = useCallback((field: string, value: string) => {
    if (field === 'sendTo') setSendTo(value);
    if (field === 'sendAmount') setSendAmount(value);
    if (field === 'sendNote') setSendNote(value);
    if (field === 'pin') setPin(value);
    setFormErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

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
        setShowReceiptDialog(true);
        
        // Trigger a data refresh in the parent page!
        onTransferSuccess(); 
        
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

  const resetTransferForm = useCallback(() => {
    setSendTo("");
    setSendAmount("");
    setSendNote("");
    setPin("");
    setFormErrors({});
    setSearchQuery("");
    setSearchResults([]);
    setSelectedUser(null);
    setShowDropdown(false);
  }, []);

  return (
    <>
      <Drawer
        direction="right"
        open={showSendDialog}
        onOpenChange={(open) => {
          setShowSendDialog(open);
          if (!open && !showPinDialog && !showReceiptDialog) {
            resetTransferForm();
          }
        }}
      >
        <DrawerContent className="p-0 data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-lg before:inset-0 before:rounded-none before:border-white/10 before:bg-background sm:p-0 sm:before:rounded-l-[2rem]">
          <div className="flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden">
            <DrawerHeader className="border-b border-border/60 p-6 text-left">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <DrawerTitle className="text-xl font-bold">Send Money</DrawerTitle>
                  <DrawerDescription>Transfer B-Coins to another user</DrawerDescription>
                </div>
                <DrawerClose asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <X className="h-4 w-4" />
                  </Button>
                </DrawerClose>
              </div>
            </DrawerHeader>
            <div className="flex-1 space-y-4 overflow-y-auto p-6">
            <div ref={searchRef}>
              <Label>Send to</Label>
              {selectedUser ? (
                <div className="flex items-center gap-3 bg-muted/50 rounded-lg px-3 py-2.5 border border-border">
                  <Avatar className="h-8 w-8">
                    {selectedUser.avatarUrl && <AvatarImage src={selectedUser.avatarUrl} alt={selectedUser.name} />}
                    <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                      {getInitials(selectedUser.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium flex-1">{selectedUser.name}</span>
                  <button
                    onClick={handleClearSelection}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    type="button"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    placeholder="Search by name..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onFocus={() => searchQuery && setShowDropdown(true)}
                    className="pl-9"
                  />
                  {searching && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
                  )}
                  {showDropdown && (searchResults.length > 0 || searching) && (
                    <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {searching ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
                          <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
                        </div>
                      ) : (
                        searchResults.map((user) => (
                          <button
                            key={user.id}
                            className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-muted/50 transition-colors text-left"
                            onMouseDown={() => handleSelectUser(user)}
                          >
                            <Avatar className="h-7 w-7">
                              {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
                              <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                                {getInitials(user.name)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{user.name}</span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
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
            <DrawerFooter className="border-t border-border/60 p-6 sm:flex-row sm:justify-end">
              <DrawerClose asChild>
                <Button variant="ghost">Cancel</Button>
              </DrawerClose>
              <Button onClick={handleSendMoney} disabled={!sendTo || !sendAmount || sending}>
                Next
              </Button>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>

      <Drawer open={showPinDialog} onOpenChange={setShowPinDialog}>
        <DrawerContent className="p-0 data-[vaul-drawer-direction=bottom]:max-h-[60vh] before:inset-0 before:rounded-none before:border-white/10 before:bg-background sm:p-0 sm:before:rounded-t-[2rem]">
          <DrawerHeader className="border-b border-border/60 p-6 text-left">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <DrawerTitle className="text-xl font-bold">Enter Wallet PIN</DrawerTitle>
                <DrawerDescription>Enter your PIN to confirm transfer of {sendAmount} B-Coins</DrawerDescription>
              </div>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>
          <div className="py-4 px-6">
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
          <DrawerFooter className="border-t border-border/60 p-6">
            <Button onClick={handlePinSubmit} disabled={pin.length < 4 || sending} className="w-full">
              {sending ? 'Confirming...' : 'Confirm'}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <Drawer
        open={showReceiptDialog}
        onOpenChange={(open) => {
          setShowReceiptDialog(open);
          if (!open) {
            resetTransferForm();
          }
        }}
      >
        <DrawerContent className="p-0 data-[vaul-drawer-direction=bottom]:max-h-[70vh] before:inset-0 before:rounded-none before:border-white/10 before:bg-background sm:p-0 sm:before:rounded-t-[2rem]">
          <div className="space-y-4 p-6 text-center">
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
        </DrawerContent>
      </Drawer>

      <Drawer open={showQrDialog} onOpenChange={setShowQrDialog}>
        <DrawerContent className="p-0 data-[vaul-drawer-direction=bottom]:max-h-[80vh] before:inset-0 before:rounded-none before:border-white/10 before:bg-background sm:p-0 sm:before:rounded-t-[2rem]">
          <DrawerHeader className="border-b border-border/60 p-6 text-left">
            <DrawerTitle className="text-xl font-bold">Your Wallet QR</DrawerTitle>
            <DrawerDescription>Others can scan this to send you money</DrawerDescription>
          </DrawerHeader>
          <div className="flex flex-col items-center py-4 px-6">
            <div className="p-4 bg-white rounded-xl shadow-inner">
              <QRCode
                value={JSON.stringify({ walletId: wallet?.id || '', name: wallet?.user?.username || '' })}
                size={180}
                level="H"
              />
            </div>
            <p className="text-sm text-muted-foreground mt-3 font-mono">{wallet?.id}</p>
          </div>
        </DrawerContent>
      </Drawer>

      <Drawer open={showScanDialog} onOpenChange={setShowScanDialog}>
        <DrawerContent className="p-0 data-[vaul-drawer-direction=bottom]:max-h-[88vh] before:inset-0 before:rounded-none before:border-white/10 before:bg-background sm:p-0 sm:before:rounded-t-[2rem]">
          <DrawerHeader className="border-b border-border/60 p-6 text-left">
            <DrawerTitle className="text-xl font-bold">Scan QR Code</DrawerTitle>
            <DrawerDescription>Point your camera at a wallet QR code to send money</DrawerDescription>
          </DrawerHeader>
          <div className="flex flex-col items-center gap-4 px-6 pb-6">
            <div className="w-64 h-64 overflow-hidden rounded-2xl border-2 border-border shadow-inner bg-black">
              <Scanner
                onScan={(result) => {
                  if (result && result.length > 0) {
                    try {
                      const data = JSON.parse(result[0].rawValue);
                      if (data.walletId) {
                        onScanSuccess(data.walletId);
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
              Point your camera at another user&apos;s wallet QR code to send them money.
            </p>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}

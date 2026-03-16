"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Share2, Download, TrendingUp } from "lucide-react";

import QRCode from "react-qr-code";
import { Scanner } from "@yudiel/react-qr-scanner";

import { walletApi, WalletData } from "@/lib/api-services";
import { validate, hasErrors, ValidationErrors } from "@/lib/validation";

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

  // Local state for sequential dialogs
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);

  // Auto-fill recipient if scanned via QR
  useEffect(() => {
    if (prefilledWalletId) {
      setSendTo(prefilledWalletId);
    }
  }, [prefilledWalletId]);

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

  return (
    <>
      {/* 1. Send Money Dialog */}
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
              Next
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2. PIN Entry Dialog */}
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

      {/* 3. Transfer Receipt Dialog */}
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

      {/* 4. Show User's Personal QR Dialog */}
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

      {/* 5. Scan Another User's QR Dialog */}
      <Dialog open={showScanDialog} onOpenChange={setShowScanDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Scan QR Code</DialogTitle>
            <DialogDescription>Point your camera at a wallet QR code to send money</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4">
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
        </DialogContent>
      </Dialog>
    </>
  );
}
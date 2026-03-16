"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Palette, Search, Star, Download, Check, Eye } from "lucide-react";
import { toast } from "sonner";
import { themeApi, Product, ProductMetadata } from "@/lib/api-services";

export default function ThemesPage() {
  const [themes, setThemes] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTheme, setSelectedTheme] = useState<Product | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showBuyDialog, setShowBuyDialog] = useState(false);
  const [pin, setPin] = useState("");
  const [buying, setBuying] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 12;

  useEffect(() => {
    fetchThemes();
  }, [page]);

  const fetchThemes = async () => {
    try {
      setLoading(true);
      const response = await themeApi.getThemes(page, limit);
      if (response.success && response.data) {
        setThemes(response.data || []);
        setTotal(response.pagination?.total || 0);
      }
    } catch (err) {
      toast.error("Failed to load themes");
    } finally {
      setLoading(false);
    }
  };

  const filteredThemes = themes.filter((theme) =>
    theme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    theme.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(total / limit);

  const handleBuyNow = async () => {
    if (!selectedTheme) return;
    
    setBuying(true);
    try {
      const response = await themeApi.buyTheme(selectedTheme.id, pin);
      if (response.success) {
        toast.success("Theme purchased successfully!");
        setShowBuyDialog(false);
        setPin("");
      } else {
        toast.error(response.message || "Purchase failed");
      }
    } catch (err) {
      toast.error("Purchase failed");
    } finally {
      setBuying(false);
    }
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case "theme":
        return "default";
      case "notes":
        return "secondary";
      case "template":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getPreviewColors = (metadata?: ProductMetadata) => {
    const config = metadata?.themeConfig;
    if (!config) return null;
    return {
      primary: config.primaryColor as string || "#8b5cf6",
      secondary: config.secondaryColor as string || "#ec4899",
      dark: config.darkMode ? true : false,
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Palette className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Theme Marketplace</h1>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search themes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-40 w-full rounded-lg mb-4" />
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredThemes.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Palette className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No themes found</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredThemes.map((theme) => {
              const previewColors = getPreviewColors(theme.metadata);
              return (
                <Card key={theme.id} className="hover:shadow-md transition-shadow overflow-hidden">
                  <div 
                    className="h-36 cursor-pointer relative"
                    style={{
                      background: previewColors 
                        ? `linear-gradient(135deg, ${previewColors.primary} 0%, ${previewColors.secondary} 100%)`
                        : "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)"
                    }}
                    onClick={() => {
                      setSelectedTheme(theme);
                      setShowPreview(true);
                    }}
                  >
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Eye className="w-8 h-8 text-white" />
                    </div>
                    {previewColors?.dark && (
                      <Badge className="absolute top-2 right-2 bg-black/50 text-white" variant="secondary">
                        Dark
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-foreground line-clamp-1">{theme.name}</h3>
                      <Badge variant={getCategoryColor(theme.metadata?.category)}>
                        {theme.metadata?.category || "theme"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                      {theme.description || "No description"}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">
                        {Number(theme.price)} B-Coins
                      </span>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        {theme.metadata?.downloads || 0}
                        <Download className="w-3 h-3" />
                      </div>
                    </div>
                    <Button 
                      className="w-full mt-3" 
                      size="sm"
                      onClick={() => {
                        setSelectedTheme(theme);
                        setShowBuyDialog(true);
                      }}
                    >
                      Buy Now
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedTheme?.name}</DialogTitle>
            <DialogDescription>
              {selectedTheme?.description}
            </DialogDescription>
          </DialogHeader>
          {selectedTheme && (
            <div className="space-y-4">
              <div 
                className="h-48 rounded-lg"
                style={{
                  background: (() => {
                    const config = selectedTheme.metadata?.themeConfig;
                    const primary = config?.primaryColor as string || "#8b5cf6";
                    const secondary = config?.secondaryColor as string || "#ec4899";
                    return `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`;
                  })()
                }}
              />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Version</p>
                  <p className="font-medium">{selectedTheme.metadata?.version || "1.0"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Price</p>
                  <p className="font-medium">{Number(selectedTheme.price)} B-Coins</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setShowPreview(false);
              setShowBuyDialog(true);
            }}>
              Buy Now - {selectedTheme && Number(selectedTheme.price)} B-Coins
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Buy Dialog */}
      <Dialog open={showBuyDialog} onOpenChange={setShowBuyDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Purchase Theme</DialogTitle>
            <DialogDescription>
              Enter your PIN to purchase {selectedTheme?.name} for {Number(selectedTheme?.price || 0)} B-Coins
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">Wallet PIN</label>
            <InputOTP 
              value={pin} 
              onChange={(value) => setPin(value)}
              maxLength={6}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBuyDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleBuyNow} 
              disabled={pin.length < 6 || buying}
            >
              {buying ? "Processing..." : "Confirm Purchase"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

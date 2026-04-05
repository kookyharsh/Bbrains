"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { marketApi, Product, reviewApi, Review, ReviewStats } from "@/services/api/client";
import { toast } from "sonner";
import { 
  Loader2, Star, ShoppingCart, Package, ArrowLeft, X, 
  ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle,
  Heart, Share2, ShieldCheck, Truck, RefreshCcw, Info
} from "lucide-react";
import { cn } from "@/lib/utils";

// Helper to encode image URLs (existing logic)
const encodeImageUrl = (url: string) => {
  try {
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);
    const newParams = new URLSearchParams();
    for (const [key, value] of params) {
      newParams.set(key, decodeURIComponent(value));
    }
    urlObj.search = newParams.toString();
    return urlObj.toString();
  } catch {
    return url;
  }
};

function PinDialog({
  open,
  onOpenChange,
  onConfirm,
  isProcessing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (pin: string) => void;
  isProcessing: boolean;
}) {
  const [pin, setPin] = useState("");

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) setPin(""); }}>
      <DialogContent className="sm:max-w-md rounded-[2.5rem] border-white/10 bg-slate-950/95 backdrop-blur-2xl p-8 shadow-2xl">
        <DialogHeader className="space-y-3">
          <div className="w-14 h-14 bg-brand-orange/10 rounded-2xl flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7 text-brand-orange" />
          </div>
          <DialogTitle className="text-2xl font-black tracking-tight text-white text-center">Confirm Authorization</DialogTitle>
          <DialogDescription className="text-base font-medium text-white/50 text-center">Enter your 6-digit cryptographic PIN to sign this transaction.</DialogDescription>
        </DialogHeader>
        <div className="py-6">
          <div className="flex justify-center">
            <InputOTP maxLength={6} value={pin} onChange={setPin}>
              <InputOTPGroup className="gap-2">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <InputOTPSlot key={i} index={i} className="h-14 w-11 rounded-xl border-white/10 bg-white/5 text-xl font-black focus:border-brand-orange/50" />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onConfirm(pin)} disabled={pin.length < 6 || isProcessing} className="w-full h-14 rounded-2xl bg-brand-orange hover:bg-brand-orange/90 text-white font-black uppercase tracking-widest shadow-lg shadow-brand-orange/20 disabled:opacity-50">
            {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign & Finalize"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function MarketProductDetail() {
  const params = useParams();
  const router = useRouter();
  const productId = Number(params?.id);
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showPin, setShowPin] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [canReview, setCanReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [alreadyOwned, setAlreadyOwned] = useState(false);

  const allImages = useMemo(() => {
    if (!product) return [];
    const imgs: string[] = [];
    if (product.image) imgs.push(product.image);
    if (product.metadata?.previewImages) imgs.push(...product.metadata.previewImages);
    return [...new Set(imgs)];
  }, [product]);

  useEffect(() => {
    async function fetchProduct(pid: number) {
      try {
        setLoading(true);
        const resp = await marketApi.getProduct(pid);
        const data = resp.data;
        if (data) {
          setProduct(data);
        } else {
          setProduct(null);
        }
      } catch (e) {
        console.error(e);
        toast.error("Failed to load product details");
      } finally {
        setLoading(false);
      }
    }

    if (Number.isFinite(productId)) {
      fetchProduct(productId);
      fetchReviews(productId);
      checkCanReview(productId);
    }
  }, [productId]);

  const fetchReviews = async (pid: number) => {
    try {
      const resp = await reviewApi.getReviews(pid);
      if (resp.success && resp.data) {
        setReviews(resp.data.reviews);
        setReviewStats(resp.data.stats);
      }
    } catch (e) {
      console.error("Failed to load reviews", e);
    }
  };

  const checkCanReview = async (pid: number) => {
    try {
      const resp = await reviewApi.hasPurchased(pid);
      if (resp.success && resp.data) {
        setCanReview(resp.data.hasPurchased);
        setAlreadyOwned(resp.data.hasPurchased);
      }
    } catch (e) {
      console.error("Failed to check purchase status", e);
    }
  };

  const handleSubmitReview = async () => {
    if (!product || newRating === 0 || !newComment.trim()) return;
    try {
      setSubmittingReview(true);
      const resp = await reviewApi.createReview(product.id, { rating: newRating, comment: newComment });
      if (resp.success) {
        toast.success("Review submitted!");
        setShowReviewForm(false);
        setNewRating(0);
        setNewComment("");
        fetchReviews(product.id);
      } else {
        toast.error(resp.message || "Failed to submit review");
      }
    } catch (e) {
      toast.error("Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const addToCart = async () => {
    if (!product) return;
    try {
      await marketApi.addToCart(product.id, quantity);
      toast.success("Added to cart");
    } catch (e) {
      toast.error("Failed to add to cart");
    }
  };

  const buyNow = () => {
    if (!product) return;
    setShowPin(true);
  };

  const handlePinSubmit = async (pin: string) => {
    try {
      setIsProcessing(true);
      if (!product) return;
      const resp = await marketApi.buyNow(product.id, quantity, pin);
      if (resp?.success) {
        toast.success("Order Placed! 🎉", {
          description: `Successfully acquired ${product.name}`,
        });
        setAlreadyOwned(true);
        router.refresh();
      } else {
        toast.error(resp?.message ?? "Purchase failed");
      }
    } catch (e) {
      toast.error("Purchase failed");
    } finally {
      setIsProcessing(false);
      setShowPin(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-brand-orange" />
        <p className="text-sm font-black uppercase tracking-[0.3em] text-white/20 animate-pulse">Syncing Asset Data...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-6">
        <AlertTriangle className="w-16 h-16 text-brand-orange" />
        <h2 className="text-2xl font-black text-white tracking-tight">Asset Not Found</h2>
        <Button variant="outline" asChild className="rounded-xl border-white/10 hover:bg-white/5">
          <Link href="/market">Return to Market</Link>
        </Button>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const sellerDetails = product.creator?.userDetails;
  const sellerName = sellerDetails?.firstName ? `${sellerDetails.firstName} ${sellerDetails.lastName || ""}` : product.creator?.username || "Verified Scholar";
  const sellerAvatar = sellerDetails?.avatar || "";

  return (
    <div className="min-h-screen bg-transparent animate-in fade-in duration-700">
      {/* MOBILE HEADER (Floating) */}
      <div className="md:hidden sticky top-0 z-50 px-4 py-3 flex items-center justify-between bg-background/60 backdrop-blur-xl border-b border-white/5">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-xl bg-white/5 hover:bg-white/10 text-white">
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <span className="font-bold text-sm tracking-tight text-white/70">Product Details</span>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-xl bg-white/5 hover:bg-white/10 text-white">
            <Heart className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-xl bg-white/5 hover:bg-white/10 text-white">
            <Share2 className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 md:py-12">
        {/* DESKTOP BREADCRUMB */}
        <div className="hidden md:flex items-center gap-4 mb-10 translate-x-[-8px]">
          <Link href="/market">
            <Button variant="ghost" className="rounded-2xl h-12 px-5 hover:bg-white/5 text-white/40 hover:text-white group">
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Marketplace
            </Button>
          </Link>
          <div className="h-1 w-1 rounded-full bg-white/10" />
          <span className="text-sm font-bold text-white/20 uppercase tracking-widest">Asset Details</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-16 items-start">
          {/* GALLERY PANEL (Col: 7/12 on LG) */}
          <div className="md:col-span-7 space-y-6">
            <div className="relative aspect-[4/5] md:aspect-square rounded-[2rem] md:rounded-[3rem] overflow-hidden bg-white/[0.03] border border-white/5 group shadow-2xl">
              {allImages[selectedIndex] ? (
                <Image 
                  src={encodeImageUrl(allImages[selectedIndex])} 
                  alt={product.name} 
                  fill 
                  className="object-cover transition-transform duration-1000 group-hover:scale-105" 
                  priority
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                  <Package className="w-20 h-20 text-white/5" />
                  <span className="text-xs font-black uppercase tracking-widest text-white/20">No Preview Available</span>
                </div>
              )}
              {/* Image Indicators (Mobile style) */}
              <div className="md:hidden absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md">
                {allImages.map((_, idx) => (
                  <div key={idx} className={cn("h-1.5 rounded-full transition-all duration-300", selectedIndex === idx ? "w-6 bg-brand-orange" : "w-1.5 bg-white/30")} />
                ))}
              </div>
            </div>

            {/* Thumbnails (Desktop) */}
            {allImages.length > 1 && (
              <div className="hidden md:grid grid-cols-5 gap-4">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedIndex(idx)}
                    className={cn(
                      "relative aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-500",
                      selectedIndex === idx ? "border-brand-orange scale-95 shadow-lg shadow-brand-orange/20" : "border-transparent opacity-40 hover:opacity-100"
                    )}
                  >
                    <Image src={encodeImageUrl(img)} alt={`Thumb ${idx}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
            
            {/* MOBILE SELLER PILL */}
            <div className="md:hidden flex items-center justify-between p-4 rounded-3xl bg-white/[0.04] border border-white/5">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-brand-orange/10 flex items-center justify-center border border-white/10">
                  {sellerAvatar ? <Image src={sellerAvatar} alt={sellerName} fill className="object-cover" /> : <Star className="w-5 h-5 text-brand-orange" />}
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Vendor</p>
                  <p className="text-sm font-bold text-white">{sellerName}</p>
                </div>
              </div>
              <Button size="sm" variant="ghost" className="rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest h-9 px-4">Visit Store</Button>
            </div>
          </div>

          {/* INFO PANEL (Col: 5/12 on LG) */}
          <div className="md:col-span-5 space-y-8 md:sticky md:top-24">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Badge className="bg-brand-orange/10 text-brand-orange border-brand-orange/20 text-[10px] font-black uppercase tracking-widest px-3 py-1 h-7 rounded-lg">
                  Premium Selection
                </Badge>
                <div className="hidden md:flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-white/5 hover:bg-white/10">
                    <Heart className="w-5 h-5 text-white/40" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-white/5 hover:bg-white/10">
                    <Share2 className="w-5 h-5 text-white/40" />
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">{product.name}</h1>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={cn("w-4 h-4", s <= Math.round(product.rating || 0) ? "text-brand-orange fill-brand-orange" : "text-white/10")} />
                    ))}
                    <span className="text-sm font-black text-white ml-2">{product.rating?.toFixed(1) || "0.0"}</span>
                  </div>
                  <div className="h-1 w-1 rounded-full bg-white/20" />
                  <span className="text-sm font-bold text-white/30">{product.reviewCount || 0} Verifications</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {isOutOfStock ? (
                  <Badge variant="destructive" className="rounded-lg h-7 font-black uppercase text-[10px] tracking-widest px-3">OUT OF STOCK</Badge>
                ) : (
                  <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-lg border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">In Stock & Verified</span>
                  </div>
                )}
                {isLowStock && !isOutOfStock && <span className="text-xs font-bold text-amber-500 animate-pulse">Low Stock: {product.stock} left</span>}
              </div>

              <div className="p-8 rounded-[2rem] bg-white/[0.04] border border-white/5 shadow-inner flex flex-col gap-1 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/5 blur-3xl rounded-full translate-x-16 -translate-y-16 group-hover:bg-brand-orange/10 transition-colors" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Asset Value</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-black text-white tracking-tighter tabular-nums">{product.price}</span>
                  <span className="text-lg font-black text-brand-orange uppercase tracking-widest">B-Coins</span>
                </div>
              </div>

              {alreadyOwned && product.productType === 'digital' && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
                   <ShieldCheck className="w-5 h-5 text-emerald-500" />
                   <p className="text-xs font-bold text-emerald-500 tracking-tight">You already own this digital asset. It is accessible in your Inventory.</p>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-white/5 rounded-2xl border border-white/10 p-1">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-12 w-12 rounded-xl text-white/40 hover:bg-white/5 hover:text-white" 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                    >
                      <X className="w-3 h-3 rotate-45 scale-150" /> {/* Minus alternative */}
                    </Button>
                    <span className="w-12 text-center text-lg font-black text-white">{quantity}</span>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-12 w-12 rounded-xl text-white/40 hover:bg-white/5 hover:text-white" 
                        onClick={() => setQuantity(quantity + 1)}
                        disabled={quantity >= (product.stock || 99)}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="flex-1">
                     <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1 ml-1">Subtotal</p>
                     <p className="text-xl font-black text-white tracking-tight">{product.price * quantity} B-Coins</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-24 md:pb-0">
                  <Button
                    onClick={addToCart}
                    disabled={isOutOfStock || (alreadyOwned && product.productType === 'digital')}
                    className="h-16 rounded-[1.25rem] bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest border border-white/10 shadow-lg transition-transform active:scale-95"
                  >
                    <ShoppingCart className="w-5 h-5 mr-3" /> Add to Cart
                  </Button>
                  <Button
                    onClick={buyNow}
                    disabled={isOutOfStock || (alreadyOwned && product.productType === 'digital')}
                    className="h-16 rounded-[1.25rem] bg-brand-orange hover:bg-brand-orange/90 text-white font-black uppercase tracking-widest shadow-2xl shadow-brand-orange/20 transition-transform active:scale-95"
                  >
                    Buy Now
                  </Button>
                </div>
              </div>

              {/* FEATURES BENTO */}
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 rounded-[1.5rem] bg-white/[0.02] border border-white/5 flex flex-col gap-3">
                    <Truck className="w-5 h-5 text-brand-orange" />
                    <p className="text-xs font-black text-white/80 uppercase tracking-widest">Instant Delivery</p>
                    <p className="text-[10px] text-white/30 leading-relaxed">Asset will be transferred immediately upon authorization.</p>
                 </div>
                 <div className="p-4 rounded-[1.5rem] bg-white/[0.02] border border-white/5 flex flex-col gap-3">
                    <RefreshCcw className="w-5 h-5 text-emerald-500" />
                    <p className="text-xs font-black text-white/80 uppercase tracking-widest">Verified Trade</p>
                    <p className="text-[10px] text-white/30 leading-relaxed">Every transaction is cryptographic and strictly peer-to-peer verified.</p>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* DESCRIPTION & REVIEWS SECTION */}
        <div className="mt-20 lg:mt-32 border-t border-white/5 pt-20">
           <div className="max-w-4xl space-y-16">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="h-8 w-1.5 rounded-full bg-brand-orange" />
                    <h2 className="text-3xl font-black text-white tracking-tight">About this Item</h2>
                </div>
                <div className="text-lg text-white/50 leading-relaxed font-medium">
                   {product.description || "No specific details provided by the scholar for this asset."}
                </div>
              </div>

              {/* REVIEWS */}
              <div className="space-y-10">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-8 w-1.5 rounded-full bg-brand-orange" />
                        <h2 className="text-3xl font-black text-white tracking-tight">Verifications</h2>
                    </div>
                    {canReview && !showReviewForm && (
                        <Button variant="outline" className="rounded-xl border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-white font-bold" onClick={() => setShowReviewForm(true)}>
                            Post Verification
                        </Button>
                    )}
                 </div>

                 {reviewStats && (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center p-8 md:p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5">
                        <div className="md:col-span-4 text-center md:text-left space-y-2">
                             <div className="text-6xl font-black text-white tracking-tighter">{reviewStats.averageRating.toFixed(1)}</div>
                             <div className="flex items-center justify-center md:justify-start gap-1 pb-2">
                                {[1, 2, 3, 4, 5].map(s => <Star key={s} className={cn("w-4 h-4", s <= Math.round(reviewStats.averageRating) ? "text-brand-orange fill-brand-orange" : "text-white/10")} />)}
                             </div>
                             <p className="text-sm font-black text-white/30 uppercase tracking-widest">{reviewStats.totalReviews} Global Rankings</p>
                        </div>
                        <div className="md:col-span-8 flex flex-col gap-2.5">
                            {[5, 4, 3, 2, 1].map((star) => {
                                const count = reviewStats.ratingCounts[star] || 0;
                                const pct = reviewStats.totalReviews > 0 ? (count / reviewStats.totalReviews) * 100 : 0;
                                return (
                                    <div key={star} className="flex items-center gap-4">
                                        <span className="w-3 text-xs font-black text-white/40">{star}</span>
                                        <div className="flex-1 h-2.5 bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-brand-orange rounded-full transition-all duration-1000" style={{ width: `${pct}%` }} />
                                        </div>
                                        <span className="w-8 text-xs font-bold text-white/20">{Math.round(pct)}%</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                 )}

                 {showReviewForm && (
                    <div className="p-8 rounded-[2rem] bg-white/[0.04] border-2 border-brand-orange/20 animate-in slide-in-from-top-4 duration-500 space-y-6">
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-black uppercase tracking-widest text-white/50">Rating</span>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map(s => (
                                    <button key={s} onClick={() => setNewRating(s)} className="group">
                                        <Star className={cn("w-8 h-8 transition-all", s <= newRating ? "text-brand-orange fill-brand-orange scale-110" : "text-white/10 group-hover:text-white/30")} />
                                    </button>
                                ))}
                            </div>
                        </div>
                        <textarea
                            className="w-full h-32 p-6 rounded-2xl bg-black/20 border border-white/10 text-white placeholder:text-white/20 text-lg font-medium outline-none focus:border-brand-orange/50 transition-colors resize-none"
                            placeholder="Share your verification details..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                        />
                        <div className="flex gap-4">
                            <Button size="lg" onClick={handleSubmitReview} disabled={newRating === 0 || !newComment.trim() || submittingReview} className="rounded-xl bg-brand-orange px-8 font-black uppercase tracking-widest shadow-lg active:scale-95">
                                {submittingReview ? <Loader2 className="w-5 h-5 animate-spin" /> : "Post Verdict"}
                            </Button>
                            <Button variant="ghost" onClick={() => { setShowReviewForm(false); setNewRating(0); setNewComment(""); }} className="rounded-xl px-8 font-bold text-white/40">Cancel</Button>
                        </div>
                    </div>
                 )}

                 <div className="space-y-6">
                    {reviews.length === 0 ? (
                        <div className="py-20 text-center space-y-4">
                             <Star className="w-12 h-12 text-white/5 mx-auto" />
                             <p className="text-white/20 font-black uppercase tracking-widest text-sm">No verdicts posted for this asset yet</p>
                        </div>
                    ) : (
                        reviews.map((rev) => (
                            <div key={rev.id} className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.03] transition-all group">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-lg font-black text-brand-orange border border-white/10">
                                            {rev.user?.userDetails?.firstName?.[0] || rev.user?.username?.[0] || "?"}
                                        </div>
                                        <div>
                                            <p className="font-black text-white tracking-tight">{rev.user?.userDetails?.firstName ? `${rev.user.userDetails.firstName} ${rev.user.userDetails.lastName || ""}` : rev.user?.username || "Verified Agent"}</p>
                                            <div className="flex items-center gap-3">
                                                <div className="flex">
                                                    {[1,2,3,4,5].map(s => <Star key={s} className={cn("w-3 h-3", s <= rev.rating ? "text-brand-orange fill-brand-orange" : "text-white/10")} />)}
                                                </div>
                                                <div className="w-1 h-1 rounded-full bg-white/20" />
                                                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">{new Date(rev.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="opacity-0 group-hover:opacity-100 transition-opacity border-white/10 text-white/40 uppercase font-black tracking-widest text-[10px]">Verified Rank</Badge>
                                </div>
                                <p className="text-lg text-white/60 leading-relaxed font-medium">{rev.comment}</p>
                            </div>
                        ))
                    )}
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* MOBILE FIXED BOTTOM ACTION BAR */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/40 backdrop-blur-3xl border-t border-white/5 flex gap-3">
          <Button
            onClick={addToCart}
            disabled={isOutOfStock || (alreadyOwned && product.productType === 'digital')}
            variant="outline"
            className="flex-1 h-16 rounded-2xl bg-white/5 border-white/10 text-white font-black uppercase tracking-widest text-xs"
          >
            Add to Cart
          </Button>
          <Button
            onClick={buyNow}
            disabled={isOutOfStock || (alreadyOwned && product.productType === 'digital')}
            className="flex-1 h-16 rounded-2xl bg-brand-orange text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-brand-orange/20"
          >
            Buy Now
          </Button>
      </div>

      <PinDialog open={showPin} onOpenChange={setShowPin} onConfirm={handlePinSubmit} isProcessing={isProcessing} />

      {/* ADD PLUS & MINUS ICON ALTERNATIVES FOR UI CONSISTENCY */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,122,122,0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
}

const Plus = ({ className }: { className?: string }) => <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;

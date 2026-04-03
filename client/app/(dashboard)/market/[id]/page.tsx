"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { marketApi, Product, reviewApi, Review, ReviewStats } from "@/services/api/client";
import { toast } from "sonner";
import { Loader2, Star, ShoppingCart, Package, ArrowLeft, X, ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle } from "lucide-react";

function ImageLightbox({ images, currentIndex, onClose, onNext, onPrev }: { images: string[]; currentIndex: number; onClose: () => void; onNext: () => void; onPrev: () => void }) {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientX);
  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = touchStart - e.touches[0].clientX;
    if (diff > 50) onNext();
    else if (diff < -50) onPrev();
    setTouchStart(null);
  };
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onNext, onPrev, onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" role="dialog" aria-modal="true" aria-label="Image gallery">
      <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white z-50">
        <X className="w-6 h-6" />
      </button>
      {images.length > 1 && (
        <>
          <button onClick={onPrev} className="absolute left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white hidden md:block">
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button onClick={onNext} className="absolute right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white hidden md:block">
            <ChevronRight className="w-8 h-8" />
          </button>
        </>
      )}
      <div className="relative w-full h-full max-w-4xl max-h-[80vh] p-4" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove}>
        <Image src={images[currentIndex]} alt={`Product image ${currentIndex + 1}`} fill className="object-contain" />
      </div>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, idx) => (
          <span key={idx} className={`w-2 h-2 rounded-full ${idx === currentIndex ? "bg-white" : "bg-white/40"}`} />
        ))}
      </div>
    </div>
  );
}

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
      <DialogContent className="sm:max-w-md rounded-3xl border-white/10 bg-slate-950/95 backdrop-blur-2xl p-8 shadow-2xl">
        <DialogHeader className="space-y-3">
          <div className="w-14 h-14 bg-brand-orange/10 rounded-2xl flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7 text-brand-orange" />
          </div>
          <DialogTitle className="text-2xl font-black tracking-tight text-white text-center">Confirm Purchase</DialogTitle>
          <DialogDescription className="text-base font-medium text-white/50 text-center">Enter your 6-digit PIN to authorize</DialogDescription>
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
            {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm & Pay"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function MarketProductDetail() {
  const params = useParams();
  const productId = Number(params?.id);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showPin, setShowPin] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
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

  const currentImage = allImages[selectedIndex] || product?.image || null;

  useEffect(() => {
    async function fetchProduct(pid: number) {
      try {
        setLoading(true);
        const resp: any = await marketApi.getProduct(pid);
        const data = resp?.data ?? resp;
        if (data) {
          setProduct(data as Product);
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
        toast.success("Purchase successful!");
        setAlreadyOwned(true);
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
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-brand-orange" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-6 text-white/60">Product not found.</div>
    );
  }

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const sellerName = product.creator
    ? `${product.creator.userDetails?.firstName || product.creator.username}`
    : "Unknown Seller";

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <Link href="/market" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Market</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        <div className="space-y-4">
          <div
            className="relative w-full aspect-square rounded-2xl overflow-hidden bg-black/20 cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => allImages.length > 1 && setLightboxOpen(true)}
          >
            {currentImage ? (
              <Image src={currentImage} alt={product.name} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-20 h-20 text-white/10" />
              </div>
            )}
          </div>
          {allImages.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {allImages.map((src, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedIndex(idx)}
                  className={`relative w-full aspect-square rounded-xl overflow-hidden border-2 transition-all ${selectedIndex === idx ? "border-brand-orange ring-2 ring-brand-orange/20" : "border-white/10 hover:border-white/30"}`}
                >
                  <Image src={src} alt={`thumb-${idx}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={product.productType === 'digital' ? 'default' : 'secondary'} className="text-[10px] font-black uppercase tracking-widest px-3 py-1">
                {product.productType || 'physical'}
              </Badge>
              {isOutOfStock ? (
                <Badge variant="destructive" className="text-[10px] font-black uppercase tracking-widest">Out of Stock</Badge>
              ) : isLowStock ? (
                <div className="flex items-center gap-1 text-amber-400">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold">Only {product.stock} left</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-green-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold">In Stock</span>
                </div>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">{product.name}</h1>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className={`w-4 h-4 ${star <= Math.round(product.rating || 0) ? "text-yellow-400 fill-yellow-400" : "text-white/20"}`} />
                ))}
              </div>
              <span className="text-sm font-bold text-white">{product.rating ? product.rating.toFixed(1) : "0.0"}</span>
              <span className="text-sm text-white/40">({product.reviewCount || 0} reviews)</span>
            </div>

            <p className="text-sm text-white/50">Sold by <span className="text-white/70 font-medium">{sellerName}</span></p>
          </div>

          <div className="text-4xl font-black text-brand-orange">
            {product.price} <span className="text-lg text-white/30 font-bold">B-Coins</span>
          </div>

          {product.description && (
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-sm text-white/70 leading-relaxed">{product.description}</p>
            </div>
          )}

          {alreadyOwned && product.productType === 'digital' && (
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
              <p className="text-sm font-bold text-green-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Already in your Library
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              variant="default"
              className="flex-1 h-12 rounded-xl bg-white/5 hover:bg-brand-orange text-white border border-white/10 hover:border-brand-orange font-bold transition-all"
              onClick={addToCart}
              disabled={isOutOfStock || (alreadyOwned && product.productType === 'digital')}
            >
              <ShoppingCart className="w-4 h-4 mr-2" /> Add to Cart
            </Button>
            <Button
              variant="default"
              className="flex-1 h-12 rounded-xl bg-brand-orange hover:bg-brand-orange/90 text-white font-bold"
              onClick={buyNow}
              disabled={isOutOfStock || (alreadyOwned && product.productType === 'digital')}
            >
              Buy Now
            </Button>
          </div>

          {reviewStats && (
            <div className="pt-6 border-t border-white/10">
              <h3 className="text-lg font-bold text-white mb-4">Customer Reviews</h3>
              <div className="flex items-center gap-4 mb-4 p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="text-center">
                  <div className="text-3xl font-black text-white">{reviewStats.averageRating.toFixed(1)}</div>
                  <div className="flex gap-0.5 justify-center my-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className={`w-3 h-3 ${star <= Math.round(reviewStats.averageRating) ? "text-yellow-400 fill-yellow-400" : "text-white/20"}`} />
                    ))}
                  </div>
                  <div className="text-xs text-white/50">{reviewStats.totalReviews} reviews</div>
                </div>
                <div className="flex-1 space-y-1">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = reviewStats.ratingCounts[star] || 0;
                    const pct = reviewStats.totalReviews > 0 ? (count / reviewStats.totalReviews) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center gap-2 text-xs">
                        <span className="w-3">{star}</span>
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-6 text-white/50">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {canReview && !showReviewForm && (
                <Button size="sm" onClick={() => setShowReviewForm(true)} className="mb-4 bg-brand-orange hover:bg-brand-orange/80">Write a Review</Button>
              )}

              {showReviewForm && (
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white/70">Your Rating:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} onClick={() => setNewRating(star)} className="p-1">
                          <Star className={`w-6 h-6 ${star <= newRating ? "text-yellow-400 fill-yellow-400" : "text-white/30"}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    className="w-full h-24 p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm resize-none"
                    placeholder="Write your review..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSubmitReview} disabled={newRating === 0 || !newComment.trim() || submittingReview} className="bg-brand-orange">
                      {submittingReview ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit"}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => { setShowReviewForm(false); setNewRating(0); setNewComment(""); }}>Cancel</Button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {reviews.length === 0 ? (
                  <p className="text-sm text-white/40">No reviews yet.</p>
                ) : (
                  reviews.map((review) => (
                    <div key={review.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-brand-orange/20 flex items-center justify-center text-xs font-bold text-brand-orange">
                          {review.user?.userDetails?.firstName?.[0] || review.user?.username?.[0] || "U"}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white">
                            {review.user?.userDetails?.firstName ? `${review.user.userDetails.firstName} ${review.user.userDetails.lastName || ""}` : review.user?.username || "User"}
                          </div>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star key={star} className={`w-3 h-3 ${star <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-white/20"}`} />
                            ))}
                            <span className="text-xs text-white/40 ml-1">{new Date(review.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-white/80">{review.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <PinDialog open={showPin} onOpenChange={setShowPin} onConfirm={handlePinSubmit} isProcessing={isProcessing} />

      {lightboxOpen && allImages.length > 1 && (
        <ImageLightbox
          images={allImages}
          currentIndex={selectedIndex}
          onClose={() => setLightboxOpen(false)}
          onNext={() => setSelectedIndex((i) => (i + 1) % allImages.length)}
          onPrev={() => setSelectedIndex((i) => (i - 1 + allImages.length) % allImages.length)}
        />
      )}
    </div>
  );
}

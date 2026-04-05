"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Package,
  Star,
  Loader2,
  Store,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { DashboardContent } from "@/components/dashboard-content";
import { marketApi, Product, type CartItem } from "@/services/api/client";

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
  description,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (pin: string) => void;
  isProcessing: boolean;
  description: string;
}) {
  const [pin, setPin] = useState("");

  const handleSubmit = () => {
    if (pin.length === 6) {
      onConfirm(pin);
      setPin("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) setPin(""); }}>
      <DialogContent className="sm:max-w-md rounded-3xl border-white/10 bg-slate-950/95 backdrop-blur-2xl p-8 shadow-2xl">
        <DialogHeader className="space-y-3">
          <div className="w-14 h-14 bg-brand-orange/10 rounded-2xl flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7 text-brand-orange" />
          </div>
          <DialogTitle className="text-2xl font-black tracking-tight text-white text-center">Confirm Purchase</DialogTitle>
          <DialogDescription className="text-base font-medium text-white/50 text-center">{description}</DialogDescription>
        </DialogHeader>
        <div className="py-6">
          <div className="flex justify-center">
            <InputOTP maxLength={6} value={pin} onChange={setPin}>
              <InputOTPGroup className="gap-2">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <InputOTPSlot
                    key={i}
                    index={i}
                    className="h-14 w-11 rounded-xl border-white/10 bg-white/5 text-xl font-black focus:border-brand-orange/50 focus:ring-2 focus:ring-brand-orange/20"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={pin.length < 6 || isProcessing}
            className="w-full h-14 rounded-2xl bg-brand-orange hover:bg-brand-orange/90 text-white font-black uppercase tracking-widest shadow-lg shadow-brand-orange/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm & Pay"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function MarketPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<Record<number, number>>({});
  const [showCart, setShowCart] = useState(false);
  const [showBuyConfirm, setShowBuyConfirm] = useState(false);
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [buyProduct, setBuyProduct] = useState<Product | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await marketApi.getProducts(1, 100);
      if (response.success && response.data) {
        setProducts(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      toast.error("Failed to load marketplace");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCart = useCallback(async () => {
      try {
        const response = await marketApi.getCart();
        if (response.success && Array.isArray(response.data)) {
          const cartObj: Record<number, number> = {};
          response.data.forEach((item: CartItem) => {
            cartObj[item.productId] = item.quantity;
          });
          setCart(cartObj);
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCart();
  }, [fetchProducts, fetchCart]);

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const cartTotal = Object.entries(cart).reduce((total, [id, qty]) => {
    const product = products.find((p) => p.id === Number(id));
    return total + (product?.price || 0) * qty;
  }, 0);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = async (productId: number) => {
    try {
      await marketApi.addToCart(productId, 1);
      setCart((prev) => ({ ...prev, [productId]: (prev[productId] || 0) + 1 }));
      toast.success("Added to cart");
    } catch (error) {
      toast.error("Failed to add to cart");
    }
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => {
      const newCart = { ...prev };
      if (newCart[productId] > 1) {
        newCart[productId]--;
      } else {
        delete newCart[productId];
      }
      return newCart;
    });
  };

  const confirmBuy = () => {
    setShowBuyConfirm(false);
    setShowPinDialog(true);
  };

  const handlePinSubmit = async (pin: string) => {
    try {
      setIsProcessing(true);
      if (buyProduct) {
        const response = await marketApi.buyNow(buyProduct.id, quantity, pin);
        if (response.success) {
          toast.success("Purchase successful!", {
            description: `Acquired ${buyProduct.name}`,
          });
          fetchProducts();
        } else {
          toast.error(response.message || "Purchase failed");
        }
      } else {
        if (Object.keys(cart).length === 0) {
          toast.error("Your cart is empty");
          return;
        }
        const response = await marketApi.checkout(pin);
        if (response.success) {
          toast.success("Purchase successful!", {
            description: `Acquired ${cartCount} items`,
          });
          setCart({});
          fetchCart();
          fetchProducts();
        } else {
          if (response.message?.toLowerCase().includes('insufficient')) {
            toast.error("Insufficient balance", {
              description: "Add funds to your wallet to complete this purchase",
            });
          } else if (response.message?.toLowerCase().includes('already own')) {
            toast.error("Already owned", {
              description: response.message,
            });
          } else {
            toast.error(response.message || "Checkout failed");
          }
        }
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsProcessing(false);
      setShowPinDialog(false);
      setBuyProduct(null);
    }
  };

  return (
    <DashboardContent>
      <div className="space-y-8 animate-in fade-in duration-700">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none flex items-center gap-4">
              <Store className="w-10 h-10 md:w-14 md:h-14 text-brand-orange" />
              Campus Market
            </h1>
            <p className="text-white/40 font-medium text-lg tracking-tight">Browse and acquire verified educational products</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/products">
              <Button variant="outline" className="h-12 px-6 rounded-xl border-2 font-black uppercase tracking-widest text-[10px] hover:bg-white/5">
                <Package className="w-4 h-4 mr-2" />
                My Products
              </Button>
            </Link>
            <Button className="h-12 px-6 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 relative" onClick={() => setShowCart(true)}>
              <ShoppingCart className="w-4 h-4 mr-2" />
              <span className="font-black text-[10px] uppercase tracking-widest">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 h-6 w-6 bg-brand-orange text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg ring-4 ring-background">
                  {cartCount}
                </span>
              )}
            </Button>
          </div>
        </div>

        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-14 pl-12 rounded-2xl bg-white/[0.03] border-white/5 focus:border-brand-orange/50 transition-all font-bold text-lg placeholder:text-white/10"
          />
        </div>

        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-brand-orange" />
            <p className="text-sm font-black uppercase tracking-[0.3em] text-white/20 animate-pulse">Loading Marketplace...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-32 text-center space-y-4">
            <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-white/10" />
            </div>
            <h3 className="text-2xl font-black text-white/40 tracking-tight">No products found</h3>
            <p className="text-white/20 font-medium">Try broadening your search</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProducts.map((product, idx) => {
              const isOutOfStock = product.stock <= 0;
              const isLowStock = product.stock > 0 && product.stock <= 5;
              const inCart = cart[product.id] || 0;

              return (
                <Card
                  key={product.id}
                  className="group relative overflow-hidden rounded-2xl border-white/5 bg-white/[0.02] backdrop-blur-sm hover:border-white/10 transition-all duration-300"
                  style={{ animationDelay: `${idx * 30}ms` }}
                >
                  <CardContent className="p-4 md:p-5">
                    <div className="flex gap-4 md:gap-6">
                      <Link href={`/market/${product.id}`} className="shrink-0">
                        <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden bg-white/[0.03]">
                          {product.image ? (
                            <Image
                              src={encodeImageUrl(product.image)}
                              alt={product.name}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-8 h-8 text-white/10" />
                            </div>
                          )}
                        </div>
                      </Link>

                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-3">
                            <Link href={`/market/${product.id}`} className="group/title">
                              <h3 className="font-bold text-lg text-white group-hover/title:text-brand-orange transition-colors line-clamp-1">
                                {product.name}
                              </h3>
                            </Link>
                            <div className="flex items-center gap-2 shrink-0">
                              <Badge variant={product.productType === 'digital' ? 'default' : 'secondary'} className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5">
                                {product.productType || 'physical'}
                              </Badge>
                            </div>
                          </div>

                          <p className="text-sm text-white/40 line-clamp-2 font-medium">
                            {product.description || "No description available."}
                          </p>

                          <div className="flex items-center gap-4 flex-wrap">
                            <div className="flex items-center gap-1.5">
                              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                              <span className="text-sm font-bold text-white">
                                {product.rating ? product.rating.toFixed(1) : "0.0"}
                              </span>
                              <span className="text-xs text-white/30">
                                ({product.reviewCount || 0})
                              </span>
                            </div>

                            <span className="text-xl font-black text-brand-orange">
                              {product.price} <span className="text-xs text-white/30 font-bold">B-Coins</span>
                            </span>

                            {isOutOfStock ? (
                              <Badge variant="destructive" className="text-[10px] font-black uppercase tracking-widest">
                                Out of Stock
                              </Badge>
                            ) : isLowStock ? (
                              <div className="flex items-center gap-1 text-amber-400">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span className="text-xs font-bold">Low Stock ({product.stock} left)</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-green-400">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span className="text-xs font-bold">In Stock</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 mt-3">
                          {isOutOfStock ? (
                            <Button disabled className="h-10 px-6 rounded-xl bg-white/5 text-white/20 font-bold cursor-not-allowed">
                              Out of Stock
                            </Button>
                          ) : inCart > 0 ? (
                            <div className="flex items-center bg-white/5 rounded-xl border border-white/10 p-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => removeFromCart(product.id)}>
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="w-8 text-center text-sm font-black text-white">{inCart}</span>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => addToCart(product.id)}>
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => addToCart(product.id)}
                              className="h-10 px-5 rounded-xl bg-white/5 hover:bg-brand-orange text-white border border-white/10 hover:border-brand-orange transition-all font-bold"
                            >
                              <ShoppingCart className="w-4 h-4 mr-2" />
                              Add to Cart
                            </Button>
                          )}
                          {!isOutOfStock && (
                            <Button
                              size="sm"
                              onClick={() => { setBuyProduct(product); setQuantity(1); setShowBuyConfirm(true); }}
                              className="h-10 px-5 rounded-xl bg-brand-orange hover:bg-brand-orange/90 text-white font-bold"
                            >
                              Buy Now
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <Dialog open={showCart} onOpenChange={setShowCart}>
          <DialogContent className="rounded-3xl border-white/10 bg-slate-950/95 backdrop-blur-2xl p-0 overflow-hidden shadow-2xl">
            <div className="p-6 space-y-5">
              <DialogHeader>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-brand-orange/10 rounded-2xl flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 text-brand-orange" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-black tracking-tight">Your Cart</DialogTitle>
                    <DialogDescription className="font-medium text-white/40">{cartCount} item{cartCount !== 1 ? 's' : ''}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              {cartCount === 0 ? (
                <div className="py-12 text-center space-y-4">
                  <ShoppingCart className="w-16 h-16 text-white/5 mx-auto" />
                  <p className="text-white/40 font-bold uppercase tracking-widest text-[10px]">Cart is empty</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {Object.entries(cart).map(([id, qty]) => {
                    const product = products.find((p) => p.id === Number(id));
                    if (!product) return null;
                    return (
                      <div key={id} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5">
                        <div className="relative h-14 w-14 rounded-lg overflow-hidden bg-white/5 shrink-0">
                          {product.image ? <Image src={product.image} alt={product.name} fill className="object-cover" /> : <Package className="w-6 h-6 text-white/5 m-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-white truncate text-sm">{product.name}</p>
                          <p className="text-xs font-bold text-brand-orange">{product.price} B-Coins</p>
                        </div>
                        <div className="flex items-center bg-black/20 rounded-lg p-0.5">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeFromCart(Number(id))}>
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-7 text-center text-sm font-black">{qty}</span>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => addToCart(Number(id))}>
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {cartCount > 0 && (
                <div className="pt-4 border-t border-white/5 space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-white/30 uppercase tracking-wider">Total</span>
                    <span className="text-3xl font-black text-white tabular-nums tracking-tighter">{cartTotal} <span className="text-sm text-brand-orange">B-Coins</span></span>
                  </div>
                  <Button
                    className="w-full h-12 rounded-xl bg-brand-orange hover:bg-brand-orange/90 text-white font-black uppercase tracking-widest shadow-lg shadow-brand-orange/20"
                    onClick={() => { setShowCart(false); setShowBuyConfirm(true); setBuyProduct(null); }}
                  >
                    Checkout
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <AlertDialog open={showBuyConfirm} onOpenChange={setShowBuyConfirm}>
          <AlertDialogContent className="rounded-3xl border-white/10 bg-slate-950/95 backdrop-blur-2xl p-8 shadow-2xl">
            <AlertDialogHeader className="space-y-4">
              <div className="w-16 h-16 bg-brand-orange/10 rounded-3xl flex items-center justify-center">
                <Store className="w-8 h-8 text-brand-orange" />
              </div>
              <AlertDialogTitle className="text-2xl font-black tracking-tight text-white">Confirm Purchase</AlertDialogTitle>
              <AlertDialogDescription className="text-base font-medium text-white/40 leading-relaxed">
                {buyProduct
                  ? `You are about to purchase ${buyProduct.name} for ${buyProduct.price * quantity} B-Coins.`
                  : `You are about to purchase ${cartCount} items for ${cartTotal} B-Coins.`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-6 gap-3">
              <AlertDialogCancel className="h-12 rounded-xl border-white/10 bg-transparent text-white/40 font-bold hover:bg-white/5">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmBuy}
                className="h-12 rounded-xl bg-brand-orange hover:bg-brand-orange/90 text-white font-black px-8"
              >
                Continue to Payment
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <PinDialog
          open={showPinDialog}
          onOpenChange={setShowPinDialog}
          onConfirm={handlePinSubmit}
          isProcessing={isProcessing}
          description="Enter your 6-digit PIN to authorize this transaction"
        />
      </div>
    </DashboardContent>
  );
}

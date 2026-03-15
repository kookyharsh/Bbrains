"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
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
  ArrowLeft,
  Star,
  Loader2,
  Tag,
  LayoutGrid,
  Store
} from "lucide-react";
import { toast } from "sonner";
import { DashboardContent } from "@/components/dashboard-content";
import { marketApi, Product } from "@/lib/api-services";
import Link from "next/link";
import { cn } from "@/lib/utils";

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

export default function MarketPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<Record<number, number>>({});
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showCart, setShowCart] = useState(false);
  const [showBuyConfirm, setShowBuyConfirm] = useState(false);
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [pin, setPin] = useState("");
  const [buyProduct, setBuyProduct] = useState<Product | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await marketApi.getProducts(1, 100);
      if (response.success && response.data) {
        // Handle both paginated { data: [...] } and direct array responses
        const productsData = (response.data as any)?.data || response.data;
        setProducts(Array.isArray(productsData) ? productsData : []);
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
        (response.data as any[]).forEach((item: any) => {
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

  const handleBuyNow = (product: Product) => {
    setBuyProduct(product);
    setShowBuyConfirm(true);
  };

  const confirmBuy = () => {
    setShowBuyConfirm(false);
    setShowPinDialog(true);
  };

  const handlePinSubmit = async () => {
    try {
      setIsProcessing(true);
      if (buyProduct) {
        const response = await marketApi.buyNow(buyProduct.id, quantity, pin);
        if (response.success) {
          toast.success("Order Placed! 🎉", {
            description: `Successfully purchased ${buyProduct.name}`,
          });
          fetchProducts(); // Refresh stock
        } else {
          toast.error(response.message || "Purchase failed");
        }
} else {
          // Multi-item checkout
          if (Object.keys(cart).length === 0) {
            toast.error("Your cart is empty");
            return;
          }
const response = await marketApi.checkout(pin);
        if (response.success) {
          toast.success("Order Placed! 🎉", {
            description: `Successfully purchased ${cartCount} items`,
          });
          setCart({});
          fetchCart();
          fetchProducts();
          } else {
            if (response.message?.toLowerCase().includes('insufficient')) {
              toast.error("Insufficient balance", {
                description: "Please add funds to your wallet to complete this purchase",
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
      setPin("");
      setBuyProduct(null);
    }
  };

  if (selectedProduct) {
    return (
      <DashboardContent>
        <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
          <Button variant="ghost" onClick={() => setSelectedProduct(null)} className="gap-2 rounded-xl hover:bg-white/5">
            <ArrowLeft className="w-4 h-4" /> Back to Market
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Image */}
            <div className="relative aspect-square rounded-[3rem] overflow-hidden bg-white/[0.02] border border-white/10 group shadow-2xl">
              {selectedProduct.image ? (
                <Image 
                  src={selectedProduct.image} 
                  alt={selectedProduct.name} 
                  fill 
                  className="object-cover transition-transform duration-700 group-hover:scale-110" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-32 h-32 text-white/5" />
                </div>
              )}
              <div className="absolute top-6 left-6">
                <Badge className="bg-brand-orange text-white border-none font-black text-[10px] uppercase tracking-widest px-4 py-1.5 shadow-xl">
                  {selectedProduct.metadata?.category || "Product"}
                </Badge>
              </div>
            </div>

            {/* Product Details */}
            <div className="flex flex-col justify-center space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                  <Store className="w-3 h-3" />
                  <span>Campus verified asset</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">{selectedProduct.name}</h1>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20">
                    <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                    <span className="text-xs font-black text-yellow-500">4.8</span>
                  </div>
                  <span className="text-sm font-bold text-white/40">• {selectedProduct.stock} units in reserve</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-orange">Market Value</span>
                <p className="text-5xl font-black text-white tabular-nums tracking-tighter">
                  {selectedProduct.price} <span className="text-lg text-white/20">B-Coins</span>
                </p>
              </div>

              <p className="text-white/60 leading-relaxed text-lg font-medium max-w-xl">
                {selectedProduct.description || "No specification provided for this asset."}
              </p>

              <div className="flex items-center gap-6 pt-4">
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-1">Acquisition Volume</span>
                  <div className="flex items-center bg-white/5 rounded-2xl border border-white/5 p-1">
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white/5" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                      <Minus className="w-4 h-4 text-white/40" />
                    </Button>
                    <span className="w-12 text-center text-lg font-black text-white">{quantity}</span>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white/5" onClick={() => setQuantity(quantity + 1)}>
                      <Plus className="w-4 h-4 text-white/40" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  className="flex-1 h-14 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest border border-white/10 transition-all active:scale-95"
                  onClick={() => addToCart(selectedProduct.id)}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Payload
                </Button>
                <Button 
                  className="flex-1 h-14 rounded-2xl bg-brand-orange hover:bg-brand-orange/90 text-white font-black uppercase tracking-widest shadow-lg shadow-brand-orange/20 transition-all active:scale-95"
                  onClick={() => handleBuyNow(selectedProduct)}
                >
                  Instant Acquisition
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <div className="space-y-10 animate-in fade-in duration-700">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none flex items-center gap-4">
              <Store className="w-10 h-10 md:w-14 md:h-14 text-brand-orange" />
              Campus Market
            </h1>
            <p className="text-white/40 font-medium text-lg tracking-tight">Acquire and trade verified digital and physical assets</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Link href="/market/my-products">
              <Button variant="outline" className="h-12 px-6 rounded-xl border-2 font-black uppercase tracking-widest text-[10px] hover:bg-white/5">
                <Package className="w-4 h-4 mr-2" />
                My Inventory
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

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
            <Input
              placeholder="Filter by asset name or specification..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-14 pl-12 rounded-2xl bg-white/[0.03] border-white/5 focus:border-brand-orange/50 transition-all font-bold text-lg placeholder:text-white/10"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button variant="outline" className="h-14 w-14 rounded-2xl border-white/5 bg-white/[0.02]">
              <LayoutGrid className="w-5 h-5 text-brand-orange" />
            </Button>
            <Button variant="outline" className="h-14 w-14 rounded-2xl border-white/5 bg-white/[0.02]">
              <Tag className="w-5 h-5 text-white/20" />
            </Button>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-brand-orange" />
            <p className="text-sm font-black uppercase tracking-[0.3em] text-white/20 animate-pulse">Scanning Marketplace...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-32 text-center space-y-4">
            <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-white/10" />
            </div>
            <h3 className="text-2xl font-black text-white/40 tracking-tight">No assets match your query</h3>
            <p className="text-white/20 font-medium">Try broadening your search parameters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product, idx) => (
              <Card 
                key={product.id} 
                className="group relative overflow-hidden rounded-[2.5rem] border-white/5 bg-white/[0.02] backdrop-blur-sm hover:border-brand-orange/30 transition-all duration-500 animate-in fade-in slide-in-from-bottom-8 shadow-2xl"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <button
                  onClick={() => setSelectedProduct(product)}
                  className="relative w-full aspect-square bg-white/[0.03] overflow-hidden p-6"
                >
                  {product.image ? (
                    <Image 
                      src={encodeImageUrl(product.image)} 
                      alt={product.name} 
                      fill 
                      className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100" 
                    />
                  ) : (
                    <Package className="w-16 h-16 text-white/5" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-1">
                    <button onClick={() => setSelectedProduct(product)} className="text-left w-full group/title">
                      <h3 className="font-black text-xl text-white tracking-tight truncate group-hover/title:text-brand-orange transition-colors">
                        {product.name}
                      </h3>
                    </button>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/20">
                      <span className="truncate">By Verified Scholar</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Price</span>
                      <span className="text-2xl font-black text-brand-orange tabular-nums">{product.price} <span className="text-[10px] text-white/20">B-Coins</span></span>
                    </div>
                    
                    {cart[product.id] ? (
                      <div className="flex items-center bg-white/5 rounded-2xl border border-white/10 p-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl" onClick={() => removeFromCart(product.id)}>
                          <Minus className="w-3 h-3 text-white/40" />
                        </Button>
                        <span className="w-8 text-center text-sm font-black text-white">{cart[product.id]}</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl" onClick={() => addToCart(product.id)}>
                          <Plus className="w-3 h-3 text-white/40" />
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        size="icon" 
                        onClick={() => addToCart(product.id)}
                        className="h-12 w-12 rounded-2xl bg-white/5 hover:bg-brand-orange text-white border border-white/10 hover:border-brand-orange transition-all duration-300"
                      >
                        <ShoppingCart className="w-5 h-5" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Cart Dialog */}
        <Dialog open={showCart} onOpenChange={setShowCart}>
          <DialogContent className="rounded-[2.5rem] border-white/10 bg-slate-950/95 backdrop-blur-2xl p-0 overflow-hidden shadow-2xl">
            <div className="p-8 space-y-6">
              <DialogHeader>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-brand-orange/10 rounded-2xl flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 text-brand-orange" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-black tracking-tight">Active Payload</DialogTitle>
                    <DialogDescription className="font-medium text-white/40">{cartCount} assets ready for acquisition</DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              {cartCount === 0 ? (
                <div className="py-12 text-center space-y-4">
                  <ShoppingCart className="w-16 h-16 text-white/5 mx-auto" />
                  <p className="text-white/40 font-bold uppercase tracking-widest text-[10px]">Payload empty</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {Object.entries(cart).map(([id, qty]) => {
                    const product = products.find((p) => p.id === Number(id));
                    if (!product) return null;
                    return (
                      <div key={id} className="flex items-center gap-4 p-4 rounded-3xl bg-white/5 border border-white/5 group">
                        <div className="relative h-16 w-16 rounded-2xl overflow-hidden bg-white/5 shrink-0">
                          {product.image ? <Image src={product.image} alt={product.name} fill className="object-cover" /> : <Package className="w-8 h-8 text-white/5 m-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-white truncate">{product.name}</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-brand-orange">{product.price} B-Coins</p>
                        </div>
                        <div className="flex items-center bg-black/20 rounded-xl p-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeFromCart(Number(id))}>
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-black">{qty}</span>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => addToCart(Number(id))}>
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {cartCount > 0 && (
                <div className="pt-6 border-t border-white/5 space-y-6">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Aggregate Value</span>
                    <span className="text-4xl font-black text-white tabular-nums tracking-tighter">{cartTotal} <span className="text-sm text-brand-orange">B-Coins</span></span>
                  </div>
                  <Button 
                    className="w-full h-14 rounded-2xl bg-brand-orange hover:bg-brand-orange/90 text-white font-black uppercase tracking-widest shadow-lg shadow-brand-orange/20 transition-all active:scale-95"
                    onClick={() => { setShowCart(false); setShowBuyConfirm(true); setBuyProduct(null); }}
                  >
                    Initiate Final Transfer
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Buy Confirmation */}
        <AlertDialog open={showBuyConfirm} onOpenChange={setShowBuyConfirm}>
          <AlertDialogContent className="rounded-[2.5rem] border-white/10 bg-slate-950/95 backdrop-blur-2xl p-8 shadow-2xl">
            <AlertDialogHeader className="space-y-4">
              <div className="w-16 h-16 bg-brand-orange/10 rounded-3xl flex items-center justify-center">
                <Store className="w-8 h-8 text-brand-orange" />
              </div>
              <AlertDialogTitle className="text-3xl font-black tracking-tighter text-white">Authorize Acquisition?</AlertDialogTitle>
              <AlertDialogDescription className="text-lg font-medium text-white/40 leading-relaxed">
                {buyProduct
                  ? `You are about to authorize the transfer of ${buyProduct.price * quantity} B-Coins for the acquisition of ${buyProduct.name}.`
                  : `You are about to authorize the aggregate transfer of ${cartTotal} B-Coins for ${cartCount} marketplace assets.`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-8 gap-4">
              <AlertDialogCancel className="h-12 rounded-xl border-white/10 bg-transparent text-white/40 font-bold hover:bg-white/5">Abort</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmBuy}
                className="h-12 rounded-xl bg-brand-orange hover:bg-brand-orange/90 text-white font-black px-8"
              >
                Confirm Authorization
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* PIN Dialog */}
        <Dialog open={showPinDialog} onOpenChange={setShowPinDialog}>
          <DialogContent className="sm:max-w-md rounded-[2.5rem] border-white/10 bg-slate-950/95 backdrop-blur-2xl p-8 shadow-2xl">
            <DialogHeader className="space-y-4">
              <div className="w-16 h-16 bg-brand-purple/10 rounded-3xl flex items-center justify-center">
                <LayoutGrid className="w-8 h-8 text-brand-purple" />
              </div>
              <DialogTitle className="text-3xl font-black tracking-tighter text-white">Verification Required</DialogTitle>
              <DialogDescription className="text-lg font-medium text-white/40">Enter your 6-digit cryptographic PIN to sign this transaction.</DialogDescription>
            </DialogHeader>
            <div className="flex justify-center py-8">
              <InputOTP maxLength={6} value={pin} onChange={setPin}>
                <InputOTPGroup className="gap-2">
                  <InputOTPSlot index={0} className="h-14 w-12 rounded-xl border-white/10 bg-white/5 text-xl font-black" />
                  <InputOTPSlot index={1} className="h-14 w-12 rounded-xl border-white/10 bg-white/5 text-xl font-black" />
                  <InputOTPSlot index={2} className="h-14 w-12 rounded-xl border-white/10 bg-white/5 text-xl font-black" />
                  <InputOTPSlot index={3} className="h-14 w-12 rounded-xl border-white/10 bg-white/5 text-xl font-black" />
                  <InputOTPSlot index={4} className="h-14 w-12 rounded-xl border-white/10 bg-white/5 text-xl font-black" />
                  <InputOTPSlot index={5} className="h-14 w-12 rounded-xl border-white/10 bg-white/5 text-xl font-black" />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <DialogFooter>
              <Button 
                onClick={handlePinSubmit} 
                disabled={pin.length < 6 || isProcessing} 
                className="w-full h-14 rounded-2xl bg-brand-orange hover:bg-brand-orange/90 text-white font-black uppercase tracking-widest shadow-lg shadow-brand-orange/20 transition-all active:scale-95"
              >
                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign & Finalize"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardContent>
  );
}

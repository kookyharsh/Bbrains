"use client";

import { useState } from "react";
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
} from "lucide-react";
import { toast } from "sonner";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  creator: string;
  rating: number;
}

const mockProducts: Product[] = [
  { id: 1, name: "Wireless Earbuds", description: "High-quality wireless earbuds with noise cancellation. Perfect for studying in the library or commuting. 8-hour battery life with charging case.", price: 250, stock: 15, image: "🎧", creator: "Tech Club", rating: 4.5 },
  { id: 2, name: "Notebook Set (5 Pack)", description: "Premium A4 notebooks with 200 pages each. Dotted grid pattern, ideal for note-taking and sketching. Eco-friendly recycled paper.", price: 80, stock: 50, image: "📓", creator: "Stationery Store", rating: 4.8 },
  { id: 3, name: "USB-C Hub", description: "7-in-1 USB-C hub with HDMI, USB 3.0, SD card reader. Compatible with all laptops. Compact and portable design.", price: 180, stock: 8, image: "🔌", creator: "Tech Club", rating: 4.2 },
  { id: 4, name: "Water Bottle (1L)", description: "Insulated stainless steel water bottle. Keeps drinks cold for 24 hours or hot for 12 hours. BPA-free with leak-proof lid.", price: 45, stock: 100, image: "🍶", creator: "Eco Club", rating: 4.7 },
  { id: 5, name: "Desk Lamp", description: "LED desk lamp with adjustable brightness and color temperature. USB charging port built-in. Touch controls.", price: 120, stock: 20, image: "💡", creator: "Design Club", rating: 4.4 },
  { id: 6, name: "Campus Hoodie", description: "Official campus hoodie in navy blue. Comfortable cotton-polyester blend. Available in all sizes.", price: 350, stock: 30, image: "🧥", creator: "Student Council", rating: 4.9 },
  { id: 7, name: "Graphing Calculator", description: "Scientific graphing calculator for advanced math and engineering courses. Solar powered with battery backup.", price: 200, stock: 12, image: "🔢", creator: "Math Club", rating: 4.3 },
  { id: 8, name: "Art Supply Kit", description: "Complete art supply kit with colored pencils, markers, watercolors, and brushes. Great for beginners and advanced artists.", price: 150, stock: 25, image: "🎨", creator: "Art Club", rating: 4.6 },
];

export default function MarketPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<Record<number, number>>({});
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showCart, setShowCart] = useState(false);
  const [showBuyConfirm, setShowBuyConfirm] = useState(false);
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [pin, setPin] = useState("");
  const [buyProduct, setBuyProduct] = useState<Product | null>(null);

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const cartTotal = Object.entries(cart).reduce((total, [id, qty]) => {
    const product = mockProducts.find((p) => p.id === Number(id));
    return total + (product?.price || 0) * qty;
  }, 0);

  const filteredProducts = mockProducts.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (productId: number) => {
    setCart((prev) => ({ ...prev, [productId]: (prev[productId] || 0) + 1 }));
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

  const handlePinSubmit = () => {
    setShowPinDialog(false);
    setPin("");
    toast("Order Placed! 🎉", {
      description: `Successfully purchased ${buyProduct?.name || "item"}`,
    });
    setBuyProduct(null);
  };

  if (selectedProduct) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => setSelectedProduct(null)} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Market
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Image */}
          <Card>
            <CardContent className="p-8 flex items-center justify-center">
              <div className="text-8xl">{selectedProduct.image}</div>
            </CardContent>
          </Card>

          {/* Product Details */}
          <div className="space-y-4">
            <div>
              <Badge variant="secondary" className="mb-2">{selectedProduct.creator}</Badge>
              <h1 className="text-2xl font-bold text-foreground">{selectedProduct.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm ml-1 text-foreground">{selectedProduct.rating}</span>
                </div>
                <span className="text-sm text-muted-foreground">• {selectedProduct.stock} in stock</span>
              </div>
            </div>

            <p className="text-3xl font-bold text-primary">{selectedProduct.price} B-Coins</p>
            <p className="text-muted-foreground">{selectedProduct.description}</p>

            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Quantity:</span>
              <div className="flex items-center border border-border rounded-md">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                  <Minus className="w-3 h-3" />
                </Button>
                <span className="w-10 text-center text-sm font-medium">{quantity}</span>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setQuantity(quantity + 1)}>
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                className="flex-1"
                onClick={() => {
                  for (let i = 0; i < quantity; i++) addToCart(selectedProduct.id);
                }}
              >
                {cart[selectedProduct.id] ? "View Cart" : "Add to Cart"}
              </Button>
              <Button variant="secondary" className="flex-1" onClick={() => handleBuyNow(selectedProduct)}>
                Buy Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Campus Market</h1>
        <Button variant="outline" className="relative" onClick={() => setShowCart(true)}>
          <ShoppingCart className="w-4 h-4 mr-2" />
          Cart
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-lg">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <button
              onClick={() => setSelectedProduct(product)}
              className="w-full text-left"
            >
              <div className="h-32 bg-muted/50 flex items-center justify-center text-5xl">
                {product.image}
              </div>
            </button>
            <CardContent className="p-4">
              <button onClick={() => setSelectedProduct(product)} className="text-left w-full">
                <h3 className="font-semibold text-foreground truncate hover:text-primary transition-colors">
                  {product.name}
                </h3>
              </button>
              <p className="text-xs text-muted-foreground mt-0.5">{product.creator}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-lg font-bold text-primary">{product.price}</span>
                {cart[product.id] ? (
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => removeFromCart(product.id)}>
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-6 text-center text-sm font-medium">{cart[product.id]}</span>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => addToCart(product.id)}>
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <Button size="sm" onClick={() => addToCart(product.id)}>
                    <ShoppingCart className="w-3.5 h-3.5 mr-1" /> Add
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No products found</p>
        </div>
      )}

      {/* Cart Dialog */}
      <Dialog open={showCart} onOpenChange={setShowCart}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Shopping Cart</DialogTitle>
            <DialogDescription>{cartCount} items</DialogDescription>
          </DialogHeader>
          {cartCount === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(cart).map(([id, qty]) => {
                const product = mockProducts.find((p) => p.id === Number(id));
                if (!product) return null;
                return (
                  <div key={id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                    <span className="text-2xl">{product.image}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.price} × {qty}</p>
                    </div>
                    <span className="font-semibold text-foreground">{product.price * qty}</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeFromCart(Number(id))}>
                      <Minus className="w-3 h-3" />
                    </Button>
                  </div>
                );
              })}
              <div className="border-t border-border pt-3 flex justify-between items-center">
                <span className="font-semibold text-foreground">Total</span>
                <span className="text-xl font-bold text-primary">{cartTotal} B-Coins</span>
              </div>
            </div>
          )}
          {cartCount > 0 && (
            <DialogFooter>
              <Button className="w-full" onClick={() => { setShowCart(false); setShowBuyConfirm(true); setBuyProduct(null); }}>
                Checkout
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Buy Confirmation */}
      <AlertDialog open={showBuyConfirm} onOpenChange={setShowBuyConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Purchase</AlertDialogTitle>
            <AlertDialogDescription>
              {buyProduct
                ? `Are you sure you want to buy ${buyProduct.name} for ${buyProduct.price * quantity} B-Coins?`
                : `Checkout ${cartCount} items for ${cartTotal} B-Coins?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBuy}>Proceed to Pay</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* PIN Dialog */}
      <Dialog open={showPinDialog} onOpenChange={setShowPinDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Enter Wallet PIN</DialogTitle>
            <DialogDescription>Enter your 6-digit PIN to confirm purchase</DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-4">
            <InputOTP maxLength={6} value={pin} onChange={setPin}>
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
            <Button onClick={handlePinSubmit} disabled={pin.length < 6} className="w-full">Confirm Purchase</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

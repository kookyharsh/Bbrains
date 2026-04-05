"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, QrCode, Loader2, BookOpen, ArrowLeft, ShoppingCart, CheckCircle2, Clock, ExternalLink, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { DashboardContent } from "@/components/dashboard-content";
import { orderApi, Order } from "@/services/api/client";
import { QRCodeDisplay } from "@/components/qr-code-display";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true);
        const resp = await orderApi.getOrders(1, 100);
        if (resp.success && resp.data) {
          setOrders(Array.isArray(resp.data) ? resp.data : []);
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const statusConfig: Record<string, { label: string; color: string; icon: LucideIcon }> = {
    order_placed: { label: "Order Placed", color: "bg-amber-500/10 text-amber-500 border-amber-500/20", icon: Clock },
    completed: { label: "Completed", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", icon: CheckCircle2 },
    delivered: { label: "Delivered", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", icon: CheckCircle2 },
    cancelled: { label: "Cancelled", color: "bg-red-500/10 text-red-500 border-red-500/20", icon: Package },
  };

  if (loading) {
    return (
      <DashboardContent>
        <div className="py-32 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-brand-orange" />
          <p className="text-sm font-black uppercase tracking-widest text-muted-foreground animate-pulse">Loading Orders...</p>
        </div>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
              <ShoppingCart className="w-8 h-8 text-brand-orange" />
              My Orders
            </h1>
            <p className="text-muted-foreground text-sm font-medium mt-1">Track your purchases and deliveries</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <Card className="border-2 border-dashed border-border/50 bg-muted/20 rounded-[2rem] py-24">
            <div className="flex flex-col items-center justify-center text-center px-6">
              <div className="w-20 h-20 bg-muted rounded-3xl flex items-center justify-center mb-6">
                <Package className="w-10 h-10 text-muted-foreground opacity-50" />
              </div>
              <h3 className="text-xl font-bold mb-2">No Orders Yet</h3>
              <p className="text-muted-foreground max-w-sm mb-8">Products you purchase will appear here</p>
              <Link href="/market">
                <Button variant="outline" className="rounded-xl border-2 font-bold px-8">Browse Market</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList className="bg-white/5 border border-white/10 rounded-xl p-1">
              <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-brand-orange data-[state=active]:text-white">All ({orders.length})</TabsTrigger>
              <TabsTrigger value="physical" className="rounded-lg data-[state=active]:bg-brand-orange data-[state=active]:text-white">Physical ({orders.filter(o => o.orderType !== 'digital').length})</TabsTrigger>
              <TabsTrigger value="digital" className="rounded-lg data-[state=active]:bg-brand-orange data-[state=active]:text-white">Digital ({orders.filter(o => o.orderType === 'digital').length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-3">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} statusConfig={statusConfig} onView={() => setSelectedOrder(order)} onShowQR={() => { setSelectedOrder(order); setShowQR(true); }} />
              ))}
            </TabsContent>

            <TabsContent value="physical" className="space-y-3">
              {orders.filter(o => o.orderType !== 'digital').map((order) => (
                <OrderCard key={order.id} order={order} statusConfig={statusConfig} onView={() => setSelectedOrder(order)} onShowQR={() => { setSelectedOrder(order); setShowQR(true); }} />
              ))}
            </TabsContent>

            <TabsContent value="digital" className="space-y-3">
              {orders.filter(o => o.orderType === 'digital').map((order) => (
                <OrderCard key={order.id} order={order} statusConfig={statusConfig} onView={() => setSelectedOrder(order)} onShowQR={() => { setSelectedOrder(order); setShowQR(true); }} />
              ))}
            </TabsContent>
          </Tabs>
        )}

        <Dialog open={!!selectedOrder && !showQR} onOpenChange={(open) => !open && setSelectedOrder(null)}>
          <DialogContent className="rounded-3xl border-white/10 bg-slate-950/95 backdrop-blur-2xl p-0 overflow-hidden shadow-2xl max-w-lg">
            <div className="p-6 space-y-5">
              <DialogHeader>
                <DialogTitle className="text-xl font-black">Order #{selectedOrder?.id}</DialogTitle>
                <DialogDescription className="text-sm text-white/40">
                  {selectedOrder ? new Date(selectedOrder.orderDate).toLocaleDateString() : ''}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3">
                {selectedOrder?.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-white/5 shrink-0">
                      {item.product?.image ? (
                        <Image src={item.product.image} alt={item.product.name} fill className="object-cover" />
                      ) : (
                        <Package className="w-5 h-5 text-white/10 m-3.5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-sm truncate">{item.product?.name || 'Product'}</p>
                      <p className="text-xs text-white/40">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-bold text-brand-orange text-sm">{Number(item.price) * item.quantity} B-Coins</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/5 pt-4 flex justify-between items-center">
                <span className="text-sm font-bold text-white/40 uppercase tracking-wider">Total</span>
                <span className="text-2xl font-black text-white">{Number(selectedOrder?.totalAmount || 0)} <span className="text-sm text-brand-orange">B-Coins</span></span>
              </div>

              {selectedOrder && statusConfig[selectedOrder.status] && (
                <Badge className={cn("w-fit text-[10px] font-black uppercase tracking-widest px-3 py-1 border", statusConfig[selectedOrder.status].color)}>
                  {statusConfig[selectedOrder.status].label}
                </Badge>
              )}

              {selectedOrder?.orderType !== 'digital' && selectedOrder?.status === 'order_placed' && selectedOrder?.qrCode && (
                <Button onClick={() => setShowQR(true)} className="w-full h-12 rounded-xl bg-brand-orange hover:bg-brand-orange/90 text-white font-bold">
                  <QrCode className="w-4 h-4 mr-2" />
                  Show QR Code
                </Button>
              )}

              {selectedOrder?.orderType === 'digital' && (
                <Link href="/library">
                  <Button className="w-full h-12 rounded-xl bg-brand-orange hover:bg-brand-orange/90 text-white font-bold">
                    <BookOpen className="w-4 h-4 mr-2" />
                    View in Library
                  </Button>
                </Link>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showQR} onOpenChange={(open) => { if (!open) setShowQR(false); }}>
          <DialogContent className="rounded-3xl border-white/10 bg-slate-950/95 backdrop-blur-2xl p-6 shadow-2xl max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-xl font-black text-center">Order #{selectedOrder?.id}</DialogTitle>
              <DialogDescription className="text-sm text-white/40 text-center">Show this QR code to the seller for delivery confirmation</DialogDescription>
            </DialogHeader>
            {selectedOrder?.qrCode && (
              <QRCodeDisplay value={selectedOrder.qrCode} size={220} label="Delivery QR Code" />
            )}
            <p className="text-xs text-white/30 text-center mt-2">The seller will scan this code to confirm delivery</p>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardContent>
  );
}

function OrderCard({
  order,
  statusConfig,
  onView,
  onShowQR,
}: {
  order: Order;
  statusConfig: Record<string, { label: string; color: string; icon: LucideIcon }>;
  onView: () => void;
  onShowQR: () => void;
}) {
  const config = statusConfig[order.status] || { label: order.status, color: "bg-slate-500/10 text-slate-500", icon: Package };
  const Icon = config.icon;

  return (
    <Card className="rounded-xl border-white/5 bg-white/[0.02] hover:border-white/10 transition-all">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
              <Icon className="w-5 h-5 text-white/30" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Order #{order.id}</p>
              <p className="text-xs text-white/30">{new Date(order.orderDate).toLocaleDateString()} · {order.items.length} item{order.items.length > 1 ? 's' : ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="font-bold text-brand-orange text-sm">{Number(order.totalAmount)} B-Coins</p>
              <Badge className={cn("text-[10px] font-black uppercase tracking-widest px-2 py-0.5 border", config.color)}>
                {config.label}
              </Badge>
            </div>
            {order.orderType !== 'digital' && order.status === 'order_placed' && order.qrCode && (
              <Button size="sm" variant="outline" onClick={onShowQR} className="h-8 w-8 p-0 rounded-lg">
                <QrCode className="w-4 h-4" />
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={onView} className="h-8 w-8 p-0 rounded-lg">
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

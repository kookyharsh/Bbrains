"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { History, Package, Eye } from "lucide-react";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image: string;
}

interface Order {
  id: string;
  date: string;
  status: "completed" | "pending" | "cancelled";
  total: number;
  items: OrderItem[];
}

const mockOrders: Order[] = [
  {
    id: "ORD-001",
    date: "2026-03-07",
    status: "completed",
    total: 330,
    items: [
      { name: "Wireless Earbuds", quantity: 1, price: 250, image: "🎧" },
      { name: "Notebook Set (5 Pack)", quantity: 1, price: 80, image: "📓" },
    ],
  },
  {
    id: "ORD-002",
    date: "2026-03-05",
    status: "completed",
    total: 45,
    items: [{ name: "Water Bottle (1L)", quantity: 1, price: 45, image: "🍶" }],
  },
  {
    id: "ORD-003",
    date: "2026-03-04",
    status: "pending",
    total: 350,
    items: [{ name: "Campus Hoodie", quantity: 1, price: 350, image: "🧥" }],
  },
  {
    id: "ORD-004",
    date: "2026-02-28",
    status: "cancelled",
    total: 200,
    items: [{ name: "Graphing Calculator", quantity: 1, price: 200, image: "🔢" }],
  },
];

export default function OrderHistoryPage() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const statusVariant = (status: string) => {
    if (status === "completed") return "default" as const;
    if (status === "pending") return "secondary" as const;
    return "destructive" as const;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <History className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Order History</h1>
      </div>

      {mockOrders.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No orders yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {mockOrders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-1">
                      {order.items.slice(0, 3).map((item, i) => (
                        <span key={i} className="text-xl">{item.image}</span>
                      ))}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{order.id}</p>
                      <p className="text-xs text-muted-foreground">{order.date} • {order.items.length} item{order.items.length > 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-bold text-primary">{order.total} B-Coins</p>
                      <Badge variant={statusVariant(order.status)}>{order.status}</Badge>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(order)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Order {selectedOrder?.id}</DialogTitle>
            <DialogDescription>{selectedOrder?.date}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {selectedOrder?.items.map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                <span className="text-2xl">{item.image}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm">{item.name}</p>
                  <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <span className="font-semibold text-foreground">{item.price} B-Coins</span>
              </div>
            ))}
            <div className="border-t border-border pt-3 flex justify-between">
              <span className="font-semibold text-foreground">Total</span>
              <span className="text-lg font-bold text-primary">{selectedOrder?.total} B-Coins</span>
            </div>
            <Badge variant={statusVariant(selectedOrder?.status || "pending")} className="w-fit">
              {selectedOrder?.status}
            </Badge>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

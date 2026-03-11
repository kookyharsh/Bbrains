"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Package, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface MyProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  status: "pending" | "approved" | "rejected";
}

const initialProducts: MyProduct[] = [
  { id: 1, name: "Handmade Notebook", description: "Custom leather-bound notebook with 150 pages", price: 120, stock: 10, image: "📓", status: "approved" },
  { id: 2, name: "Study Guide: Physics", description: "Comprehensive physics study guide for final exams", price: 50, stock: 25, image: "📘", status: "approved" },
  { id: 3, name: "Custom Stickers Pack", description: "Set of 20 custom campus-themed stickers", price: 30, stock: 100, image: "🎨", status: "pending" },
];

export default function MyProductsPage() {
  const [products, setProducts] = useState<MyProduct[]>(initialProducts);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editProduct, setEditProduct] = useState<MyProduct | null>(null);
  const [form, setForm] = useState({ name: "", description: "", price: "", stock: "", image: "📦" });

  const resetForm = () => setForm({ name: "", description: "", price: "", stock: "", image: "📦" });

  const handleAdd = () => {
    if (!form.name || !form.price || !form.stock) return;
    const newProduct: MyProduct = {
      id: Date.now(),
      name: form.name,
      description: form.description,
      price: Number(form.price),
      stock: Number(form.stock),
      image: form.image,
      status: "pending",
    };
    setProducts((prev) => [...prev, newProduct]);
    setShowAddDialog(false);
    resetForm();
    toast("Product Added", { description: "Your product is pending approval." });
  };

  const handleEdit = () => {
    if (!editProduct || !form.name || !form.price) return;
    setProducts((prev) =>
      prev.map((p) =>
        p.id === editProduct.id
          ? { ...p, name: form.name, description: form.description, price: Number(form.price), stock: Number(form.stock) }
          : p
      )
    );
    setEditProduct(null);
    resetForm();
    toast("Product Updated");
  };

  const handleDelete = (id: number) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    toast("Product Deleted");
  };

  const openEdit = (product: MyProduct) => {
    setEditProduct(product);
    setForm({ name: product.name, description: product.description, price: String(product.price), stock: String(product.stock), image: product.image });
  };

  const statusColor = (status: string) => {
    if (status === "approved") return "default";
    if (status === "pending") return "secondary";
    return "destructive";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">My Products</h1>
        <Button onClick={() => { resetForm(); setShowAddDialog(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Add Product
        </Button>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>You haven't listed any products yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <Card key={product.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="text-3xl">{product.image}</div>
                  <Badge variant={statusColor(product.status)}>{product.status}</Badge>
                </div>
                <h3 className="font-semibold text-foreground">{product.name}</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-lg font-bold text-primary">{product.price} B-Coins</span>
                  <span className="text-xs text-muted-foreground">Stock: {product.stock}</span>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(product)}>
                    <Pencil className="w-3 h-3 mr-1" /> Edit
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleDelete(product.id)}>
                    <Trash2 className="w-3 h-3 mr-1" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog || !!editProduct} onOpenChange={(open) => { if (!open) { setShowAddDialog(false); setEditProduct(null); resetForm(); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
            <DialogDescription>{editProduct ? "Update your product details" : "List a new product on the campus market"}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Product Name</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Enter product name" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Description</label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe your product" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">Price (B-Coins)</label>
                <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Stock</label>
                <Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="0" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={editProduct ? handleEdit : handleAdd}>
              {editProduct ? "Save Changes" : "Add Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

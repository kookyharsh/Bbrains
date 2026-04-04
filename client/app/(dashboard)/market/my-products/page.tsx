"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Package, Plus, Pencil, Trash2, Loader2, Image as ImageIcon, X, Upload } from "lucide-react";
import { toast } from "sonner";
import { marketApi, Product } from "@/services/api/client";
import { useCloudinaryUpload } from "@/hooks/use-cloudinary-upload";
import Image from "next/image";
import { DashboardContent } from "@/components/dashboard-content";
import { cn } from "@/lib/utils";

export default function MyProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { uploadFile, isUploading, progress } = useCloudinaryUpload();

  const [form, setForm] = useState({ 
    name: "", 
    description: "", 
    price: "", 
    stock: "", 
    imageUrl: "" 
  });

  const fetchMyProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await marketApi.getMyProducts();
      if (response.success && response.data) {
        const productsData = (response.data as any)?.data || response.data;
        setProducts(Array.isArray(productsData) ? productsData : []);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      toast.error("Failed to load your products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyProducts();
  }, [fetchMyProducts]);

  const resetForm = () => {
    setForm({ name: "", description: "", price: "", stock: "", imageUrl: "" });
    setSelectedProduct(null);
  };

  const handleEditClick = (product: any) => {
    setSelectedProduct(product);
    setForm({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      stock: product.stock.toString(),
      imageUrl: product.image || ""
    });
    setShowEditDialog(true);
  };

  const handleUpdateProduct = async () => {
    if (!selectedProduct) return;
    if (!form.name || !form.price || !form.stock) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      const data = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        stock: Number(form.stock),
        imageUrl: form.imageUrl,
      };

      const isPending = (selectedProduct as any).approval === 'pending';
      const response = isPending 
        ? await marketApi.updateProduct(selectedProduct.id, data)
        : await marketApi.requestEditReview(selectedProduct.id, data);

      if (response.success) {
        toast.success(isPending ? "Product updated" : "Edit review requested", { 
          description: isPending ? "Your changes have been saved." : "An admin will review your changes." 
        });
        setShowEditDialog(false);
        resetForm();
        fetchMyProducts();
      } else {
        toast.error(response.message || "Failed to update product");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await uploadFile(file);
      if (url) {
        setForm(prev => ({ ...prev, imageUrl: url }));
        toast.success("Image uploaded successfully");
      } else {
        toast.error("Failed to upload image");
      }
    } catch (error) {
      toast.error("Error uploading image");
    }
  };

  const handleAddProduct = async () => {
    if (!form.name || !form.price || !form.stock) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await marketApi.createProduct({
        name: form.name,
        description: form.description,
        price: Number(form.price),
        stock: Number(form.stock),
        imageUrl: form.imageUrl,
        metadata: { category: "product" }
      });

      if (response.success) {
        toast.success("Product created", { description: "Your product is pending approval." });
        setShowAddDialog(false);
        resetForm();
        fetchMyProducts();
      } else {
        toast.error(response.message || "Failed to create product");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "pending": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "rejected": return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      default: return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }
  };

  return (
    <DashboardContent>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
              <Package className="w-8 h-8 text-brand-orange" />
              Inventory Control
            </h1>
            <p className="text-muted-foreground text-sm font-medium mt-1">Manage and track your campus marketplace listings</p>
          </div>
          <Button 
            onClick={() => { resetForm(); setShowAddDialog(true); }}
            className="bg-brand-orange hover:bg-brand-orange/90 text-white font-bold rounded-xl h-12 px-6 shadow-lg shadow-brand-orange/20 transition-all hover:scale-105"
          >
            <Plus className="w-5 h-5 mr-2" /> List New Product
          </Button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-brand-orange" />
            <p className="text-sm font-black uppercase tracking-widest text-muted-foreground animate-pulse">Syncing Inventory...</p>
          </div>
        ) : products.length === 0 ? (
          <Card className="border-2 border-dashed border-border/50 bg-muted/20 rounded-[2rem] py-24">
            <div className="flex flex-col items-center justify-center text-center px-6">
              <div className="w-20 h-20 bg-muted rounded-3xl flex items-center justify-center mb-6">
                <Package className="w-10 h-10 text-muted-foreground opacity-50" />
              </div>
              <h3 className="text-xl font-bold mb-2">No Products Found</h3>
              <p className="text-muted-foreground max-w-sm mb-8">You haven't listed any products yet. Start selling to the campus community today!</p>
              <Button variant="outline" onClick={() => setShowAddDialog(true)} className="rounded-xl border-2 font-bold px-8">
                Create Your First Listing
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product: any) => (
              <Card key={product.id} className="group overflow-hidden rounded-[2rem] border-white/5 bg-white/[0.02] backdrop-blur-sm hover:border-brand-orange/30 transition-all duration-300">
                <div className="aspect-square relative bg-white/[0.03] p-4 flex items-center justify-center overflow-hidden">
                  {product.image ? (
                    <Image 
                      src={product.image} 
                      alt={product.name} 
                      fill 
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <Package className="w-16 h-16 text-muted-foreground/20" />
                  )}
                  <div className="absolute top-4 right-4">
                    <Badge className={cn("font-black text-[10px] uppercase tracking-widest px-3 py-1 border-2 shadow-lg", statusColor(product.approval))}>
                      {product.approval}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="font-black text-lg text-foreground line-clamp-1 group-hover:text-brand-orange transition-colors">{product.name}</h3>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleEditClick(product)}
                      className="h-8 w-8 rounded-lg hover:bg-brand-orange/10 hover:text-brand-orange transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2 min-h-[2rem] font-medium leading-relaxed">{product.description}</p>
                  
                  <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/5">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Price</span>
                      <span className="text-xl font-black text-brand-orange">{product.price} <span className="text-[10px] opacity-60">B-Coins</span></span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Stock</span>
                      <span className="text-lg font-black text-white/80">{product.stock}</span>
                    </div>
                  </div>
                  
                  {product.approval === 'rejected' && product.metadata?.rejectionReason && (
                    <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                      <p className="text-[10px] font-black uppercase tracking-widest text-rose-500 mb-1">Reason for Rejection</p>
                      <p className="text-xs font-medium text-rose-400/90 leading-relaxed">
                        {product.metadata.rejectionReason}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add Product Dialog */}
        <Dialog open={showAddDialog} onOpenChange={(open) => { if (!open) { setShowAddDialog(false); resetForm(); } }}>
          <DialogContent className="max-w-2xl rounded-[2.5rem] border-white/10 bg-slate-950/95 backdrop-blur-2xl p-0 overflow-hidden shadow-2xl">
            <div className="p-8 space-y-8">
              <DialogHeader>
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 bg-brand-orange/10 rounded-2xl flex items-center justify-center">
                    <Plus className="w-6 h-6 text-brand-orange" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-black tracking-tight">List New Asset</DialogTitle>
                    <DialogDescription className="font-medium text-white/40">Provide specifications for your marketplace entry</DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Side: Media */}
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Visual Representation</label>
                    <div className={cn(
                      "aspect-square relative rounded-[2rem] border-2 border-dashed border-white/10 bg-white/[0.02] flex flex-col items-center justify-center overflow-hidden group/img transition-all",
                      isUploading && "animate-pulse border-brand-orange/30"
                    )}>
                      {form.imageUrl ? (
                        <>
                          <Image src={form.imageUrl} alt="Preview" fill className="object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                            <Button variant="destructive" size="icon" onClick={() => setForm(p => ({ ...p, imageUrl: "" }))} className="rounded-full">
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          {isUploading ? (
                            <div className="flex flex-col items-center gap-3">
                              <Loader2 className="w-8 h-8 animate-spin text-brand-orange" />
                              <span className="text-[10px] font-black text-brand-orange uppercase tracking-widest">{progress}%</span>
                            </div>
                          ) : (
                            <>
                              <ImageIcon className="w-10 h-10 text-white/10 mb-4" />
                              <label className="cursor-pointer">
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                <span className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white/60 transition-colors border border-white/5">
                                  Upload Image
                                </span>
                              </label>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Side: Fields */}
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Asset Name</label>
                    <Input 
                      value={form.name} 
                      onChange={(e) => setForm({ ...form, name: e.target.value })} 
                      placeholder="e.g. Premium Study Notes" 
                      className="h-12 rounded-xl bg-white/5 border-white/5 focus:border-brand-orange/50 transition-all font-bold placeholder:text-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Description</label>
                    <Textarea 
                      value={form.description} 
                      onChange={(e) => setForm({ ...form, description: e.target.value })} 
                      placeholder="Detail the capabilities and quality of your asset..." 
                      className="min-h-[100px] rounded-xl bg-white/5 border-white/5 focus:border-brand-orange/50 transition-all font-medium placeholder:text-white/10 resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Price (B-Coins)</label>
                      <Input 
                        type="number" 
                        value={form.price} 
                        onChange={(e) => setForm({ ...form, price: e.target.value })} 
                        placeholder="0" 
                        className="h-12 rounded-xl bg-white/5 border-white/5 focus:border-brand-orange/50 transition-all font-black"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Available Stock</label>
                      <Input 
                        type="number" 
                        value={form.stock} 
                        onChange={(e) => setForm({ ...form, stock: e.target.value })} 
                        placeholder="0" 
                        className="h-12 rounded-xl bg-white/5 border-white/5 focus:border-brand-orange/50 transition-all font-black"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="bg-white/5 p-6 mt-4">
              <Button variant="ghost" onClick={() => setShowAddDialog(false)} className="rounded-xl font-bold text-white/40 hover:text-white hover:bg-white/5">
                Cancel Operation
              </Button>
              <Button 
                onClick={handleAddProduct} 
                disabled={isSubmitting || isUploading}
                className="bg-brand-orange hover:bg-brand-orange/90 text-white font-black px-8 rounded-xl h-12 shadow-lg shadow-brand-orange/20"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Finalize Listing
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Product Dialog */}
        <Dialog open={showEditDialog} onOpenChange={(open) => { if (!open) { setShowEditDialog(false); resetForm(); } }}>
          <DialogContent className="max-w-2xl rounded-[2.5rem] border-white/10 bg-slate-950/95 backdrop-blur-2xl p-0 overflow-hidden shadow-2xl">
            <div className="p-8 space-y-8">
              <DialogHeader>
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 bg-brand-orange/10 rounded-2xl flex items-center justify-center">
                    <Pencil className="w-6 h-6 text-brand-orange" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-black tracking-tight">
                      {(selectedProduct as any)?.approval === 'approved' ? 'Request Edit Review' : 'Update Asset'}
                    </DialogTitle>
                    <DialogDescription className="font-medium text-white/40">
                      {(selectedProduct as any)?.approval === 'approved' 
                        ? 'Approved products require admin review for updates.' 
                        : 'Modify specifications for your marketplace entry'}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Side: Media */}
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Visual Representation</label>
                    <div className={cn(
                      "aspect-square relative rounded-[2rem] border-2 border-dashed border-white/10 bg-white/[0.02] flex flex-col items-center justify-center overflow-hidden group/img transition-all",
                      isUploading && "animate-pulse border-brand-orange/30"
                    )}>
                      {form.imageUrl ? (
                        <>
                          <Image src={form.imageUrl} alt="Preview" fill className="object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                            <Button variant="destructive" size="icon" onClick={() => setForm(p => ({ ...p, imageUrl: "" }))} className="rounded-full">
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          {isUploading ? (
                            <div className="flex flex-col items-center gap-3">
                              <Loader2 className="w-8 h-8 animate-spin text-brand-orange" />
                              <span className="text-[10px] font-black text-brand-orange uppercase tracking-widest">{progress}%</span>
                            </div>
                          ) : (
                            <>
                              <ImageIcon className="w-10 h-10 text-white/10 mb-4" />
                              <label className="cursor-pointer">
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                <span className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white/60 transition-colors border border-white/5">
                                  Upload Image
                                </span>
                              </label>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Side: Fields */}
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Asset Name</label>
                    <Input 
                      value={form.name} 
                      onChange={(e) => setForm({ ...form, name: e.target.value })} 
                      placeholder="e.g. Premium Study Notes" 
                      className="h-12 rounded-xl bg-white/5 border-white/5 focus:border-brand-orange/50 transition-all font-bold placeholder:text-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Description</label>
                    <Textarea 
                      value={form.description} 
                      onChange={(e) => setForm({ ...form, description: e.target.value })} 
                      placeholder="Detail the capabilities and quality of your asset..." 
                      className="min-h-[100px] rounded-xl bg-white/5 border-white/5 focus:border-brand-orange/50 transition-all font-medium placeholder:text-white/10 resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Price (B-Coins)</label>
                      <Input 
                        type="number" 
                        value={form.price} 
                        onChange={(e) => setForm({ ...form, price: e.target.value })} 
                        placeholder="0" 
                        className="h-12 rounded-xl bg-white/5 border-white/5 focus:border-brand-orange/50 transition-all font-black"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Available Stock</label>
                      <Input 
                        type="number" 
                        value={form.stock} 
                        onChange={(e) => setForm({ ...form, stock: e.target.value })} 
                        placeholder="0" 
                        className="h-12 rounded-xl bg-white/5 border-white/5 focus:border-brand-orange/50 transition-all font-black"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="bg-white/5 p-6 mt-4">
              <Button variant="ghost" onClick={() => setShowEditDialog(false)} className="rounded-xl font-bold text-white/40 hover:text-white hover:bg-white/5">
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateProduct} 
                disabled={isSubmitting || isUploading}
                className="bg-brand-orange hover:bg-brand-orange/90 text-white font-black px-8 rounded-xl h-12 shadow-lg shadow-brand-orange/20"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    {(selectedProduct as any)?.approval === 'approved' ? 'Submit Review Request' : 'Save Changes'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardContent>
  );
}

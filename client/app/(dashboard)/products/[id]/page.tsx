"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  Package,
  ArrowLeft,
  Trash2,
  Loader2,
  Star,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  X,
  Image as ImageIcon,
  GripVertical,
  Upload,
  Edit,
} from "lucide-react";
import { toast } from "sonner";
import { DashboardContent } from "@/components/dashboard-content";
import { marketApi, Product } from "@/services/api/client";
import { useCloudinaryUpload } from "@/hooks/use-cloudinary-upload";
import { cn } from "@/lib/utils";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = Number(params?.id);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const { uploadFile, isUploading } = useCloudinaryUpload();

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      const resp = await marketApi.getProduct(productId);
      if (resp.success && resp.data) {
        const data = (resp.data as any)?.data || resp.data;
        setProduct(data);
        const imgs: string[] = [];
        if (data.image) imgs.push(data.image);
        if (data.metadata?.previewImages) imgs.push(...data.metadata.previewImages);
        setImages([...new Set(imgs)]);
      } else {
        toast.error("Product not found");
        router.push("/products");
      }
    } catch (error) {
      console.error("Failed to fetch product:", error);
      toast.error("Failed to load product");
    } finally {
      setLoading(false);
    }
  }, [productId, router]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const resp = await marketApi.deleteProduct(productId);
      if (resp.success) {
        toast.success("Product deleted");
        router.push("/products");
      } else {
        toast.error(resp.message || "Failed to delete");
      }
    } catch (error) {
      toast.error("Failed to delete product");
    } finally {
      setIsDeleting(false);
      setShowDeleteAlert(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadFile(file);
      if (url) {
        setImages(prev => [...prev, url]);
        toast.success("Image uploaded");
      }
    } catch (error) {
      toast.error("Failed to upload image");
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const setPrimaryImage = (index: number) => {
    if (index === 0 || images.length <= 1) return;
    setImages(prev => {
      const newImages = [...prev];
      const [img] = newImages.splice(index, 1);
      newImages.unshift(img);
      return newImages;
    });
    toast.success("Primary image updated");
  };

  const handleDragStart = (index: number) => setDragIndex(index);
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    setImages(prev => {
      const newImages = [...prev];
      const [dragged] = newImages.splice(dragIndex, 1);
      newImages.splice(index, 0, dragged);
      return newImages;
    });
    setDragIndex(index);
  };
  const handleDragEnd = () => setDragIndex(null);

  if (loading) {
    return (
      <DashboardContent>
        <div className="py-32 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-brand-orange" />
          <p className="text-sm font-black uppercase tracking-widest text-muted-foreground animate-pulse">Loading Product...</p>
        </div>
      </DashboardContent>
    );
  }

  if (!product) return null;

  const statusConfig: Record<string, { label: string; color: string }> = {
    approved: { label: "Live", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
    pending: { label: "Pending Approval", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
    rejected: { label: "Rejected", color: "bg-red-500/10 text-red-500 border-red-500/20" },
    draft: { label: "Draft", color: "bg-slate-500/10 text-slate-500 border-slate-500/20" },
  };

  const status = statusConfig[product.approval] || statusConfig.draft;
  const isLowStock = product.productType === 'physical' && product.stock > 0 && product.stock <= 5;
  const isOutOfStock = product.productType === 'physical' && product.stock <= 0;
  const rejectionReason = (product as any).metadata?.rejectionReason;

  return (
    <DashboardContent>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push("/products")} className="h-10 w-10 rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white">{product.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={product.productType === 'digital' ? 'default' : 'secondary'} className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5">
                  {product.productType}
                </Badge>
                <Badge className={cn("text-[10px] font-black uppercase tracking-widest px-2 py-0.5 border", status.color)}>
                  {status.label}
                </Badge>
              </div>
            </div>
          </div>
          <Button variant="outline" onClick={() => setShowDeleteAlert(true)} className="h-10 px-4 rounded-xl border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/40">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>

        {rejectionReason && product.approval === 'rejected' && (
          <Card className="rounded-xl border-red-500/20 bg-red-500/5">
            <CardContent className="p-4">
              <p className="text-sm font-bold text-red-400">Rejection Reason: {rejectionReason}</p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="rounded-2xl border-white/5 bg-white/[0.02]">
              <CardContent className="p-6">
                <h3 className="text-sm font-black uppercase tracking-widest text-white/30 mb-4">Product Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      draggable
                      onDragStart={() => handleDragStart(idx)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDragEnd={handleDragEnd}
                      className={cn(
                        "relative aspect-square rounded-xl overflow-hidden bg-white/5 group border-2 transition-all",
                        dragIndex === idx ? "border-brand-orange opacity-50" : "border-white/10",
                        idx === 0 && "ring-2 ring-brand-orange/20"
                      )}
                    >
                      <Image src={img} alt={`Image ${idx + 1}`} fill className="object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        {idx > 0 && (
                          <Button size="icon" variant="ghost" onClick={() => setPrimaryImage(idx)} className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 text-white" title="Set as primary">
                            <CheckCircle2 className="w-4 h-4" />
                          </Button>
                        )}
                        <Button size="icon" variant="ghost" onClick={() => removeImage(idx)} className="h-8 w-8 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-400">
                          <X className="w-4 h-4" />
                        </Button>
                        <div className="absolute top-1 left-1 cursor-grab active:cursor-grabbing">
                          <GripVertical className="w-4 h-4 text-white/50" />
                        </div>
                      </div>
                      {idx === 0 && (
                        <Badge className="absolute top-2 right-2 text-[9px] font-black uppercase bg-brand-orange text-white px-1.5 py-0">Primary</Badge>
                      )}
                    </div>
                  ))}
                  <label className={cn(
                    "aspect-square rounded-xl border-2 border-dashed border-white/10 bg-white/[0.02] flex flex-col items-center justify-center cursor-pointer hover:border-brand-orange/30 hover:bg-brand-orange/5 transition-all",
                    isUploading && "animate-pulse border-brand-orange/30"
                  )}>
                    {isUploading ? (
                      <Loader2 className="w-8 h-8 animate-spin text-brand-orange" />
                    ) : (
                      <>
                        <ImageIcon className="w-8 h-8 text-white/10 mb-2" />
                        <span className="text-[10px] font-bold text-white/30 uppercase tracking-wider">Add Image</span>
                      </>
                    )}
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                  </label>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-white/5 bg-white/[0.02]">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-white/30">Description</h3>
                <p className="text-sm text-white/70 leading-relaxed">{product.description || "No description provided."}</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="rounded-2xl border-white/5 bg-white/[0.02]">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-white/30">Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/40">Price</span>
                    <span className="text-lg font-black text-brand-orange">{product.price} B-Coins</span>
                  </div>
                  {product.productType === 'physical' && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-white/40">Stock</span>
                      <div className="flex items-center gap-2">
                        {isOutOfStock ? (
                          <span className="text-sm font-bold text-red-400">Out of Stock</span>
                        ) : isLowStock ? (
                          <div className="flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                            <span className="text-sm font-bold text-amber-400">{product.stock} left</span>
                          </div>
                        ) : (
                          <span className="text-sm font-bold text-green-400">{product.stock}</span>
                        )}
                      </div>
                    </div>
                  )}
                  {product.productType === 'digital' && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-white/40">File</span>
                      <Badge variant="outline" className="text-[10px] font-black uppercase">{product.metadata?.fileType || 'N/A'}</Badge>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/40">Created</span>
                    <span className="text-sm text-white/60">{new Date(product.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-white/5 bg-white/[0.02]">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-white/30 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-brand-orange" />
                  Performance
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/40">Units Sold</span>
                    <span className="text-lg font-black text-white">{product.unitsSold || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/40">Total Revenue</span>
                    <span className="text-lg font-black text-brand-orange">{((product.unitsSold || 0) * product.price).toFixed(0)} B-Coins</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/40">Rating</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm font-bold text-white">{product.rating ? product.rating.toFixed(1) : "0.0"}</span>
                      <span className="text-xs text-white/30">({product.reviewCount || 0})</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
          <AlertDialogContent className="rounded-3xl border-white/10 bg-slate-950/95 backdrop-blur-2xl p-8 shadow-2xl">
            <AlertDialogHeader className="space-y-4">
              <div className="w-16 h-16 bg-red-500/10 rounded-3xl flex items-center justify-center">
                <Trash2 className="w-8 h-8 text-red-400" />
              </div>
              <AlertDialogTitle className="text-2xl font-black tracking-tight text-white">Delete "{product.name}"?</AlertDialogTitle>
              <AlertDialogDescription className="text-base font-medium text-white/40">This action cannot be undone. All associated data will be permanently removed.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-6 gap-3">
              <AlertDialogCancel className="h-12 rounded-xl border-white/10 bg-transparent text-white/40 font-bold hover:bg-white/5">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="h-12 rounded-xl bg-red-500 hover:bg-red-600 text-white font-black px-8">
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Delete Product
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardContent>
  );
}

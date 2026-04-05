"use client"

import React, { useState, useEffect, useCallback } from "react"
import { getAuthedClient } from "@/services/api/client"
import { Loader2, CheckCircle, XCircle, Package, ArrowRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from "@/components/ui/sheet"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    VisuallyHidden,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { SectionHeader } from "@/features/admin/components/SectionHeader"
import { RoleBadge } from "@/features/admin/components/RoleBadge"
import Image from "next/image"
import type { ApiProduct } from "@/lib/types/api"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

function fmtCurrency(n: number | string) {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(n))
}

export default function ProductsApprovalPage() {
    const [products, setProducts] = useState<ApiProduct[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<number | null>(null)
    const [selectedProduct, setSelectedProduct] = useState<ApiProduct | null>(null)
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
    const [rejectReason, setRejectReason] = useState("")

    const load = useCallback(async () => {
        try {
            setLoading(true)
            const c = await getAuthedClient()
            const res = await c.get<{ success: boolean; data: ApiProduct[] }>("/market/pending")
            setProducts(res.data.data)
        } catch (e) { 
            console.error(e) 
            toast.error("Failed to load products")
        } finally { 
            setLoading(false) 
        }
    }, [])

    useEffect(() => { load() }, [load])

    const handleViewDetails = (product: ApiProduct) => {
        setSelectedProduct(product)
        setIsDrawerOpen(true)
    }

    const handleApprove = async () => {
        if (!selectedProduct) return
        const id = selectedProduct.id
        try {
            setActionLoading(id)
            const c = await getAuthedClient()
            await c.patch(`/market/products/${id}/approval`, { status: "approved" })
            setProducts((prev) => prev.filter((p) => p.id !== id))
            toast.success("Product approved successfully")
            setIsDrawerOpen(false)
            setSelectedProduct(null)
        } catch (e) { 
            console.error(e)
            toast.error("Failed to approve product")
        } finally { 
            setActionLoading(null) 
        }
    }

    const handleRejectClick = () => {
        setRejectReason("")
        setIsRejectDialogOpen(true)
    }

    const confirmReject = async () => {
        if (!selectedProduct) return
        const id = selectedProduct.id
        try {
            setActionLoading(id)
            const c = await getAuthedClient()
            await c.patch(`/market/products/${id}/approval`, { 
                status: "rejected", 
                reason: rejectReason.trim() || undefined 
            })
            setProducts((prev) => prev.filter((p) => p.id !== id))
            toast.success("Product rejected")
            setIsRejectDialogOpen(false)
            setIsDrawerOpen(false)
            setSelectedProduct(null)
        } catch (e) { 
            console.error(e) 
            toast.error("Failed to reject product")
        } finally { 
            setActionLoading(null) 
        }
    }

    return (
        <div className="space-y-6">
            <SectionHeader title="Product Approvals" subtitle={`${products.length} pending review`} />
            
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="size-10 animate-spin text-brand-purple" />
                    <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground animate-pulse">
                        Loading products...
                    </p>
                </div>
            ) : products.length === 0 ? (
                <Card className="border-2 border-dashed border-border/50 bg-muted/10 rounded-[2rem] py-20">
                    <div className="flex flex-col items-center justify-center text-center px-6">
                        <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4">
                            <CheckCircle className="w-8 h-8 text-muted-foreground opacity-50" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">All Caught Up!</h3>
                        <p className="text-muted-foreground max-w-sm">
                            There are no products pending approval at the moment.
                        </p>
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => {
                        const productType = product.metadata?.productType || product.productType || "physical";

                        return (
                            <Card key={product.id} className="group overflow-hidden rounded-[1.5rem] border-border/40 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col">
                                <div className="aspect-[4/3] relative bg-muted/20 flex flex-col items-center justify-center overflow-hidden border-b border-border/20 p-4">
                                    {product.image ? (
                                        <Image 
                                            src={product.image} 
                                            alt={product.name} 
                                            fill 
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <Package className="size-12 text-muted-foreground/30" />
                                    )}
                                    <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                                        <Badge className="font-bold text-[10px] uppercase tracking-wider bg-black/60 text-white backdrop-blur-md border-none">
                                            {productType}
                                        </Badge>
                                    </div>
                                </div>
                                <CardContent className="p-5 flex flex-col flex-1">
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                        <h3 className="font-bold text-lg leading-tight line-clamp-1 group-hover:text-brand-purple transition-colors">
                                            {product.name}
                                        </h3>
                                    </div>
                                    
                                    <p className="text-xs text-muted-foreground font-medium mb-3">
                                        by @{product.creator?.username || "unknown"}
                                    </p>

                                    <p className="text-sm text-foreground/80 line-clamp-2 min-h-[2.5rem] mb-4">
                                        {product.description || <span className="italic opacity-50">No description provided.</span>}
                                    </p>

                                    <div className="grid grid-cols-2 gap-2 mb-5 py-3 border-t border-b border-border/30">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Price</span>
                                            <span className="font-black text-brand-orange">{fmtCurrency(product.price)}</span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Stock</span>
                                            <span className="font-bold text-foreground">{product.stock}</span>
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-2">
                                        <Button 
                                            onClick={() => handleViewDetails(product)}
                                            className="w-full bg-brand-purple/10 text-brand-purple hover:bg-brand-purple/20 font-bold group-hover:bg-brand-purple group-hover:text-white transition-colors"
                                        >
                                            View Details <ArrowRight className="ml-2 size-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}

            <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <SheetContent className="w-full sm:max-w-md border-l-0 shadow-2xl p-0 flex flex-col h-full overflow-hidden bg-background">
                    <SheetTitle>
                      <VisuallyHidden>Product Details</VisuallyHidden>
                    </SheetTitle>
                    {selectedProduct && (() => {
                        const metadata = (selectedProduct.metadata || {}) as { productType?: string; category?: string; [key: string]: unknown };
                        const productType: string = metadata.productType || selectedProduct.productType || "physical";
                        
                        return (
                            <>
                                <div className="relative h-64 bg-muted/20 border-b border-border/20 flex-shrink-0 flex items-center justify-center p-6 overflow-hidden">
                                    {selectedProduct.image ? (
                                        <Image 
                                            src={selectedProduct.image} 
                                            alt={selectedProduct.name} 
                                            fill 
                                            className="object-contain p-4"
                                        />
                                    ) : (
                                        <Package className="size-24 text-muted-foreground/20" />
                                    )}
                                    <Badge className="absolute top-4 left-4 bg-amber-500/10 text-amber-600 border-amber-500/20 font-bold uppercase tracking-wider text-[10px]">
                                        Pending Review
                                    </Badge>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-widest">
                                                {productType}
                                            </Badge>
                                            {metadata.category && (
                                                <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-widest bg-muted/50">
                                                    {metadata.category}
                                                </Badge>
                                            )}
                                        </div>
                                        <h2 className="text-2xl font-black text-foreground mb-1">{selectedProduct.name}</h2>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Created by <span className="text-brand-purple font-bold">@{selectedProduct.creator?.username}</span>
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-muted/30 rounded-2xl p-4 border border-border/30">
                                            <span className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Price</span>
                                            <span className="block text-xl font-black text-brand-orange">{fmtCurrency(selectedProduct.price)}</span>
                                        </div>
                                        <div className="bg-muted/30 rounded-2xl p-4 border border-border/30">
                                            <span className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Stock</span>
                                            <span className="block text-xl font-black text-foreground">{selectedProduct.stock}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Description</h3>
                                        <p className="text-sm text-foreground/80 leading-relaxed bg-muted/10 p-4 rounded-2xl border border-border/20 whitespace-pre-wrap">
                                            {selectedProduct.description || <span className="italic opacity-50">No description provided by the creator.</span>}
                                        </p>
                                    </div>

                                    {productType === "digital" && !!metadata.fileUrl && (
                                        <div>
                                            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Digital Asset</h3>
                                            <a 
                                                href={metadata.fileUrl as string} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center text-sm font-bold text-brand-purple hover:underline bg-brand-purple/5 px-4 py-2 rounded-xl border border-brand-purple/10"
                                            >
                                                View Attached File <ArrowRight className="ml-2 size-3" />
                                            </a>
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 bg-background border-t border-border/40 flex items-center gap-3">
                                    <Button 
                                        variant="outline" 
                                        className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 h-12 rounded-xl font-bold"
                                        onClick={handleRejectClick}
                                        disabled={actionLoading === selectedProduct.id}
                                    >
                                        <XCircle className="mr-2 size-4" /> Reject
                                    </Button>
                                    <Button 
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white h-12 rounded-xl font-bold shadow-lg shadow-green-600/20"
                                        onClick={handleApprove}
                                        disabled={actionLoading === selectedProduct.id}
                                    >
                                        {actionLoading === selectedProduct.id ? (
                                            <Loader2 className="mr-2 size-4 animate-spin" />
                                        ) : (
                                            <CheckCircle className="mr-2 size-4" />
                                        )}
                                        Approve Product
                                    </Button>
                                </div>
                            </>
                        )
                    })()}
                </SheetContent>
            </Sheet>

            <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                <DialogContent className="sm:max-w-md rounded-[2rem] border-border/40 shadow-xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black text-red-600">Reject Product</DialogTitle>
                        <DialogDescription className="font-medium">
                            Are you sure you want to reject <span className="font-bold text-foreground">&quot;{selectedProduct?.name}&quot;</span>?
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="py-4">
                        <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                            Reason for Rejection (Optional)
                        </label>
                        <Textarea 
                            placeholder="Explain why this product is being rejected to help the creator fix issues..."
                            className="min-h-[120px] resize-none rounded-xl bg-muted/20 border-border/50 focus:border-red-500/50 focus:ring-red-500/20"
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                        />
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button 
                            variant="ghost" 
                            onClick={() => setIsRejectDialogOpen(false)}
                            className="rounded-xl font-bold"
                        >
                            Cancel
                        </Button>
                        <Button 
                            variant="destructive" 
                            onClick={confirmReject}
                            className="rounded-xl font-bold"
                            disabled={actionLoading === selectedProduct?.id}
                        >
                            {actionLoading === selectedProduct?.id ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                "Confirm Rejection"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

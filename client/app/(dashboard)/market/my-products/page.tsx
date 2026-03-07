"use client"

import React, { useState, useEffect } from "react"
import { useAuth } from "@clerk/nextjs"
import Link from "next/link"
import { ArrowLeft, Package, Loader2, Clock, CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Product } from "../types"
import { fetchMyProducts } from "../data"

const statusConfig: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
    pending: {
        icon: <Clock className="size-3.5" />,
        label: "Pending Review",
        color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-0",
    },
    approved: {
        icon: <CheckCircle2 className="size-3.5" />,
        label: "Approved",
        color: "bg-green-500/10 text-green-600 dark:text-green-400 border-0",
    },
    rejected: {
        icon: <XCircle className="size-3.5" />,
        label: "Rejected",
        color: "bg-red-500/10 text-red-600 dark:text-red-400 border-0",
    },
}

export default function MyProductsPage() {
    const { getToken } = useAuth()
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            try {
                setLoading(true)
                const list = await fetchMyProducts(getToken)
                setProducts(list)
            } catch (err) {
                console.error("Failed to load my products:", err)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [getToken])

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="size-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="flex h-full w-full flex-col overflow-hidden bg-background">
            {/* ── Header ── */}
            <div className="shrink-0 border-b border-border bg-background px-4 py-4 space-y-2">
                <div className="flex items-center gap-3">
                    <Link href="/market">
                        <Button variant="ghost" size="icon" className="size-8">
                            <ArrowLeft className="size-4" />
                        </Button>
                    </Link>
                    <Package className="size-5 text-muted-foreground" />
                    <h1 className="text-base font-bold text-foreground">My Listed Items</h1>
                    <Badge variant="secondary" className="text-[10px]">
                        {products.length} item{products.length !== 1 ? "s" : ""}
                    </Badge>
                </div>
            </div>

            {/* ── Product List ── */}
            <div className="min-h-0 flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                {products.length > 0 ? (
                    products.map((product) => {
                        const status = statusConfig[product.approval || "pending"]
                        return (
                            <Card key={product.id} className="overflow-hidden transition-all hover:shadow-md hover:border-primary/20">
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <Badge className={`text-[10px] gap-1 ${status.color}`}>
                                                    {status.icon}
                                                    {status.label}
                                                </Badge>
                                            </div>
                                            <h3 className="text-sm font-bold text-foreground line-clamp-1">
                                                {product.name}
                                            </h3>
                                            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                                                {product.description || "No description"}
                                            </p>
                                            <div className="flex items-center gap-4 mt-2">
                                                <span className="text-sm font-bold text-foreground">
                                                    ₹{product.price.toLocaleString()}
                                                </span>
                                                <span className={`text-xs ${product.inStock ? "text-green-600 dark:text-green-400" : "text-red-500"}`}>
                                                    {product.inStock ? "In Stock" : "Out of Stock"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                        <Package className="size-10 mb-3 opacity-40" />
                        <p className="text-sm font-medium">No products listed yet</p>
                        <p className="text-xs mt-1">Go to the market to list an item</p>
                        <Link href="/market" className="mt-3">
                            <Button size="sm">Go to Market</Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}

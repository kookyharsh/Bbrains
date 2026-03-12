"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import {
    ArrowLeft, ShieldCheck, Loader2, Check, X, Package, User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Product } from "../types"
import { fetchPendingProducts, approveRejectProduct } from "../data"
import { dashboardApi, type User as ApiUser } from "@/lib/api-services"

interface PendingProduct extends Product {
    creatorName: string
}

export default function ApprovalsPage() {
    const [user, setUser] = useState<ApiUser | null>(null)
    const [products, setProducts] = useState<PendingProduct[]>([])
    const [loading, setLoading] = useState(true)
    const [loadingAuth, setLoadingAuth] = useState(true)
    const [processing, setProcessing] = useState<string | null>(null)

    useEffect(() => {
        async function loadUser() {
            try {
                const res = await dashboardApi.getUser()
                if (res.success && res.data) {
                    setUser(res.data)
                }
            } catch (err) {
                console.error("Failed to load user:", err)
            } finally {
                setLoadingAuth(false)
            }
        }
        loadUser()
    }, [])

    const userRole = user?.role ?? "student"
    const hasAccess = userRole === "admin" || userRole === "teacher"

    useEffect(() => {
        if (loadingAuth || !hasAccess) {
            if (!loadingAuth) setLoading(false)
            return
        }
        async function load() {
            try {
                setLoading(true)
                const list = await fetchPendingProducts()
                setProducts(list)
            } catch (err) {
                console.error("Failed to load pending products:", err)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [hasAccess, loadingAuth])

    async function handleDecision(productId: string, status: "approved" | "rejected") {
        try {
            setProcessing(productId)
            await approveRejectProduct(productId, status)
            setProducts((prev) => prev.filter((p) => p.id !== productId))
        } catch (err) {
            console.error(`Failed to ${status} product:`, err)
        } finally {
            setProcessing(null)
        }
    }

    if (loadingAuth || loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="size-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!hasAccess) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
                <ShieldCheck className="size-10 opacity-40" />
                <p className="text-sm font-medium">Access Denied</p>
                <p className="text-xs">Only teachers and admins can access this page.</p>
                <Link href="/market">
                    <Button size="sm" variant="outline">Back to Market</Button>
                </Link>
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
                    <ShieldCheck className="size-5 text-muted-foreground" />
                    <h1 className="text-base font-bold text-foreground">Product Approvals</h1>
                    <Badge variant="secondary" className="text-[10px]">
                        {products.length} pending
                    </Badge>
                </div>
            </div>

            {/* ── Pending List ── */}
            <div className="min-h-0 flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                {products.length > 0 ? (
                    products.map((product) => {
                        const isProcessing = processing === product.id
                        return (
                            <Card key={product.id} className="overflow-hidden transition-all hover:shadow-md">
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
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
                                                <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                                    <User className="size-3" />
                                                    {product.creatorName}
                                                </span>
                                            </div>
                                        </div>

                                        {/* ── Action buttons ── */}
                                        <div className="flex items-center gap-2 shrink-0">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                                                disabled={isProcessing}
                                                onClick={() => handleDecision(product.id, "rejected")}
                                            >
                                                {isProcessing ? (
                                                    <Loader2 className="size-3.5 animate-spin" />
                                                ) : (
                                                    <X className="size-3.5" />
                                                )}
                                                Reject
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="gap-1.5"
                                                disabled={isProcessing}
                                                onClick={() => handleDecision(product.id, "approved")}
                                            >
                                                {isProcessing ? (
                                                    <Loader2 className="size-3.5 animate-spin" />
                                                ) : (
                                                    <Check className="size-3.5" />
                                                )}
                                                Approve
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                        <Package className="size-10 mb-3 opacity-40" />
                        <p className="text-sm font-medium">No pending items</p>
                        <p className="text-xs mt-1">All products have been reviewed</p>
                    </div>
                )}
            </div>
        </div>
    )
}

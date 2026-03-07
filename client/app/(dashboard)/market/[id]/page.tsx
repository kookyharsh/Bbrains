"use client"

import React, { useState, useMemo } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import {
    ArrowLeft,
    ShoppingCart,
    Star,
    Truck,
    Shield,
    RotateCcw,
    Minus,
    Plus,
    Heart,
    Share2,
    Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Product {
    id: string
    name: string
    description: string
    longDescription: string
    price: number
    originalPrice?: number
    rating: number
    reviews: number
    image: string
    category: string
    inStock: boolean
    badge?: string
    features: string[]
    specifications: Record<string, string>
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const PRODUCTS_DB: Record<string, Product> = {
    "1": {
        id: "1",
        name: "Smart Notebook – Reusable & Cloud-Synced",
        description: "Write, scan, and sync your notes to the cloud. Reusable pages with included microfiber cloth.",
        longDescription:
            "The Smart Notebook revolutionizes how you take notes. Write with any pen from the Pilot Frixion line, then scan your pages with the companion app to send them to Google Drive, Dropbox, Evernote, iCloud, Slack, and more. When you're done, simply wipe the pages clean with a damp cloth and start fresh. The notebook comes with 36 reusable pages, a Pilot Frixion pen, and a microfiber cloth. Built with synthetic polypropylene pages that feel just like paper, this notebook is designed to last year after year, reducing paper waste and keeping your notes organized in the cloud.",
        price: 899,
        originalPrice: 1499,
        rating: 4.5,
        reviews: 234,
        image: "/placeholder-notebook.jpg",
        category: "Stationery",
        inStock: true,
        badge: "Best Seller",
        features: [
            "36 reusable dot-grid pages",
            "Cloud sync with 7+ platforms",
            "Included Pilot Frixion pen",
            "Microfiber cleaning cloth",
            "Water-resistant synthetic pages",
            "Executive size (6\" x 8.8\")",
        ],
        specifications: {
            "Brand": "Rocketbook",
            "Pages": "36 reusable",
            "Dimensions": "6 × 8.8 inches",
            "Weight": "250 g",
            "Material": "Synthetic polypropylene",
            "Compatibility": "iOS & Android app",
        },
    },
    "2": {
        id: "2",
        name: "Wireless Noise-Cancelling Earbuds",
        description: "Premium ANC earbuds with 30-hour battery life.",
        longDescription:
            "Experience immersive audio with our premium wireless earbuds featuring Active Noise Cancellation technology. With up to 30 hours of total battery life (8 hours per charge + charging case), these earbuds are perfect for long study sessions, commutes, and workouts. The adaptive ANC adjusts to your environment, while the transparency mode lets you stay aware of your surroundings when needed. Featuring Bluetooth 5.3 for stable connections, touch controls for easy operation, and IPX5 water resistance for worry-free use during workouts or rainy days.",
        price: 2499,
        originalPrice: 3999,
        rating: 4.7,
        reviews: 512,
        image: "/placeholder-earbuds.jpg",
        category: "Electronics",
        inStock: true,
        badge: "Top Rated",
        features: [
            "Active Noise Cancellation (ANC)",
            "30-hour total battery life",
            "Bluetooth 5.3 connectivity",
            "IPX5 water resistance",
            "Touch controls & voice assistant",
            "Wireless charging case included",
        ],
        specifications: {
            "Brand": "SoundPro",
            "Driver Size": "11mm dynamic",
            "Battery": "8h (earbuds) + 22h (case)",
            "Charging": "USB-C & Wireless Qi",
            "Weight": "5.2 g per earbud",
            "Bluetooth": "5.3 with multipoint",
        },
    },
    "3": {
        id: "3",
        name: "Scientific Calculator FX-991EX",
        description: "Advanced scientific calculator with spreadsheet functionality. 552 functions.",
        longDescription:
            "The FX-991EX is the ultimate companion for engineering and science students. With 552 built-in functions including spreadsheet capabilities, matrix calculations, vector arithmetic, and complex number operations, this calculator handles everything from basic algebra to advanced calculus. The natural textbook display shows expressions exactly as they appear in your textbook, making it easy to verify your work. Solar-powered with battery backup ensures reliable performance during exams.",
        price: 1350,
        rating: 4.3,
        reviews: 189,
        image: "/placeholder-calculator.jpg",
        category: "Electronics",
        inStock: true,
        features: [
            "552 built-in functions",
            "Spreadsheet calculations",
            "Natural textbook display",
            "Solar + battery power",
            "QR code link for visualization",
            "Exam-approved in most universities",
        ],
        specifications: {
            "Brand": "Casio",
            "Functions": "552",
            "Display": "Natural V.P.A.M.",
            "Power": "Solar + LR44 battery",
            "Dimensions": "161.5 × 77 × 11.1 mm",
            "Weight": "90 g",
        },
    },
    "4": {
        id: "4",
        name: "Ergonomic Laptop Stand – Adjustable Aluminium",
        description: "6 adjustable height levels. Lightweight and portable.",
        longDescription:
            "Upgrade your workspace with our premium aluminium laptop stand. Featuring 6 adjustable height levels, it raises your screen to eye level to reduce neck and back strain during long study sessions. The ventilated design improves airflow, preventing your laptop from overheating. Made of aircraft-grade aluminium, it's incredibly sturdy yet lightweight enough to carry to the library or coffee shop. Compatible with all laptops from 10 to 17 inches. The stand folds flat to just 4mm for easy portability.",
        price: 1199,
        originalPrice: 1799,
        rating: 4.6,
        reviews: 328,
        image: "/placeholder-stand.jpg",
        category: "Accessories",
        inStock: true,
        features: [
            "6 adjustable height levels",
            "Aircraft-grade aluminium",
            "Compatible with 10–17\" laptops",
            "Ventilated for better cooling",
            "Folds to 4mm flat",
            "Anti-slip silicone pads",
        ],
        specifications: {
            "Material": "Aluminium alloy",
            "Compatibility": "10–17 inch laptops",
            "Max Load": "20 kg",
            "Folded Thickness": "4 mm",
            "Weight": "260 g",
            "Color": "Space Grey",
        },
    },
    "5": {
        id: "5",
        name: "Premium Pen Set – 12 Gel Ink Pens",
        description: "Ultra-smooth 0.5mm gel ink pens in 12 vibrant colors.",
        longDescription:
            "Elevate your note-taking with our premium set of 12 gel ink pens. Each pen features ultra-smooth 0.5mm tips that glide effortlessly across paper, delivering consistent, vibrant lines every time. The quick-drying ink formula prevents smudging — perfect for left-handed writers too. The comfortable rubber grip reduces hand fatigue during extended writing sessions, and the transparent barrel lets you see how much ink remains. Ideal for color-coding notes, bullet journaling, and creative projects.",
        price: 349,
        originalPrice: 499,
        rating: 4.2,
        reviews: 756,
        image: "/placeholder-pens.jpg",
        category: "Stationery",
        inStock: true,
        features: [
            "12 vibrant gel ink colors",
            "0.5mm ultra-smooth tips",
            "Quick-drying, smudge-free ink",
            "Comfortable rubber grip",
            "Transparent ink-level barrel",
            "Clip-on caps, pocket-friendly",
        ],
        specifications: {
            "Tip Size": "0.5 mm",
            "Ink Type": "Gel-based",
            "Colors": "12 assorted",
            "Barrel": "Transparent ABS plastic",
            "Length": "15 cm per pen",
            "Weight": "12 g per pen",
        },
    },
    "6": {
        id: "6",
        name: "USB-C Hub – 7-in-1 Docking Station",
        description: "HDMI 4K, USB 3.0, SD/TF card reader, PD 100W charging.",
        longDescription:
            "Transform your laptop into a complete workstation with this compact 7-in-1 USB-C hub. Connect an external 4K HDMI display for presentations, transfer files at lightning speed with USB 3.0 ports, read SD and TF cards for photography projects, and charge your laptop at up to 100W with USB-C Power Delivery pass-through. The aluminium shell dissipates heat efficiently, while the braided cable ensures durability. Works with all USB-C enabled laptops, tablets, and phones.",
        price: 1899,
        originalPrice: 2599,
        rating: 4.4,
        reviews: 145,
        image: "/placeholder-hub.jpg",
        category: "Electronics",
        inStock: false,
        features: [
            "HDMI 4K@60Hz output",
            "2× USB 3.0 data ports",
            "SD & TF card reader",
            "100W USB-C PD pass-through",
            "Aluminium heat-dissipating shell",
            "Braided nylon cable",
        ],
        specifications: {
            "Ports": "7 (HDMI, 2×USB-A, USB-C PD, SD, TF, USB-C data)",
            "HDMI Output": "4K@60Hz",
            "USB-A Speed": "5 Gbps",
            "PD Charging": "Up to 100W",
            "Cable Length": "15 cm braided",
            "Weight": "55 g",
        },
    },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
    const iconSize = size === "md" ? "size-4" : "size-3.5"
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`${iconSize} ${star <= Math.floor(rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : star <= rating
                                ? "fill-yellow-400/50 text-yellow-400"
                                : "fill-muted text-muted"
                        }`}
                />
            ))}
        </div>
    )
}

// ─── Product Detail Page ──────────────────────────────────────────────────────

export default function ProductDetailPage() {
    const params = useParams()
    const productId = params.id as string
    const product = PRODUCTS_DB[productId]
    const [quantity, setQuantity] = useState(1)
    const [isWishlisted, setIsWishlisted] = useState(false)

    const discountPercent = product?.originalPrice
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : null

    if (!product) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="text-center">
                    <ShoppingCart className="mx-auto size-12 text-muted-foreground/30 mb-4" />
                    <h2 className="text-lg font-bold text-foreground">Product not found</h2>
                    <p className="text-sm text-muted-foreground mt-1">The product you are looking for doesn't exist.</p>
                    <Link href="/market">
                        <Button variant="outline" className="mt-4 gap-1.5">
                            <ArrowLeft className="size-4" />
                            Back to Market
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-full w-full flex-col overflow-hidden bg-background">
            {/* ── Breadcrumb Header ── */}
            <div className="shrink-0 flex items-center gap-2 border-b border-border bg-background px-4 py-3">
                <Link href="/market">
                    <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="size-4" />
                        Back to Market
                    </Button>
                </Link>
                <span className="text-muted-foreground">/</span>
                <span className="text-sm text-muted-foreground">{product.category}</span>
                <span className="text-muted-foreground">/</span>
                <span className="text-sm font-medium text-foreground truncate">{product.name}</span>
            </div>

            {/* ── Content ── */}
            <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                <div className="mx-auto max-w-5xl p-4 lg:p-8">
                    <div className="grid gap-8 lg:grid-cols-2">

                        {/* ── Left: Product Image ── */}
                        <div className="space-y-4">
                            <Card className="relative overflow-hidden aspect-square">
                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/30">
                                    <ShoppingCart className="size-24 text-muted-foreground/15" />
                                </div>
                                {product.badge && (
                                    <Badge className="absolute top-3 left-3 shadow-sm">
                                        {product.badge}
                                    </Badge>
                                )}
                                {!product.inStock && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm">
                                        <span className="text-lg font-bold text-destructive">Out of Stock</span>
                                    </div>
                                )}
                            </Card>
                            {/* Thumbnail strip placeholder */}
                            <div className="flex gap-2">
                                {[1, 2, 3, 4].map((i) => (
                                    <Card
                                        key={i}
                                        className={`h-16 w-16 shrink-0 cursor-pointer overflow-hidden border-2 transition-colors ${i === 1 ? "border-primary" : "border-transparent hover:border-primary/30"
                                            }`}
                                    >
                                        <div className="flex h-full w-full items-center justify-center bg-muted/50">
                                            <ShoppingCart className="size-5 text-muted-foreground/20" />
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        {/* ── Right: Product Info ── */}
                        <div className="space-y-5">
                            <div>
                                <Badge variant="secondary" className="mb-2 text-[10px]">
                                    {product.category}
                                </Badge>
                                <h1 className="text-xl font-bold text-foreground lg:text-2xl">{product.name}</h1>
                                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{product.description}</p>
                            </div>

                            {/* Rating */}
                            <div className="flex items-center gap-3">
                                <StarRating rating={product.rating} size="md" />
                                <span className="text-sm font-medium text-foreground">{product.rating}</span>
                                <span className="text-sm text-muted-foreground">({product.reviews} reviews)</span>
                            </div>

                            <Separator />

                            {/* Price */}
                            <div className="space-y-1">
                                <div className="flex items-baseline gap-3">
                                    <span className="text-3xl font-bold text-foreground">₹{product.price.toLocaleString()}</span>
                                    {product.originalPrice && (
                                        <span className="text-base text-muted-foreground line-through">
                                            ₹{product.originalPrice.toLocaleString()}
                                        </span>
                                    )}
                                    {discountPercent && (
                                        <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                            {discountPercent}% off
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-[11px] text-muted-foreground">Inclusive of all taxes</p>
                            </div>

                            <Separator />

                            {/* Quantity Selector */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground">Quantity</label>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center rounded-lg border border-border">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 rounded-r-none"
                                            disabled={quantity <= 1}
                                            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                        >
                                            <Minus className="size-4" />
                                        </Button>
                                        <span className="flex h-9 w-12 items-center justify-center text-sm font-bold border-x border-border">
                                            {quantity}
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 rounded-l-none"
                                            disabled={quantity >= 10}
                                            onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                                        >
                                            <Plus className="size-4" />
                                        </Button>
                                    </div>
                                    <span className="text-xs text-muted-foreground">Max 10 per order</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="flex-1 gap-2"
                                    disabled={!product.inStock}
                                >
                                    <ShoppingCart className="size-4" />
                                    Add to Cart
                                </Button>
                                <Button
                                    size="lg"
                                    className="flex-1 gap-2 bg-primary"
                                    disabled={!product.inStock}
                                >
                                    Buy Now
                                </Button>
                            </div>

                            {/* Wishlist & Share */}
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="gap-1.5 text-muted-foreground hover:text-foreground"
                                    onClick={() => setIsWishlisted(!isWishlisted)}
                                >
                                    <Heart className={`size-4 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
                                    {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="gap-1.5 text-muted-foreground hover:text-foreground"
                                >
                                    <Share2 className="size-4" />
                                    Share
                                </Button>
                            </div>

                            <Separator />

                            {/* Trust Badges */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="flex flex-col items-center gap-1 rounded-lg bg-muted/50 p-3 text-center">
                                    <Truck className="size-5 text-primary" />
                                    <span className="text-[10px] font-medium text-muted-foreground">Free Delivery</span>
                                </div>
                                <div className="flex flex-col items-center gap-1 rounded-lg bg-muted/50 p-3 text-center">
                                    <Shield className="size-5 text-primary" />
                                    <span className="text-[10px] font-medium text-muted-foreground">1 Year Warranty</span>
                                </div>
                                <div className="flex flex-col items-center gap-1 rounded-lg bg-muted/50 p-3 text-center">
                                    <RotateCcw className="size-5 text-primary" />
                                    <span className="text-[10px] font-medium text-muted-foreground">7-day Return</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Detailed Description & Specs ── */}
                    <div className="mt-10 grid gap-8 lg:grid-cols-2">
                        {/* Description */}
                        <Card className="p-6">
                            <h2 className="text-lg font-bold text-foreground mb-4">About this product</h2>
                            <p className="text-sm leading-relaxed text-muted-foreground">{product.longDescription}</p>

                            <h3 className="mt-6 text-sm font-bold text-foreground mb-3">Key Features</h3>
                            <ul className="space-y-2">
                                {product.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                        <Check className="mt-0.5 size-4 shrink-0 text-green-500" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </Card>

                        {/* Specifications */}
                        <Card className="p-6">
                            <h2 className="text-lg font-bold text-foreground mb-4">Specifications</h2>
                            <div className="space-y-0 divide-y divide-border">
                                {Object.entries(product.specifications).map(([key, value]) => (
                                    <div key={key} className="flex justify-between py-3">
                                        <span className="text-sm font-medium text-muted-foreground">{key}</span>
                                        <span className="text-sm font-semibold text-foreground">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}

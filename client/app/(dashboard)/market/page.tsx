"use client"

import React from "react"
import { MarketFilters } from "./_components/MarketFilters"
import { ProductCard } from "./_components/ProductCard"

const products = [
    {
        id: "1",
        title: "Introduction to Algorithms, 3rd Edition",
        price: 45.00,
        seller: "Sarah M.",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC6fPxgPNewx_j0se2hVIRETFzWipiJXu-0lOTqwa19G3xBqLYHL3EEbeKOssZ5VZxQ4Bgt2lxkLQzj4u0udENcEnV6ZB7q_HcC_NZinW7UKRjdjI3uhsUDvLaSbTqb6LHa6s7BRyi413l6goe6wF7c2nl88pEiPBOb_M_BknuTS7Xejl9XC5qam0My4VzzG82spi4GK0cZHz4yx-LD1qUGeOIob6wMKw6pDBZ-98BF4mKPXRpKrPMVRWyPFCteFZKPEK7kU4f7qPf0",
        condition: undefined,
        isFavorite: false,
    },
    {
        id: "2",
        title: "Sony WH-1000XM4 Noise Canceling Headphones",
        price: 180.00,
        seller: "James T.",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCPmGm-2OUqxd_kzFFrs1_oHVChPnZX8DJWdDnNpN_J0lGWIFwlEDiIZ-dL9Wos2q5Dq4GkBraeq2LouEHrvEGQRuO3UPjN7VulZztCc2eOuacN-XJYv_WHkHRXiNsZfJDb7lbT95YHiJViFL6TMlnD5v4ZvieaI9z9Sj9sKv9nlKah-MejJJU-D0qsbm8JbrgKDvsJNh0W1l4tW_BeeLxcNyqhgqMNgaRfz9NMmz4X6GivQSdggSUrfGs8ySoc4S-Ju5f7CARfdw7Q",
        condition: "Almost New",
        isFavorite: true,
    },
    {
        id: "3",
        title: "Adjustable LED Desk Lamp with USB Port",
        price: 15.00,
        seller: "Emily R.",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAIANaJqvHDFJ4MqHRHSqnC7AjGDWr9SnLrBkws306LWzsa5fiwq8-YLgFsuGxUaLlY0UXZanD926Wl4ldHd34KWlGs0G47liU8VpDhzEUTxpa7342bd_WV_S65PwptSmtD3tDUipNKVq1s8m42tPsi_SDuz2zYCCxyfBK3WaXNENmIVb_8EMTPr2KBpOuMgmhPjqdMqpuTZwLJKsiCVIvBzjnxP52v1zcxoRwbqhNr8ads6GmNxZQsY3QX0HxnJcF0-P8eaRzKgf5J",
        condition: undefined,
        isFavorite: false,
    },
    {
        id: "4",
        title: "City Commuter Bicycle - 26\"",
        price: 85.00,
        seller: "David K.",
        image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=400", // Fallback since icons are not available directly
        condition: "Used",
        isFavorite: false,
    }
]

export default function MarketPage() {
    return (
        <div className="flex h-full w-full flex-col overflow-hidden bg-background">
            <div className="shrink-0 px-4 pb-3 pt-4 md:px-6">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Campus Market</h1>
                <p className="mt-1 text-sm text-muted-foreground">Buy and sell student essentials.</p>
            </div>

            <div className="flex-1 overflow-y-auto border-t border-border/60 px-4 pb-6 pt-4 md:px-6 custom-scrollbar">
                <MarketFilters />

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {products.map((product) => (
                        <ProductCard
                            key={product.id}
                            title={product.title}
                            price={product.price}
                            seller={product.seller}
                            image={product.image}
                            condition={product.condition}
                            isFavorite={product.isFavorite}
                        />
                    ))}
                </div>
                    </div>
        </div>
    )
}

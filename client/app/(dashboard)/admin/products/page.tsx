"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { ProductsClient } from "@/app/(dashboard)/admin/products/ProductsClient";
import { fetchProducts } from "@/app/(dashboard)/admin/products/data";
import type { ApiProduct } from "@/app/(dashboard)/admin/products/_types";

export default function ProductsPage() {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const data = await fetchProducts();
        if (mounted) setProducts(data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="size-6 animate-spin text-muted-foreground/50" />
      </div>
    );
  }

  return <ProductsClient initialProducts={products} />;
}

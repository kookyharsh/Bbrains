import type { ApiProduct } from "@/lib/types/api";
export type { ApiProduct };

export interface ProductFormData {
    name: string;
    description: string;
    price: string;
    stock: string;
    imageUrl: string;
}

export function fmtCurrency(n: number | string): string {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(Number(n));
}

export function initForm(product?: ApiProduct): ProductFormData {
    return {
        name: product?.name ?? "",
        description: product?.description ?? "",
        price: product ? String(product.price) : "",
        stock: product ? String(product.stock) : "",
        imageUrl: product?.image ?? "",
    };
}

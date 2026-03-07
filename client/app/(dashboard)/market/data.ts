import { getAuthedClient } from "@/lib/http"
import type { ApiProduct, Product } from "./types"

export function mapApiProduct(p: ApiProduct): Product {
  return {
    id: String(p.id),
    name: p.name,
    description: p.description || "",
    price: Number(p.price),
    rating: 0,
    reviews: 0,
    image: p.image || "",
    category: "General",
    inStock: p.stock > 0,
    approval: p.approval,
  }
}

export async function fetchProducts(
  getToken: () => Promise<string | null>,
): Promise<Product[]> {
  const client = await getAuthedClient(getToken)
  const response = await client.get<{
    success: boolean
    data: ApiProduct[]
  }>("/market/products")

  if (!response.data?.success || !response.data.data) {
    throw new Error("Failed to load products")
  }

  return response.data.data.map(mapApiProduct)
}

export async function fetchMyProducts(
  getToken: () => Promise<string | null>,
): Promise<Product[]> {
  const client = await getAuthedClient(getToken)
  const response = await client.get<{
    success: boolean
    data: ApiProduct[]
  }>("/market/my-products")

  if (!response.data?.success || !response.data.data) {
    throw new Error("Failed to load your products")
  }

  return response.data.data.map(mapApiProduct)
}

export async function fetchPendingProducts(
  getToken: () => Promise<string | null>,
): Promise<(Product & { creatorName: string })[]> {
  const client = await getAuthedClient(getToken)
  const response = await client.get<{
    success: boolean
    data: ApiProduct[]
  }>("/market/pending")

  if (!response.data?.success || !response.data.data) {
    throw new Error("Failed to load pending products")
  }

  return response.data.data.map((p) => ({
    ...mapApiProduct(p),
    creatorName: p.creator?.username || "Unknown",
  }))
}

export async function approveRejectProduct(
  getToken: () => Promise<string | null>,
  productId: string,
  status: "approved" | "rejected",
): Promise<Product> {
  const client = await getAuthedClient(getToken)
  const response = await client.patch<{
    success: boolean
    data: ApiProduct
  }>(`/market/products/${productId}/approval`, { status })

  if (!response.data?.success || !response.data.data) {
    throw new Error(`Failed to ${status} product`)
  }

  return mapApiProduct(response.data.data)
}

export async function addToCart(
  getToken: () => Promise<string | null>,
  params: { productId: number; quantity: number },
) {
  const client = await getAuthedClient(getToken)
  await client.post("/market/cart", params)
}

export interface CreateProductPayload {
  name: string
  description?: string
  price: number
  stock: number
  imageUrl?: string
  category?: string
}

export async function createProduct(
  getToken: () => Promise<string | null>,
  payload: CreateProductPayload,
): Promise<Product> {
  const client = await getAuthedClient(getToken)
  const response = await client.post<{
    success: boolean
    data: ApiProduct
  }>("/market/products", payload)

  if (!response.data?.success || !response.data.data) {
    throw new Error("Failed to create product")
  }

  return mapApiProduct(response.data.data)
}

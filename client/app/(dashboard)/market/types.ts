export interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  rating: number
  reviews: number
  image: string
  category: string
  inStock: boolean
  badge?: string
  approval?: "pending" | "approved" | "rejected"
}

export interface ApiProduct {
  id: number
  creatorId: string
  name: string
  description?: string
  image?: string
  price: string | number
  stock: number
  approval?: "pending" | "approved" | "rejected"
  createdAt: string
  creator?: { id: string; username: string }
}

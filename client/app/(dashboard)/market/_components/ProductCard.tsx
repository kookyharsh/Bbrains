"use client"

import { Heart, ShoppingCart, User } from "lucide-react"

interface ProductCardProps {
  title: string
  price: number
  seller: string
  image: string
  condition?: string
  isFavorite?: boolean
}

export function ProductCard({ title, price, seller, image, condition, isFavorite }: ProductCardProps) {
  return (
    <div className="group bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
      <div className="relative h-48 bg-gray-50 dark:bg-gray-800 p-4 flex items-center justify-center overflow-hidden">
        <img
          alt={title}
          className="max-h-full object-contain mix-blend-multiply dark:mix-blend-normal rounded-lg transition-transform duration-300 group-hover:scale-105"
          src={image}
        />

        <button className="absolute top-3 right-3 w-8 h-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors">
          <Heart className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-red-500"}`} />
        </button>

        {condition && (
          <span className="absolute top-3 left-3 px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 text-[10px] font-bold rounded-md uppercase tracking-wide">
            {condition}
          </span>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 text-sm">
            {title}
          </h3>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-1">
          <User className="h-3 w-3" />
          Sold by {seller}
        </p>

        <div className="mt-auto flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            ${price.toFixed(2)}
          </span>
          <button className="w-10 h-10 bg-gray-100 dark:bg-gray-800 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black rounded-full flex items-center justify-center transition-colors">
            <ShoppingCart className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

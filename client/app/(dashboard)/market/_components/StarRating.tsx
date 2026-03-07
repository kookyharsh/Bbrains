import { Star } from "lucide-react"

interface StarRatingProps {
  rating: number
}

export function StarRating({ rating }: StarRatingProps) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`size-3.5 ${
            star <= Math.floor(rating)
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


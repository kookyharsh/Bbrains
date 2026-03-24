"use client"

import { Button } from "@/components/ui/button"
import { LOG_CATEGORIES } from "../_types"

interface CategoryFilterProps {
    selectedCategory: string
    onCategoryChange: (category: string) => void
}

export function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
    return (
        <div className="flex flex-wrap items-center gap-2">
            <div className="flex gap-1.5 flex-wrap">
                <Button
                    variant={selectedCategory === "" ? "default" : "outline"}
                    size="sm"
                    className="h-7 rounded-full text-xs"
                    onClick={() => onCategoryChange("")}
                >
                    All
                </Button>
                {LOG_CATEGORIES.map((cat) => (
                    <Button
                        key={cat}
                        variant={selectedCategory === cat ? "default" : "outline"}
                        size="sm"
                        className="h-7 rounded-full text-xs"
                        onClick={() => onCategoryChange(cat)}
                    >
                        {cat}
                    </Button>
                ))}
            </div>
        </div>
    )
}

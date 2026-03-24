"use client"

import { Loader2 } from "lucide-react"

export function LoadingState() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground animate-pulse font-medium">
                Gathering system overview...
            </p>
        </div>
    )
}

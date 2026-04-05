import * as React from "react"
import { cn } from "@/lib/utils"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const HandInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-wobbly border-2 border-hand-pencil bg-white px-4 py-2 font-patrick text-lg text-hand-pencil transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-hand-pencil/40 focus-visible:outline-none focus-visible:border-hand-blue focus-visible:ring-2 focus-visible:ring-hand-blue/20 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
HandInput.displayName = "HandInput"

export { HandInput }

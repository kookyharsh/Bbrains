import * as React from "react"
import { cn } from "@/lib/utils"

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  decoration?: "tape" | "tack" | "none"
  variant?: "default" | "yellow" | "blue" | "red"
}

const HandCard = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, decoration = "none", variant = "default", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative rounded-wobblyMd border-2 border-hand-pencil/80 shadow-[3px_3px_0px_0px_rgba(45,45,45,0.1)] transition-transform duration-200 hover:rotate-1",
          variant === "default" && "bg-white",
          variant === "yellow" && "bg-hand-yellow",
          variant === "blue" && "bg-hand-blue text-white",
          variant === "red" && "bg-hand-red text-white",
          className
        )}
        {...props}
      >
        {decoration === "tape" && (
          <div className="absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 -rotate-2 rounded bg-hand-pencil/5 backdrop-blur-sm" />
        )}
        {decoration === "tack" && (
          <div className="absolute -top-3 left-1/2 h-6 w-6 -translate-x-1/2 rounded-full border border-hand-pencil bg-hand-red shadow-sm z-10">
            <div className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-white/40" />
          </div>
        )}
        {children}
      </div>
    )
  }
)
HandCard.displayName = "HandCard"

const HandCardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  )
)
HandCardHeader.displayName = "HandCardHeader"

const HandCardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("font-kalam text-2xl font-bold leading-none tracking-tight text-hand-pencil", className)}
      {...props}
    />
  )
)
HandCardTitle.displayName = "HandCardTitle"

const HandCardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("font-patrick text-hand-pencil/70 text-lg", className)}
      {...props}
    />
  )
)
HandCardDescription.displayName = "HandCardDescription"

const HandCardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0 font-patrick text-lg", className)} {...props} />
  )
)
HandCardContent.displayName = "HandCardContent"

const HandCardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  )
)
HandCardFooter.displayName = "HandCardFooter"

export { HandCard, HandCardHeader, HandCardFooter, HandCardTitle, HandCardDescription, HandCardContent }

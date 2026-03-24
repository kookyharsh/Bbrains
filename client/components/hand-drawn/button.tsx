import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const handButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-patrick rounded-wobbly border-[3px] border-hand-pencil transition-all duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hand-blue/20 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-white text-hand-pencil shadow-hard hover:bg-hand-red hover:text-white hover:shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]",
        secondary:
          "bg-hand-muted text-hand-pencil shadow-hard hover:bg-hand-blue hover:text-white hover:shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]",
        outline:
          "bg-transparent border-hand-pencil border-[3px] text-hand-pencil shadow-hard hover:bg-hand-yellow hover:shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]",
        destructive:
          "bg-hand-red text-white shadow-hard border-hand-pencil hover:bg-hand-red/90 hover:shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]",
        ghost: "border-none shadow-none hover:bg-hand-muted/50 focus-visible:ring-0",
      },
      size: {
        default: "h-12 px-6 py-2 text-lg md:text-xl",
        sm: "h-10 px-4 text-base",
        lg: "h-14 px-8 text-xl md:text-2xl",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof handButtonVariants> {
  asChild?: boolean
}

const HandButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(handButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
HandButton.displayName = "HandButton"

export { HandButton, handButtonVariants }

"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const handLabelVariants = cva(
  "font-kalam text-xl font-bold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-hand-pencil"
)

const HandLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof handLabelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(handLabelVariants(), className)}
    {...props}
  />
))
HandLabel.displayName = LabelPrimitive.Root.displayName

export { HandLabel }

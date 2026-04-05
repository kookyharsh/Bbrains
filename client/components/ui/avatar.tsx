"use client"

import * as React from "react"
import { Avatar as AvatarPrimitive } from "radix-ui"
import { Facehash as FacehashPrimitive } from "facehash"

import { cn } from "@/lib/utils"

type AvatarContextValue = {
  name?: string
}

const AvatarContext = React.createContext<AvatarContextValue>({})

function Avatar({
  className,
  size = "default",
  name,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> & {
  size?: "default" | "sm" | "lg"
  name?: string
}) {
  return (
    <AvatarContext.Provider value={{ name }}>
      <AvatarPrimitive.Root
        data-slot="avatar"
        data-size={size}
        className={cn(
          "relative flex size-8 shrink-0 rounded-full select-none overflow-hidden",
          "after:border-border after:absolute after:inset-0 after:rounded-[inherit] after:border after:mix-blend-darken after:pointer-events-none",
          "data-[size=lg]:size-10 data-[size=sm]:size-6",
          "dark:after:mix-blend-lighten",
          className
        )}
        {...props}
      />
    </AvatarContext.Provider>
  )
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn(
        "aspect-square size-full rounded-[inherit] object-cover",
        className
      )}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  name,
  children,
  showInitials = false,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback> & {
  name?: string
  showInitials?: boolean
}) {
  const context = React.useContext(AvatarContext)
  const [rotation, setRotation] = React.useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  // Extract text content from children recursively to use as seed
  const extractText = (node: React.ReactNode): string => {
    if (typeof node === "string" || typeof node === "number") {
      return String(node)
    }
    if (Array.isArray(node)) {
      return node.map(extractText).join("")
    }
    if (React.isValidElement(node) && node.props.children) {
      return extractText(node.props.children)
    }
    return ""
  }

  const seed = (name || context.name || extractText(children) || "user").trim()

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const rotateX = (y - centerY) / 10
    const rotateY = (centerX - x) / 10

    setRotation({ x: rotateX, y: rotateY })
  }

  const handleMouseEnter = () => setIsHovered(true)
  const handleMouseLeave = () => {
    setIsHovered(false)
    setRotation({ x: 0, y: 0 })
  }

  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted text-muted-foreground relative flex size-full items-center justify-center overflow-hidden rounded-[inherit] text-sm group-data-[size=sm]/avatar:text-xs",
        className
      )}
      {...props}
    >
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="absolute inset-0 size-full flex items-center justify-center overflow-hidden [&_svg]:block [&_svg]:h-full [&_svg]:w-full"
        style={{ perspective: "1000px", transformStyle: "preserve-3d" }}
      >
        <div
          className="size-full flex items-center justify-center"
          style={{
            transform: isHovered
              ? `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale3d(1.02, 1.02, 1.02)`
              : "perspective(1000px) rotateX(0deg) rotateY(0deg)",
            transition: isHovered ? "transform 0.1s ease-out" : "transform 0.3s ease-out",
            transformStyle: "preserve-3d",
          }}
        >
          <FacehashPrimitive 
            name={seed} 
            enableBlink 
            className="block size-full"
            size={512}
            variant="gradient"
            colors={["#6cc9eeff", "#2a9d8f", "#e9c46a", "#ff9f1c", "#ff6b35", "#f7b267", "#80ced6"]} 
          />
        </div>
      </div>
      {showInitials && children && (
        <span className="relative z-10 flex items-center justify-center text-white drop-shadow-md pointer-events-none">
          {children}
        </span>
      )}
    </AvatarPrimitive.Fallback>
  )
}

function AvatarBadge({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="avatar-badge"
      className={cn(
        "bg-primary text-primary-foreground ring-background absolute right-0 bottom-0 z-10 inline-flex items-center justify-center rounded-full bg-blend-color ring-2 select-none",
        "group-data-[size=sm]/avatar:size-2 group-data-[size=sm]/avatar:[&>svg]:hidden",
        "group-data-[size=default]/avatar:size-2.5 group-data-[size=default]/avatar:[&>svg]:size-2",
        "group-data-[size=lg]/avatar:size-3 group-data-[size=lg]/avatar:[&>svg]:size-2",
        className
      )}
      {...props}
    />
  )
}

function AvatarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group"
      className={cn(
        "*:data-[slot=avatar]:ring-background group/avatar-group flex -space-x-2 *:data-[slot=avatar]:ring-2",
        className
      )}
      {...props}
    />
  )
}

function AvatarGroupCount({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group-count"
      className={cn(
        "bg-muted text-muted-foreground ring-background relative flex size-8 shrink-0 items-center justify-center rounded-full text-sm ring-2 group-has-data-[size=lg]/avatar-group:size-10 group-has-data-[size=sm]/avatar-group:size-6 [&>svg]:size-4 group-has-data-[size=lg]/avatar-group:[&>svg]:size-5 group-has-data-[size=sm]/avatar-group:[&>svg]:size-3",
        className
      )}
      {...props}
    />
  )
}

export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarBadge,
}

"use client"

import React from "react"
import { usePathname } from "next/navigation"

const TOP_LEVEL_TAB_PATHS = [
  "/dashboard",
  "/announcements",
  "/assignments",
  "/chat",
  "/wallet",
  "/calendar",
  "/market",
  "/tools",
  "/profile",
  "/results",
]

function getTabRoot(pathname: string): string {
  for (const p of TOP_LEVEL_TAB_PATHS) {
    if (p === "/dashboard") {
      if (pathname === "/dashboard" || pathname === "/") return p
    } else {
      if (pathname === p || pathname.startsWith(`${p}/`)) return p
    }
  }
  return pathname
}

interface PageTransitionProps {
  children: React.ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()

  return (
    <div key={getTabRoot(pathname)} className="page-enter-right flex min-h-0 flex-1 flex-col">
      {children}
    </div>
  )
}

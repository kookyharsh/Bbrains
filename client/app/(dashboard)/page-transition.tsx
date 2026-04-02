"use client"

import React, { useRef, useEffect, useState } from "react"
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
  const currentTab = getTabRoot(pathname)
  const prevTabRef = useRef(currentTab)
  const [animationClass, setAnimationClass] = useState("page-enter-right")
  const [displayKey, setDisplayKey] = useState(pathname)
  const [showChildren, setShowChildren] = useState(true)

  useEffect(() => {
    const prevTab = prevTabRef.current
    const nextTab = currentTab

    if (prevTab === nextTab) {
      setDisplayKey(pathname)
      setShowChildren(true)
      setAnimationClass("page-enter-right")
      return
    }

    const tabIndex = TOP_LEVEL_TAB_PATHS.indexOf(prevTab)
    const nextIndex = TOP_LEVEL_TAB_PATHS.indexOf(nextTab)
    const goingForward = nextIndex > tabIndex || nextIndex === -1

    const exitClass = goingForward ? "page-exit-right" : "page-exit-left"
    const enterClass = goingForward ? "page-enter-right" : "page-enter-left"

    setShowChildren(false)
    setAnimationClass(exitClass)

    const exitTimer = setTimeout(() => {
      prevTabRef.current = nextTab
      setDisplayKey(pathname)
      setAnimationClass(enterClass)
      setShowChildren(true)
    }, 180)

    return () => clearTimeout(exitTimer)
  }, [currentTab, pathname])

  return (
    <div className={`flex flex-col flex-1 min-h-0 ${showChildren ? animationClass : "hidden"}`}>
      {showChildren ? children : null}
    </div>
  )
}

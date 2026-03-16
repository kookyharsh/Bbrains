'use client'

import * as React from "react"
import { useThemes } from "@/components/theme-provider"
import { useEffect, useLayoutEffect } from "react"
import { useTheme as useNextTheme } from "next-themes"

interface ThemeContextProps {
  themes: ReturnType<typeof useThemes>['themes']
  userThemes: ReturnType<typeof useThemes>['userThemes']
  hasThemeAccess: ReturnType<typeof useThemes>['hasThemeAccess']
  addTheme: ReturnType<typeof useThemes>['addTheme']
  currentTheme: string | null
  setTheme: (themeId: string) => void
  isLoaded: boolean
}

const ThemeContext = React.createContext<ThemeContextProps | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { themes, userThemes, hasThemeAccess, addTheme, isLoaded: themesLoaded } = useThemes()
  const { setTheme: setNextTheme, resolvedTheme } = useNextTheme()
  const [currentTheme, setCurrentTheme] = React.useState<string | null>(null)
  const [mounted, setMounted] = React.useState(false)

  // Sync with next-themes and localStorage on mount
  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('theme-preference')
    if (savedTheme && hasThemeAccess(savedTheme)) {
      setCurrentTheme(savedTheme)
    } else {
      setCurrentTheme(resolvedTheme === 'dark' ? 'dark' : 'light')
    }
  }, [themesLoaded, hasThemeAccess, resolvedTheme])

  // Apply theme whenever it changes
  useLayoutEffect(() => {
    if (!mounted || !currentTheme) return
    
    const themeDef = themes.find(t => t.id === currentTheme)
    if (!themeDef) return
    
    const root = document.documentElement
    
    // 1. Apply CSS variables
    // First, clear any previously set inline variables from our themes
    // (Optional: if we want to be very clean, but setting new ones overrides anyway)
    
    Object.entries(themeDef.variables).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })
    
    // 2. Manage theme classes
    const currentClasses = Array.from(root.classList)
    currentClasses.forEach(cls => {
      if (cls.startsWith('theme-')) {
        root.classList.remove(cls)
      }
    })
    root.classList.add(`theme-${currentTheme}`)
    
    // 3. Sync with next-themes for dark mode logic
    // This ensures Shadcn and other libraries reacting to 'dark' class/next-themes stay in sync
    setNextTheme(themeDef.isDark ? 'dark' : 'light')
    
    // 4. Persist
    localStorage.setItem('theme-preference', currentTheme)
    
  }, [currentTheme, themes, mounted, setNextTheme])

  const setTheme = (themeId: string) => {
    if (hasThemeAccess(themeId)) {
      setCurrentTheme(themeId)
    }
  }

  const value = {
    themes,
    userThemes,
    hasThemeAccess,
    addTheme,
    currentTheme,
    setTheme,
    isLoaded: themesLoaded && mounted
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = React.useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
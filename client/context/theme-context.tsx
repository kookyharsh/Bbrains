'use client'

import * as React from "react"
import { useThemes } from "@/components/theme-provider"
import { useEffect } from "react"

interface ThemeContextProps {
  themes: ReturnType<typeof useThemes>['themes']
  userThemes: ReturnType<typeof useThemes>['userThemes']
  hasThemeAccess: ReturnType<typeof useThemes>['hasThemeAccess']
  addTheme: ReturnType<typeof useThemes>['addTheme']
  currentTheme: string | null
  setTheme: (themeId: string) => void
  isLoaded: ReturnType<typeof useThemes>['isLoaded']
}

const ThemeContext = React.createContext<ThemeContextProps | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { themes, userThemes, hasThemeAccess, addTheme, isLoaded } = useThemes()
  const [currentTheme, setCurrentTheme] = React.useState<string | null>(null)

  // Load current theme from localStorage or system preference
  useEffect(() => {
    if (!isLoaded) return
    
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme && hasThemeAccess(savedTheme)) {
      setCurrentTheme(savedTheme)
      applyTheme(savedTheme)
    } else {
      // Check system preference
      if (typeof window !== 'undefined') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        const systemTheme = prefersDark ? 'dark' : 'light'
        if (hasThemeAccess(systemTheme)) {
          setCurrentTheme(systemTheme)
          applyTheme(systemTheme)
        } else {
          // Fallback to first available theme
          const firstAvailable = themes.find(t => hasThemeAccess(t.id))
          if (firstAvailable) {
            setCurrentTheme(firstAvailable.id)
            applyTheme(firstAvailable.id)
          }
        }
      }
    }
  }, [isLoaded, hasThemeAccess, themes])

  // Apply theme when changed
  useEffect(() => {
    if (currentTheme) {
      applyTheme(currentTheme)
    }
  }, [currentTheme])

  const applyTheme = (themeId: string) => {
    const themeDef = themes.find(t => t.id === themeId)
    if (!themeDef) return
    
    // Apply CSS variables
    const root = document.documentElement
    Object.entries(themeDef.variables).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })
    
    // Add theme class
    root.className = `theme-${themeId}`
    
    // Save to localStorage
    localStorage.setItem('theme', themeId)
  }

  const setTheme = (themeId: string) => {
    if (hasThemeAccess(themeId)) {
      setCurrentTheme(themeId)
      applyTheme(themeId)
    }
  }

  const value = {
    themes,
    userThemes,
    hasThemeAccess,
    addTheme,
    currentTheme,
    setTheme,
    isLoaded
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
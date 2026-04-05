'use client'

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes"
import { useEffect, useLayoutEffect } from "react"
import { allThemes, type ThemeDefinition } from "@/themes"
import { useUser } from "@/hooks/use-user"
import { libraryApi } from "@/services/api/client"

interface User {
  id: string;
}

// Internal hook for managing theme access and data
function useThemesInternal() {
  const { user } = useUser() as { user: User | null }
  const [userThemes, setUserThemes] = React.useState<string[]>([])
  
  // Load themes from localStorage and server
  React.useEffect(() => {
    const loadThemes = async () => {
      // First load from localStorage
      if (user?.id) {
        const savedThemes = localStorage.getItem(`user-${user.id}-themes`)
        if (savedThemes) {
          try {
            setUserThemes(JSON.parse(savedThemes))
          } catch (e) {
            console.error('Failed to parse saved themes', e)
            setUserThemes(['light', 'dark'])
          }
        } else {
          setUserThemes(['light', 'dark'])
        }
        
        // Then fetch purchased themes from server
        try {
          const response = await libraryApi.getLibrary('theme', 1, 100)
          if (response.success && response.data) {
            const purchasedThemeIds = response.data.map((item) => String(item.productId))
            setUserThemes(prev => {
              const combined = [...new Set([...prev, ...purchasedThemeIds])]
              localStorage.setItem(`user-${user.id}-themes`, JSON.stringify(combined))
              return combined
            })
          }
        } catch (e) {
          console.error('Failed to fetch purchased themes', e)
        }
      }
    }
    
    loadThemes()
  }, [user?.id])
  
  const addTheme = (themeId: string) => {
    setUserThemes(prev => {
      if (!prev.includes(themeId)) {
        const newThemes = [...prev, themeId]
        if (user?.id) {
          localStorage.setItem(`user-${user.id}-themes`, JSON.stringify(newThemes))
        }
        return newThemes
      }
      return prev
    })
  }
  
  const hasThemeAccess = (themeId: string) => {
    if (allThemes.some((theme) => theme.id === themeId && theme.isBuiltIn)) return true
    return userThemes.includes(themeId)
  }
  
  return {
    themes: allThemes,
    userThemes,
    hasThemeAccess,
    addTheme,
    isLoaded: true
  }
}

interface ThemeContextProps {
  themes: ThemeDefinition[]
  userThemes: string[]
  hasThemeAccess: (themeId: string) => boolean
  addTheme: (themeId: string) => void
  currentTheme: string | null
  setTheme: (themeId: string) => void
  isLoaded: boolean
}

const ThemeContext = React.createContext<ThemeContextProps | null>(null)

export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  const { themes, userThemes, hasThemeAccess, addTheme, isLoaded: themesLoaded } = useThemesInternal()
  const { setTheme: setNextTheme, resolvedTheme } = useNextTheme()
  const [currentTheme, setCurrentTheme] = React.useState<string | null>(() => {
    if (typeof window === "undefined") return null
    return localStorage.getItem('theme-preference')
  })
  const mounted = typeof window !== "undefined"
  const effectiveTheme =
    currentTheme && hasThemeAccess(currentTheme)
      ? currentTheme
      : resolvedTheme === 'dark'
        ? 'dark'
        : 'light'

  useLayoutEffect(() => {
    if (!mounted || !effectiveTheme) return
    
    const themeDef = themes.find(t => t.id === effectiveTheme)
    if (!themeDef) return
    
    const root = document.documentElement
    
    Object.entries(themeDef.variables).forEach(([key, value]) => {
      root.style.setProperty(key, value as string)
    })
    
    const currentClasses = Array.from(root.classList)
    currentClasses.forEach(cls => {
      if (cls.startsWith('theme-')) {
        root.classList.remove(cls)
      }
    })
    root.classList.add(`theme-${currentTheme}`)
    
    setNextTheme(themeDef.isDark ? 'dark' : 'light')
    localStorage.setItem('theme-preference', effectiveTheme)
    
  }, [effectiveTheme, themes, mounted, setNextTheme])

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
    currentTheme: effectiveTheme,
    setTheme,
    isLoaded: themesLoaded && mounted
  }

  return (
    <ThemeContext.Provider value={value}>
      <NextThemesProvider {...props}>
        {children}
      </NextThemesProvider>
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

export const useThemes = useTheme;

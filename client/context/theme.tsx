'use client'

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes"
import { useEffect, useLayoutEffect } from "react"
import { allThemes, isBuiltInTheme } from "@/themes"
import { useUser } from "@/hooks/use-user"

interface User {
  id: string;
}

// Internal hook for managing theme access and data
function useThemesInternal() {
  const { user } = useUser() as { user: User | null }
  const [userThemes, setUserThemes] = React.useState<string[]>([])
  
  React.useEffect(() => {
    if (user?.id) {
      const savedThemes = localStorage.getItem(`user-${user.id}-themes`)
      if (savedThemes) {
        try {
          setUserThemes(JSON.parse(savedThemes))
        } catch (e) {
          console.error('Failed to parse saved themes', e)
          setUserThemes([])
        }
      } else {
        setUserThemes(['light', 'dark'])
      }
    }
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
    if (isBuiltInTheme(themeId as any)) return true
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
  themes: any[]
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
  const [currentTheme, setCurrentTheme] = React.useState<string | null>(null)
  const [mounted, setMounted] = React.useState(false)

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('theme-preference')
    if (savedTheme && hasThemeAccess(savedTheme)) {
      setCurrentTheme(savedTheme)
    } else {
      setCurrentTheme(resolvedTheme === 'dark' ? 'dark' : 'light')
    }
  }, [themesLoaded, hasThemeAccess, resolvedTheme])

  useLayoutEffect(() => {
    if (!mounted || !currentTheme) return
    
    const themeDef = themes.find(t => t.id === currentTheme)
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

'use client'

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { allThemes, isBuiltInTheme, getThemeById } from "@/themes"
import { useUser } from "@/hooks/use-user" // Assuming we have a user hook
import { useWallet } from "@/hooks/use-wallet" // Assuming we have a wallet hook

// Custom hook to access theme functionality
export function useThemes() {
  const { user } = useUser()
  const [userThemes, setUserThemes] = React.useState<string[]>([])
  
  React.useEffect(() => {
    if (user?.id) {
      // Load user's purchased themes from localStorage or API
      const savedThemes = localStorage.getItem(`user-${user.id}-themes`)
      if (savedThemes) {
        try {
          setUserThemes(JSON.parse(savedThemes))
        } catch (e) {
          console.error('Failed to parse saved themes', e)
          setUserThemes([])
        }
      } else {
        // Default to built-in themes only
        setUserThemes(['light', 'dark'])
      }
    }
  }, [user?.id])
  
  const saveUserThemes = (themes: string[]) => {
    if (user?.id) {
      localStorage.setItem(`user-${user.id}-themes`, JSON.stringify(themes))
      setUserThemes(themes)
    }
  }
  
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
    isLoaded: true // We'll consider it loaded once we've checked localStorage
  }
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  const { user } = useUser()
  const { wallet } = useWallet()

  return (
    <NextThemesProvider {...props}>
      {children}
    </NextThemesProvider>
  )
}
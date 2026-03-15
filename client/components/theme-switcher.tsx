'use client'

import * as React from "react"
import { useThemes } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu"
import { Moon, Sun, Palette, Droplet, PaintBrush } from "lucide-react"

export function ThemeSwitcher() {
  const { themes, userThemes, hasThemeAccess, addTheme, isLoaded } = useThemes()
  
  if (!isLoaded) {
    return <div>Loading themes...</div>
  }

  const [selectedTheme, setSelectedTheme] = React.useState<'light' | 'dark'>('light')
  
  // Set initial theme based on system preference or saved preference
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    if (savedTheme && hasThemeAccess(savedTheme)) {
      setSelectedTheme(savedTheme)
    } else if (typeof window !== 'undefined') {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const systemTheme = prefersDark ? 'dark' : 'light'
      if (hasThemeAccess(systemTheme)) {
        setSelectedTheme(systemTheme as any)
      }
    }
  }, [hasThemeAccess])

  // Apply theme when changed
  React.useEffect(() => {
    if (hasThemeAccess(selectedTheme)) {
      localStorage.setItem('theme', selectedTheme)
      // Trigger theme update through theme provider
      const themeEvent = new CustomEvent('theme-change', { 
        detail: { theme: selectedTheme } 
      })
      window.dispatchEvent(themeEvent)
    }
  }, [selectedTheme, hasThemeAccess])

  const handleThemeChange = (themeId: string) => {
    if (hasThemeAccess(themeId)) {
      setSelectedTheme(themeId as any)
    }
  }

  const handlePurchaseTheme = async (themeId: string) => {
    // TODO: Implement actual purchase flow using wallet/market system
    // For now, simulate purchase by adding theme to user's collection
    alert(`Purchasing theme: ${themeId}\nThis would integrate with your wallet system.`)
    addTheme(themeId)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Theme switcher">
          {selectedTheme === 'dark' ? <Moon /> : <Sun />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={4}>
        {/* Built-in themes section */}
        <DropdownMenuItem 
          onClick={() => handleThemeChange('light')}
          className={selectedTheme === 'light' ? 'font-medium' : ''}
        >
          <Sun className="mr-2 h-4 w-4" />
          Light
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => handleThemeChange('dark')}
          className={selectedTheme === 'dark' ? 'font-medium' : ''}
        >
          <Moon className="mr-2 h-4 w-4" />
          Dark
        </DropdownMenuItem>
        
        <DropdownMenuItem separator />
        
        {/* Purchasable themes section */}
        <DropdownMenuItem>Available Themes</DropdownMenuItem>
        <DropdownMenuItem separator />
        
        {themes
          .filter(theme => !theme.isBuiltIn)
          .map(theme => (
            <React.Fragment key={theme.id}>
              <DropdownMenuItem 
                onClick={() => {
                  if (hasThemeAccess(theme.id)) {
                    handleThemeChange(theme.id as any)
                  } else {
                    handlePurchaseTheme(theme.id)
                  }
                }}
                className={`
                  flex items-center px-2 py-1.5 text-sm
                  ${hasThemeAccess(theme.id) && selectedTheme === theme.id ? 'font-medium bg-primary/10' : ''}
                  ${!hasThemeAccess(theme.id) && !selectedTheme === theme.id ? 'text-muted-foreground' : ''}
                `}
              >
                {/* Theme indicator */}
                <div className="flex items-center mr-3">
                  <div className="h-3 w-3 rounded bg-primary/20" 
                       style={{ backgroundColor: theme.variables['--primary'] }}>
                  </div>
                  <span className="ml-2">{theme.name}</span>
                </div>
                
                {/* Lock icon for unpurchased themes */}
                {!hasThemeAccess(theme.id) && (
                  <span className="ml-auto text-xs opacity-50">
                    🔒
                  </span>
                )}
                
                {/* Check mark for selected theme */}
                {hasThemeAccess(theme.id) && selectedTheme === theme.id && (
                  <span className="ml-auto text-xs text-primary">
                    ✓
                  </span>
                )}
              </DropdownMenuItem>
              
              <DropdownMenuItem separator />
            </React.Fragment>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
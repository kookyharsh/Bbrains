'use client'

import * as React from "react"
import { useTheme } from "@/context/theme-context"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu"
import { Moon, Sun, Palette, Droplet, PaintBrush } from "lucide-react"

export function ThemeSwitcher() {
  const { themes, userThemes, hasThemeAccess, currentTheme, setTheme } = useTheme()
  
  if (!themes) {
    return <div>Loading themes...</div>
  }

  const handleThemeChange = (themeId: string) => {
    if (hasThemeAccess(themeId)) {
      setTheme(themeId)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Theme switcher">
          {currentTheme === 'dark' ? <Moon /> : <Sun />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={4}>
        {/* Built-in themes section */}
        <DropdownMenuItem 
          onClick={() => handleThemeChange('light')}
          className={currentTheme === 'light' ? 'font-medium' : ''}
        >
          <Sun className="mr-2 h-4 w-4" />
          Light
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => handleThemeChange('dark')}
          className={currentTheme === 'dark' ? 'font-medium' : ''}
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
                    handleThemeChange(theme.id)
                  } else {
                    // For now, we'll just preview - actual purchase would go to marketplace
                    alert(`To purchase "${theme.name}", please visit the Themes Marketplace in your dashboard.`)
                  }
                }}
                className={`
                  flex items-center px-2 py-1.5 text-sm
                  ${hasThemeAccess(theme.id) && currentTheme === theme.id ? 'font-medium bg-primary/10' : ''}
                  ${!hasThemeAccess(theme.id) ? 'text-muted-foreground' : ''}
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
                {hasThemeAccess(theme.id) && currentTheme === theme.id && (
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
'use client'

import * as React from "react"
import { useTheme } from "@/context/theme"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { Moon, Sun, Palette, Check, Lock } from "lucide-react"

export function ThemeSwitcher() {
  const { themes, hasThemeAccess, addTheme, currentTheme, setTheme, isLoaded } = useTheme()
  
  if (!isLoaded) {
    return (
      <Button variant="outline" size="icon" disabled>
        <Sun className="h-4 w-4 animate-pulse" />
      </Button>
    )
  }

  const handlePurchaseTheme = async (themeId: string) => {
    // TODO: Implement actual purchase flow using wallet/market system
    // For now, simulate purchase by adding theme to user's collection
    if (confirm(`Unlock ${themeId} theme?\nThis would normally cost some coins.`)) {
      addTheme(themeId)
    }
  }

  const activeThemeDef = themes.find(t => t.id === currentTheme)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          {activeThemeDef?.isDark ? (
            <Moon className="h-4 w-4 transition-all" />
          ) : (
            <Sun className="h-4 w-4 transition-all" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          System Themes
        </div>
        {themes
          .filter(t => t.isBuiltIn)
          .map(theme => (
            <DropdownMenuItem 
              key={theme.id}
              onClick={() => setTheme(theme.id)}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                {theme.id === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                <span>{theme.name}</span>
              </div>
              {currentTheme === theme.id && <Check className="h-4 w-4 text-brand-purple" />}
            </DropdownMenuItem>
          ))}
        
        <DropdownMenuSeparator />
        
        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Palette className="h-3 w-3" />
          Premium Themes
        </div>
        
        {themes
          .filter(theme => !theme.isBuiltIn)
          .map(theme => {
            const hasAccess = hasThemeAccess(theme.id)
            const isActive = currentTheme === theme.id
            
            return (
              <DropdownMenuItem 
                key={theme.id}
                onClick={() => {
                  if (hasAccess) {
                    setTheme(theme.id)
                  } else {
                    handlePurchaseTheme(theme.id)
                  }
                }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div 
                    className="h-3 w-3 rounded-full border border-border" 
                    style={{ backgroundColor: theme.variables['--primary'] }}
                  />
                  <span className={!hasAccess ? "text-muted-foreground" : ""}>{theme.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {!hasAccess && <Lock className="h-3 w-3 text-muted-foreground" />}
                  {isActive && <Check className="h-4 w-4 text-brand-purple" />}
                </div>
              </DropdownMenuItem>
            )
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

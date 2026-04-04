'use client'

import * as React from "react"
import { useTheme } from "@/context/theme"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Moon, Sun } from "lucide-react"

export function ThemeSwitcher() {
  const [mounted, setMounted] = React.useState(false)
  const { themes, hasThemeAccess, currentTheme, setTheme } = useTheme()
  
  React.useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!mounted || !themes) {
    return (
      <Button variant="outline" size="icon" aria-label="Theme switcher">
        <Sun className="opacity-0" />
      </Button>
    )
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
        
        <div className="h-px my-1 bg-muted" />
        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Available Themes</div>
        <div className="h-px my-1 bg-muted" />
        
        {themes
          .filter(theme => !theme.isBuiltIn)
          .map(theme => (
            <DropdownMenuItem 
              key={theme.id}
              onClick={() => {
                if (hasThemeAccess(theme.id)) {
                  handleThemeChange(theme.id)
                } else {
                  alert(`To purchase "${theme.name}", please visit the Themes Marketplace in your dashboard.`)
                }
              }}
              className={`
                flex items-center px-2 py-1.5 text-sm
                ${hasThemeAccess(theme.id) && currentTheme === theme.id ? 'font-medium bg-primary/10' : ''}
                ${!hasThemeAccess(theme.id) ? 'text-muted-foreground' : ''}
              `}
            >
              <div className="flex items-center mr-3">
                <div className="h-3 w-3 rounded bg-primary/20" 
                     style={{ backgroundColor: theme.variables['--primary'] }}>
                </div>
                <span className="ml-2">{theme.name}</span>
              </div>
              
              {!hasThemeAccess(theme.id) && (
                <span className="ml-auto text-xs opacity-50">🔒</span>
              )}
              
              {hasThemeAccess(theme.id) && currentTheme === theme.id && (
                <span className="ml-auto text-xs text-primary">✓</span>
              )}
            </DropdownMenuItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

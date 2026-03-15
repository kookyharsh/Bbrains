'use client'

import * as React from "react"
import { useUser } from "@/hooks/use-user"
import { useWallet } from "@/hooks/use-wallet"
import { useThemes } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckersCircle, DollarSign, Sparkles } from "lucide-react"

export default function ThemesPage() {
  const { user } = useUser()
  const { wallet } = useWallet()
  const { themes, userThemes, hasThemeAccess, addTheme } = useThemes()
  
  const [loading, setLoading] = React.useState(false)
  
  // Handle theme purchase
  const handlePurchase = async (themeId: string, price: number) => {
    if (!user?.id) {
      alert('Please log in to purchase themes')
      return
    }
    
    if (!wallet) {
      alert('Wallet not found')
      return
    }
    
    if (wallet.balance < price) {
      alert('Insufficient wallet balance')
      return
    }
    
    setLoading(true)
    try {
      // TODO: Implement actual purchase using market/buy-now endpoint
      // For now, simulate purchase by adding theme to user's collection
      await new Promise(resolve => setTimeout(resolve, 1500)) // Simulate API delay
      
      // Add theme to user's collection
      addTheme(themeId)
      
      // Deduct from wallet (in real implementation, this would happen via market API)
      // const newBalance = wallet.balance - price
      // localStorage.setItem('wallet', JSON.stringify({...wallet, balance: newBalance}))
      
      alert(`Successfully purchased theme! Your new balance would be: $${wallet.balance - price}`)
    } catch (error) {
      alert('Purchase failed. Please try again.')
      console.error('Purchase error:', error)
    } finally {
      setLoading(false)
    }
  }
  
  // Handle theme preview/application
  const handlePreview = (themeId: string) => {
    if (hasThemeAccess(themeId)) {
      // Apply theme temporarily for preview
      const themeDef = themes.find(t => t.id === themeId)
      if (themeDef) {
        const root = document.documentElement
        Object.entries(themeDef.variables).forEach(([key, value]) => {
          root.style.setProperty(key, value)
        })
        root.className = `theme-${themeId}`
      }
    }
  }
  
  // Reset theme preview
  const resetPreview = () => {
    // Reset to current theme or default
    const root = document.documentElement
    const currentTheme = localStorage.getItem('theme') || 'light'
    const themeDef = themes.find(t => t.id === currentTheme)
    if (themeDef) {
      Object.entries(themeDef.variables).forEach(([key, value]) => {
        root.style.setProperty(key, value)
      })
      root.className = `theme-${currentTheme}`
    }
  }
  
  if (!user) {
    return (
      <div className="flex h-[calc(100vh-4.5rem)] items-center justify-center">
        <div className="text-center">
          <h2 className="mb-4">Please log in to access the themes marketplace</h2>
          <Button variant="outline">Sign In</Button>
        </div>
      </div>
    )
  }
  
  if (!wallet) {
    return (
      <div className="flex h-[calc(100vh-4.5rem)] items-center justify-center">
        <div className="text-center">
          <h2 className="mb-4">Wallet not found</h2>
          <Button variant="outline">Create Wallet</Button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row items-center justify-between">
        <h1 className="text-2xl font-bold">Theme Marketplace</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            <span className="font-medium">${wallet.balance.toFixed(2)}</span>
          </div>
          <Button variant="outline" size="icon" aria-label="Refresh wallet">
            {/* Refresh icon would go here */}
          </Button>
        </div>
      </div>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {themes
          .filter(theme => !theme.isBuiltIn) // Only show purchasable themes
          .map(theme => (
            <React.Fragment key={theme.id}>
              <Card className="group hover:shadow-lg transition-shadow">
                {/* Theme Preview */}
                <div className="aspect-w-16 aspect-h-9 overflow-hidden rounded-t-lg bg-muted/50">
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    {/* Theme color preview */}
                    <div className="grid gap-2 grid-cols-3">
                      {[ 
                        theme.variables['--background'], 
                        theme.variables['--primary'], 
                        theme.variables['--secondary'] 
                      ].map((color, index) => (
                        <div 
                          key={index} 
                          className={`w-8 h-8 rounded`} 
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                
                <CardContent className="space-y-4">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{theme.name}</span>
                      <span className="text-xs font-medium px-2.5 py-0.5 rounded bg-primary/10 text-primary">
                        ${theme.price}
                      </span>
                    </CardTitle>
                    <CardDescription>{theme.description}</CardDescription>
                  </CardHeader>
                  
                  {!hasThemeAccess(theme.id) && (
                    <Button 
                      onClick={() => handlePreview(theme.id)}
                      onMouseLeave={resetPreview}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      Preview Theme
                    </Button>
                  )}
                  
                  {hasThemeAccess(theme.id) && (
                    <Button 
                      variant="default"
                      size="sm"
                      className="w-full"
                    >
                      Owned
                    </Button>
                  )}
                  
                  {!hasThemeAccess(theme.id) && (
                    <Button 
                      onClick={() => handlePurchase(theme.id, theme.price)}
                      disabled={loading}
                      variant="default"
                      size="sm"
                      className="w-full"
                    >
                      {loading ? 'Processing...' : 'Purchase Theme'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </React.Fragment>
          ))}
      </div>
      
      <div className="border-t pt-6">
        <h2 className="text-lg font-semibold mb-4">Your Theme Collection</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {userThemes
            .filter(themeId => {
              const theme = themes.find(t => t.id === themeId)
              return theme && !theme.isBuiltIn // Only show purchased themes, not built-in
            })
            .map(themeId => {
              const theme = themes.find(t => t.id === themeId)
              if (!theme) return null
              
              return (
                <div key={themeId} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0 h-10 w-10 rounded">
                    <div className="h-full w-full rounded" 
                         style={{ backgroundColor: theme.variables['--primary'] }}>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium">{theme.name}</h3>
                    <p className="text-sm text-muted-foreground">{theme.description}</p>
                  </div>
                </div>
              )
            })
            .filter(Boolean): Boolean
        }
        
        {userThemes.filter(tid => !themes.find(t => t.id === tid && !t.isBuiltIn)).length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            You haven't purchased any themes yet. Browse the marketplace above to get started!
          </p>
        )}
      </div>
    </div>
  )
}
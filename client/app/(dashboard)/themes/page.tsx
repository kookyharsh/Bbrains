'use client'

import * as React from "react"
import { useUser } from "@/hooks/use-user"
import { useWallet } from "@/features/wallet/hooks/use-wallet"
import { useTheme } from "@/context/theme"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, DollarSign, Sparkles } from "lucide-react"
import { themeApi } from "@/services/api/client"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { toast } from "sonner"

export default function ThemesPage() {
  const { user } = useUser()
  const { wallet } = useWallet()
  const { themes, userThemes, hasThemeAccess, addTheme, currentTheme, setTheme } = useTheme()
  
  const [loading, setLoading] = React.useState(false)
  const [showBuyDialog, setShowBuyDialog] = React.useState(false)
  const [selectedTheme, setSelectedTheme] = React.useState<{id: string, price: number, name: string} | null>(null)
  const [pin, setPin] = React.useState("")
  
  // Prepare theme purchase
  const handlePurchaseClick = (themeId: string, price: number, name: string) => {
    if (!user?.id) {
      toast.error('Please log in to purchase themes')
      return
    }
    
    if (!wallet) {
      toast.error('Wallet not found')
      return
    }
    
    if (wallet.balance < price) {
      toast.error('Insufficient wallet balance')
      return
    }
    
    setSelectedTheme({ id: themeId, price, name })
    setShowBuyDialog(true)
  }

  // Execute theme purchase
  const handleBuyNow = async () => {
    if (!selectedTheme) return;

    setLoading(true)
    try {
      // Find the corresponding product ID from the API to complete the purchase
      const themesResponse = await themeApi.getThemes(1, 100);
      const apiTheme = themesResponse.data?.find(
        t => t.metadata?.themeConfig?.id === selectedTheme.id || t.name === selectedTheme.name
      );

      if (!apiTheme) {
        toast.error('Theme product not found in marketplace.');
        setLoading(false);
        return;
      }

      const response = await themeApi.buyTheme(apiTheme.id, pin);
      
      if (response.success || response.status === 200 || response.status === 201) {
        // Add theme to user's collection
        addTheme(selectedTheme.id)
        toast.success(`Successfully purchased theme!`)
        setShowBuyDialog(false)
        setPin("")
      } else {
        toast.error(response.message || 'Purchase failed. Please try again.')
      }
    } catch (error: any) {
      toast.error('Purchase failed. Please try again.')
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
          root.style.setProperty(key, value as string)
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
        root.style.setProperty(key, value as string)
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
                      onClick={() => handlePurchaseClick(theme.id, theme.price, theme.name)}
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

      {/* Buy Dialog */}
      <Dialog open={showBuyDialog} onOpenChange={setShowBuyDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Purchase Theme</DialogTitle>
            <DialogDescription>
              Enter your PIN to purchase {selectedTheme?.name} for {Number(selectedTheme?.price || 0)} B-Coins
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">Wallet PIN</label>
            <InputOTP
              value={pin}
              onChange={(value) => setPin(value)}
              maxLength={6}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBuyDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleBuyNow}
              disabled={pin.length < 6 || loading}
            >
              {loading ? "Processing..." : "Confirm Purchase"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
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
            .filter(Boolean)
        }
        
       {userThemes.filter(tid => !themes.find(t => t.id === tid && !t.isBuiltIn)).length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            You haven't purchased any themes yet. Browse the marketplace above to get started!
          </p>
        )}
      </div>
    </div>
    </div>
  )
}

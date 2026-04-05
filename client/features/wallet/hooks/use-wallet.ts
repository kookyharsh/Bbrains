import { useState } from "react"

// Mock wallet hook - replace with actual wallet implementation
export interface Wallet {
  id?: string;
  balance: number;
  pinSet?: boolean;
}

const readStoredWallet = (): Wallet | null => {
  if (typeof window === "undefined") return null

  const storedWallet = localStorage.getItem('wallet')
  if (!storedWallet) return null

  try {
    return JSON.parse(storedWallet) as Wallet
  } catch (error) {
    console.error('Failed to parse wallet from localStorage', error)
    return null
  }
}

export function useWallet() {
  const [wallet, setWallet] = useState<Wallet | null>(() => readStoredWallet())
  const loading = false

  // Mock function to update wallet balance
  const updateBalance = (amount: number) => {
    if (wallet) {
      const updatedWallet = { ...wallet, balance: wallet.balance + amount }
      localStorage.setItem('wallet', JSON.stringify(updatedWallet))
      setWallet(updatedWallet)
    }
  }

  // Mock function to set wallet (for when user connects wallet)
  const setWalletData = (walletData: Wallet) => {
    localStorage.setItem('wallet', JSON.stringify(walletData))
    setWallet(walletData)
  }

  return {
    wallet,
    loading,
    updateBalance,
    setWallet: setWalletData
  }
}

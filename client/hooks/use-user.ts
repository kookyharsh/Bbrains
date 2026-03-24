import { useEffect, useState } from "react"

import { User } from "@/services/api/client"

// Mock user hook - replace with actual auth implementation
export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Replace with actual auth implementation
    // For now, check if we have a user in localStorage or from auth provider
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        console.error('Failed to parse user from localStorage', e)
      }
    }
    setLoading(false)
  }, [])

  // Mock login function for development
  const login = (userData: any) => {
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  // Mock logout function
  const logout = () => {
    localStorage.removeItem('user')
    setUser(null)
  }

  return {
    user,
    loading,
    login,
    logout
  }
}

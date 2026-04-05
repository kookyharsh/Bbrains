import { useState } from "react"

import { User } from "@/services/api/client"

const readStoredUser = (): User | null => {
  if (typeof window === "undefined") return null

  const storedUser = localStorage.getItem('user')
  if (!storedUser) return null

  try {
    return JSON.parse(storedUser) as User
  } catch (error) {
    console.error('Failed to parse user from localStorage', error)
    return null
  }
}

// Mock user hook - replace with actual auth implementation
export function useUser() {
  const [user, setUser] = useState<User | null>(() => readStoredUser())
  const loading = false

  // Mock login function for development
  const login = (userData: User) => {
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

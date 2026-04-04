import { useEffect, useState } from "react"

import { dashboardApi, User } from "@/services/api/client"

type NormalizedUser = User & { collegeId?: number }

function normalizeUser(user: User | (User & { collegeId?: number })): NormalizedUser {
  const anyUser = user as any
  return {
    ...user,
    collegeId: anyUser.collegeId ?? user.college?.id,
  }
}

export function useUser() {
  const [user, setUser] = useState<NormalizedUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const init = async () => {
      try {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser) as User
            if (mounted) setUser(normalizeUser(parsed))
          } catch (e) {
            console.error('Failed to parse user from localStorage', e)
          }
        }

        const userResp = await dashboardApi.getUser()
        if (!mounted) return

        if (userResp.success && userResp.data) {
          const normalized = normalizeUser(userResp.data)
          setUser(normalized)
          localStorage.setItem('user', JSON.stringify(normalized))
        } else {
          // If backend session is gone, clear stale local user
          localStorage.removeItem('user')
          setUser(null)
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    init()

    return () => {
      mounted = false
    }
  }, [])

  // Mock login function for development
  const login = (userData: any) => {
    const normalized = normalizeUser(userData)
    localStorage.setItem('user', JSON.stringify(normalized))
    setUser(normalized)
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

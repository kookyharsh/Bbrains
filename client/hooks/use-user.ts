import { useEffect, useState } from "react"

import { dashboardApi, User } from "@/services/api/client"

type NormalizedUser = User & { collegeId?: number }

function normalizeUser(user: User | (User & { collegeId?: number })): NormalizedUser {
  const anyUser = user as User & { collegeId?: number }
  return {
    ...user,
    collegeId: anyUser.collegeId ?? user.college?.id,
  }
}

const readStoredUser = (): NormalizedUser | null => {
  if (typeof window === "undefined") return null

  const storedUser = localStorage.getItem("user")
  if (!storedUser) return null

  try {
    return normalizeUser(JSON.parse(storedUser) as User)
  } catch (error) {
    console.error("Failed to parse user from localStorage", error)
    return null
  }
}

export function useUser() {
  const [user, setUser] = useState<NormalizedUser | null>(() => readStoredUser())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const init = async () => {
      try {
        const userResp = await dashboardApi.getUser()
        if (!mounted) return

        if (userResp.success && userResp.data) {
          const normalized = normalizeUser(userResp.data)
          setUser(normalized)
          localStorage.setItem("user", JSON.stringify(normalized))
        } else {
          localStorage.removeItem("user")
          setUser(null)
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    void init()

    return () => {
      mounted = false
    }
  }, [])

  const login = (userData: User | NormalizedUser) => {
    const normalized = normalizeUser(userData)
    localStorage.setItem("user", JSON.stringify(normalized))
    setUser(normalized)
  }

  const logout = () => {
    localStorage.removeItem("user")
    setUser(null)
  }

  return {
    user,
    loading,
    login,
    logout,
  }
}

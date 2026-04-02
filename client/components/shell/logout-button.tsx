'use client'

import { useRouter } from 'next/navigation'
import { getBaseUrl, setAuthToken } from '@/services/api/client'
import { Button } from '@/components/ui/button'

export function LogoutButton() {
  const router = useRouter()

  const logout = async () => {
    try {
      await fetch(`${getBaseUrl()}/logout`, { method: 'POST', credentials: 'include' })
    } catch (e) {
      console.error('Logout error:', e)
    }
    setAuthToken(null)
    router.push('/auth/login')
    router.refresh()
  }

  return <Button onClick={logout}>Logout</Button>
}

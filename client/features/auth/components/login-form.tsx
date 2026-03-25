'use client'

import { useRouter } from 'next/navigation'
import { useState, useCallback } from 'react'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'
import { supabase } from '@/services/supabase/client'
import { HandButton } from '@/components/hand-drawn/button'
import {
  HandCard,
  HandCardContent,
  HandCardDescription,
  HandCardHeader,
  HandCardTitle,
} from '@/components/hand-drawn/card'
import { HandInput } from '@/components/hand-drawn/input'
import { HandLabel } from '@/components/hand-drawn/label'
import Link from 'next/link'
import { validate, commonRules, hasErrors, ValidationErrors } from '@/lib/validation'

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    // Use the shared Supabase client instance

    const validationErrors = validate(
      { email, password },
      { email: commonRules.email, password: commonRules.password }
    )

    if (hasErrors(validationErrors)) {
      setErrors(validationErrors)
      return
    }

    setErrors({})
    setIsLoading(true)

    try {
      // Sign in with password and capture the session so we can reuse the token on API calls
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast.error(error.message)
        throw error
      }

      // Tokens and session are managed by the shared Supabase client via cookies
      toast.success('Login successful!')
      
      try {
        // Import dashboardApi dynamically or use a direct fetch to avoid circular deps if any
        // Assuming we can just import it at top but let's check if it needs to be imported
        const { dashboardApi } = await import('@/services/api/client')
        const userResp = await dashboardApi.getUser()
        
        if (userResp.success && userResp.data) {
          const role = userResp.data.type
          router.refresh()
          if (role === 'admin') {
            router.push('/admin/overview')
          } else if (role === 'teacher') {
            router.push('/teacher/overview')
          } else {
            router.push('/dashboard')
          }
        } else {
          // Fallback if we can't get role
          router.refresh()
          router.push('/dashboard')
        }
      } catch (err) {
        console.error("Failed to fetch user role:", err)
        router.refresh()
        router.push('/dashboard')
      }

    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrors({ form: error.message })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = useCallback((field: string, value: string) => {
    if (field === 'email') setEmail(value)
    if (field === 'password') setPassword(value)
    setErrors((prev) => ({ ...prev, [field]: undefined, form: undefined }))
  }, [])

  return (
    <div className={cn('flex flex-col gap-6 rotate-1', className)} {...props}>
      <HandCard decoration="tape">
        <HandCardHeader>
          <HandCardTitle className="text-4xl">Login</HandCardTitle>
          <HandCardDescription>Enter your email below to login to your account</HandCardDescription>
        </HandCardHeader>
        <HandCardContent>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <HandLabel htmlFor="email">Email</HandLabel>
                <HandInput
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={isLoading}
                  className={errors.email ? 'border-hand-red' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-hand-red font-patrick">{errors.email}</p>
                )}
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <HandLabel htmlFor="password">Password</HandLabel>
                  <Link
                    href="/auth/forgot-password"
                    className="ml-auto inline-block text-lg font-patrick text-hand-pencil underline-offset-4 hover:underline hover:text-hand-blue transition-colors"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <HandInput
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  disabled={isLoading}
                  className={errors.password ? 'border-hand-red' : ''}
                />
                {errors.password && (
                  <p className="text-sm text-hand-red font-patrick">{errors.password}</p>
                )}
              </div>
              {errors.form && (
                <p className="text-lg font-patrick text-hand-red bg-hand-red/10 border-2 border-hand-red border-dashed p-3 rounded-wobbly">
                  {errors.form}
                </p>
              )}
              <HandButton type="submit" className="w-full mt-2" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login'}
              </HandButton>
            </div>
            <div className="mt-6 text-center text-lg font-patrick text-hand-pencil/80">
              Don&apos;t have an account?{' '}
              <Link href="#" className="text-hand-pencil underline underline-offset-4 decoration-2 decoration-wavy hover:text-hand-blue">
                Contact your Teacher
              </Link>
            </div>
          </form>
        </HandCardContent>
      </HandCard>
    </div>
  )
}

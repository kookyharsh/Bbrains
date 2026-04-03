'use client'

import { useRouter } from 'next/navigation'
import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { Eye, EyeOff } from 'lucide-react'

import { cn } from '@/lib/utils'
import { getBaseUrl } from '@/services/api/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { validate, hasErrors, ValidationErrors } from '@/lib/validation'

export function SignUpForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showRepeatPassword, setShowRepeatPassword] = useState(false)
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== repeatPassword) {
      setErrors({ repeatPassword: 'Passwords do not match' })
      return
    }

    const validationErrors = validate(
      { email, password },
      {
        email: { required: true, email: true },
        password: { required: true, minLength: 6 },
      }
    )

    if (hasErrors(validationErrors)) {
      setErrors(validationErrors)
      return
    }

    setErrors({})
    setIsLoading(true)

    try {
      const response = await fetch(`${getBaseUrl()}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username: email.split('@')[0] }),
        credentials: 'include',
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Registration failed')
      }

      toast.success('Account created! You can now login.')
      router.push('/auth/login')
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
    if (field === 'repeatPassword') setRepeatPassword(value)
    setErrors((prev) => ({ ...prev, [field]: undefined, form: undefined }))
  }, [])

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Sign up</CardTitle>
          <CardDescription>Create a new account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={isLoading}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    disabled={isLoading}
                    className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password}</p>
                )}
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="repeat-password">Repeat Password</Label>
                </div>
                <div className="relative">
                  <Input
                    id="repeat-password"
                    type={showRepeatPassword ? 'text' : 'password'}
                    required
                    value={repeatPassword}
                    onChange={(e) => handleInputChange('repeatPassword', e.target.value)}
                    disabled={isLoading}
                    className={errors.repeatPassword ? 'border-red-500 pr-10' : 'pr-10'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showRepeatPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.repeatPassword && (
                  <p className="text-sm text-red-500">{errors.repeatPassword}</p>
                )}
              </div>
              {errors.form && (
                <p className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
                  {errors.form}
                </p>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating an account...' : 'Sign up'}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Already have an account?{' '}
              <Link href="/auth/login" className="underline underline-offset-4">
                Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

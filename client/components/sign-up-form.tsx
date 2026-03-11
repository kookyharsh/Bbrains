'use client'

import { useRouter } from 'next/navigation'
import { useState, useCallback } from 'react'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'
import { createClient } from '@/lib/client'
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
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()

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
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/protected`,
        },
      })

      if (error) {
        toast.error(error.message)
        throw error
      }

      toast.success('Account created! Please check your email to verify.')
      router.push('/auth/sign-up-success')
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
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  disabled={isLoading}
                  className={errors.password ? 'border-red-500' : ''}
                />
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password}</p>
                )}
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="repeat-password">Repeat Password</Label>
                </div>
                <Input
                  id="repeat-password"
                  type="password"
                  required
                  value={repeatPassword}
                  onChange={(e) => handleInputChange('repeatPassword', e.target.value)}
                  disabled={isLoading}
                  className={errors.repeatPassword ? 'border-red-500' : ''}
                />
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

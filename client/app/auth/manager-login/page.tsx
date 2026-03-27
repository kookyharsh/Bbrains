import { LoginForm } from '@/features/auth/components/login-form'

export default function ManagerLoginPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-hand-paper bg-paper-texture bg-[size:24px_24px] p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm
          title="Manager Login"
          description="Sign in with your manager account to open the leadership dashboard."
        />
      </div>
    </div>
  )
}

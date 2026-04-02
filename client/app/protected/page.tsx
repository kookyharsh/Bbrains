import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { LogoutButton } from '@/components/shell/logout-button'

export default async function ProtectedPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value

  if (!token) {
    redirect('/auth/login')
  }

  return (
    <div className="flex h-svh w-full items-center justify-center gap-2">
      <p>Hello, you are authenticated!</p>
      <LogoutButton />
    </div>
  )
}

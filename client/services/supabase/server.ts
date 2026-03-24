import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Central server-side Supabase client for SSR contexts
export async function getServerSupabase() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

export const createClient = getServerSupabase;

export async function getServerSession() {
  const supabase = await getServerSupabase()
  const { data: { session }, error } = await supabase.auth.getSession()
  return { session, error }
}

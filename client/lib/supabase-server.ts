import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/auth-helpers-nextjs'

// Central server-side Supabase client for SSR contexts
export function getServerSupabase() {
  return createServerClient({ cookies })
}

export async function getServerSession() {
  const supabase = getServerSupabase()
  const { data: { session }, error } = await supabase.auth.getSession()
  return { session, error }
}

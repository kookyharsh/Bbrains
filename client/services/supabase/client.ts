import { createBrowserClient } from '@supabase/ssr'

// Centralized, single instance for both login and API calls
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

let _supabaseClient: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseClient() {
  if (typeof window === 'undefined') {
    return null;
  }
  
  if (!_supabaseClient) {
    _supabaseClient = createBrowserClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: true,
        },
        cookies: {
          getAll() {
            if (typeof document === 'undefined') return [];
            return document.cookie.split('; ').map((c) => {
              const [name, ...v] = c.split('=')
              return { name, value: v.join('=') }
            })
          },
          setAll(
            cookiesToSet: Array<{
              name: string
              value: string
              options?: {
                maxAge?: number
                secure?: boolean
                sameSite?: 'lax' | 'strict' | 'none'
              }
            }>
          ) {
            if (typeof document === 'undefined') return;
            cookiesToSet.forEach(({ name, value, options }) => {
              document.cookie = `${name}=${value}; path=/; ${options?.maxAge ? `max-age=${options.maxAge}; ` : ''}${options?.secure ? 'secure; ' : ''}${options?.sameSite ? `samesite=${options.sameSite}; ` : ''}`
            })
          },
        },
      }
    )
  }
  return _supabaseClient
}

export const createClient = getSupabaseClient;
export const supabase = getSupabaseClient() as ReturnType<typeof createBrowserClient>

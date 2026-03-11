import { createBrowserClient } from '@supabase/ssr'

// Centralized, single instance for both login and API calls
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

let _supabaseClient: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseClient() {
  if (!_supabaseClient) {
    _supabaseClient = createBrowserClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
      {
        // Use browser cookies for session persistence to support SSR-friendly auth flow
        auth: {
          persistSession: true,
        },
        // Fallback cookie adapter to ensure cross-env compatibility
        cookies: {
          getAll() {
            return document.cookie.split('; ').map((c) => {
              const [name, ...v] = c.split('=')
              return { name, value: v.join('=') }
            })
          },
          setAll(cookiesToSet: any[]) {
            cookiesToSet.forEach(({ name, value, options }) => {
              document.cookie = `${name}=${value}; path=/; ${options?.maxAge ? `max-age=${options.maxAge}; ` : ''}${options?.secure ? 'secure; ' : ''}${options?.sameSite ? `samesite=${options.sameSite}; ` : ''}`
            })
          },
          removeItem(key: string) {
            document.cookie = `${key}=; path=/; max-age=0`;
          },
        },
      }
    )
  }
  return _supabaseClient
}

export const supabase = getSupabaseClient() as ReturnType<typeof createBrowserClient>

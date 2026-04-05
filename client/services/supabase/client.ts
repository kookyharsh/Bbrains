import { createBrowserClient } from '@supabase/ssr'

// Centralized, single instance for both login and API calls
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Prefer the classic anon key; fall back to publishable if that’s what’s configured.
const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

let _supabaseClient: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseClient() {
  if (typeof window === 'undefined') {
    return null;
  }

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error(
      'Supabase env missing: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY).'
    );
  }
  
  if (!_supabaseClient) {
    _supabaseClient = createBrowserClient(
      SUPABASE_URL,
      SUPABASE_KEY,
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
                sameSite?: boolean | 'lax' | 'strict' | 'none'
              }
            }>
          ) {
            if (typeof document === 'undefined') return;
            cookiesToSet.forEach(({ name, value, options }) => {
              let sameSiteValue = '';
              if (options?.sameSite !== undefined) {
                if (typeof options.sameSite === 'boolean') {
                  sameSiteValue = options.sameSite ? 'strict' : 'lax';
                } else {
                  sameSiteValue = options.sameSite;
                }
                sameSiteValue = `samesite=${sameSiteValue}; `;
              }
              document.cookie = `${name}=${value}; path=/; ${options?.maxAge ? `max-age=${options.maxAge}; ` : ''}${options?.secure ? 'secure; ' : ''}${sameSiteValue}`
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

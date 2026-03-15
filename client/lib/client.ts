import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Check if we're in the browser environment
  const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined'
  
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          if (!isBrowser) return []
          return document.cookie.split('; ').map(c => {
            const [key, ...v] = c.split('=')
            return { name: key, value: v.join('=') }
          })
        },
        setAll(cookiesToSet) {
          if (!isBrowser) return
          cookiesToSet.forEach(({ name, value, options }) => {
            document.cookie = `${name}=${value}; path=/; ${options?.maxAge ? `max-age=${options.maxAge}; ` : ''}${options?.secure ? 'secure; ' : ''}${options?.sameSite ? `samesite=${options.sameSite}; ` : ''}`
          })
        },
      },
    }
  )
}

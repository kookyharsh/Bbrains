import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return document.cookie.split('; ').map(c => {
            const [key, ...v] = c.split('=')
            return { name: key, value: v.join('=') }
          })
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            document.cookie = `${name}=${value}; path=/; ${options?.maxAge ? `max-age=${options.maxAge}; ` : ''}${options?.secure ? 'secure; ' : ''}${options?.sameSite ? `samesite=${options.sameSite}; ` : ''}`
          })
        },
      },
    }
  )
}

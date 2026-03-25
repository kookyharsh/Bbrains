"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"

/**
 * AuthRefresher — safety net client component.
 * 
 * Supabase fires "SIGNED_IN" on the client reliably after the session cookie
 * is written. When that happens we call router.refresh() so the server layout
 * re-executes with the now-readable session, fetches the correct role data,
 * and re-renders the sidebar — without a full page reload.
 */
export function AuthRefresher() {
    const router = useRouter()

    useEffect(() => {
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
                router.refresh()
            }
        })

        return () => subscription.unsubscribe()
    }, [router])

    return null
}

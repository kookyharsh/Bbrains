"use client"

import React from "react"
import { useUser, useAuth } from "@clerk/nextjs"
import { Loader2, ShieldX } from "lucide-react"
import { AdminDashboard } from "./AdminDashboard"
import { TeacherDashboard } from "./TeacherDashboard"

export default function AdminPage() {
    const { user, isLoaded } = useUser()
    const { getToken } = useAuth()

    if (!isLoaded) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="size-8 animate-spin text-muted-foreground/50" />
            </div>
        )
    }

    const role = (user?.publicMetadata?.role as string) ?? "student"

    if (role === "admin") {
        return <AdminDashboard getToken={getToken} />
    }

    if (role === "teacher") {
        return <TeacherDashboard getToken={getToken} />
    }

    // Student or unrecognized role → access denied
    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-muted-foreground">
            <ShieldX className="size-12 opacity-30" />
            <p className="text-base font-semibold">Access Denied</p>
            <p className="text-sm">You don&apos;t have permission to view this page.</p>
        </div>
    )
}

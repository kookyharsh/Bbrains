"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { TeacherDashboard } from "./TeacherDashboard"
import { dashboardApi } from "@/lib/api-services"

export default function TeacherPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const userResp = await dashboardApi.getUser()
                if (userResp.success && userResp.data) {
                    const userType = userResp.data.type
                    if (userType !== 'teacher' && userType !== 'admin') {
                        router.push('/dashboard')
                        return
                    }
                } else {
                    router.push('/dashboard')
                }
            } catch (err) {
                console.error("Auth check failed:", err)
                router.push('/dashboard')
            } finally {
                setLoading(false)
            }
        }
        checkAuth()
    }, [router])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    return <TeacherDashboard />
}

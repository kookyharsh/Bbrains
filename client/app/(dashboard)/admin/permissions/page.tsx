"use client"

import { useEffect, useState } from "react"
import { PermissionMatrix } from "../roles/_components/PermissionMatrix"
import { type Role, type Permission } from "../roles/_types"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, ShieldCheck } from "lucide-react"
import { toast } from "sonner"
import { api } from "@/services/api/client"

export default function PermissionsPage() {
    const [roles, setRoles] = useState<Role[]>([])
    const [permissions, setPermissions] = useState<Permission[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [userRank, setUserRank] = useState<number>(100) // Default to lowest

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        setError(null)
        try {
            const [rolesRes, permsRes, meRes] = await Promise.all([
                api.get<Role[]>('/roles'),
                api.get<Permission[]>('/roles/permissions'),
                api.get<any>('/user/me') 
            ])

            if (!rolesRes.success || !permsRes.success) throw new Error("Failed to fetch data")

            setRoles(rolesRes.data || [])
            setPermissions(permsRes.data || [])

            if (meRes.success) {
                const userData = meRes.data || {}
                if (userData.isSuperAdmin) {
                    setUserRank(0)
                } else if (userData.roles) {
                    const ranks = userData.roles.map((ur: any) => ur.role.rank)
                    setUserRank(Math.min(...ranks))
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred")
        } finally {
            setLoading(false)
        }
    }

    const handlePermissionToggle = async (roleId: number, permissionId: number, enabled: boolean) => {
        try {
            const role = roles.find(r => r.id === roleId)
            if (!role) return

            const currentPermIds = role.permissions.map(p => p.permission.id)
            let newPermIds: number[]
            
            if (enabled) {
                newPermIds = [...currentPermIds, permissionId]
            } else {
                newPermIds = currentPermIds.filter(id => id !== permissionId)
            }

            const res = await api.post<Role>(`/roles/${roleId}/permissions`, { permissionIds: newPermIds })

            if (!res.success) {
                throw new Error(res.message || res.error || "Failed to update permissions")
            }

            const updatedRole = res.data;
            if (!updatedRole) throw new Error("Missing role data in response")

            setRoles(prev => prev.map(r => r.id === roleId ? { ...r, permissions: updatedRole.permissions } : r))
            toast.success("Permissions updated successfully")
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Failed to update permissions"
            toast.error(msg)
            throw err // Re-throw to reset the switch state in the component
        }
    }

    if (loading) {
        return (
            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-10 w-48" />
                </div>
                <CardSkeleton />
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="flex items-center gap-3 p-4 text-red-800 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/10 dark:text-red-400 dark:border-red-800">
                    <AlertCircle className="h-5 w-5" />
                    <div>
                        <h3 className="font-bold">Error</h3>
                        <p className="text-sm opacity-90">{error}</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6 overflow-y-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Role Permissions</h1>
                    <p className="text-muted-foreground">
                        Manage what each role is allowed to do across the platform.
                    </p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Your Rank: {userRank === 0 ? "Super Admin" : userRank}</span>
                </div>
            </div>

            <PermissionMatrix 
                roles={roles} 
                permissions={permissions} 
                currentUserRank={userRank}
                onPermissionToggle={handlePermissionToggle}
            />
        </div>
    )
}

function CardSkeleton() {
    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow">
            <div className="p-6 space-y-4">
                <Skeleton className="h-6 w-32" />
                <div className="space-y-2">
                    {Array.from({ length: 10 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                    ))}
                </div>
            </div>
        </div>
    )
}

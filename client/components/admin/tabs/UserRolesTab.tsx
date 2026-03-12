"use client"

import React, { useState, useEffect } from "react"
import { getAuthedClient } from "@/lib/http"
import { Loader2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SectionHeader } from "../SectionHeader"
import { ConfirmDialog } from "../ConfirmDialog"
import type { ApiUser, ApiRole } from "@/lib/types/api"

type GetToken = () => Promise<string | null>

export function UserRolesTab({ getToken }: { getToken: GetToken }) {
    const [users, setUsers] = useState<ApiUser[]>([])
    const [roles, setRoles] = useState<ApiRole[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedUserId, setSelectedUserId] = useState("")
    const [userRoles, setUserRoles] = useState<ApiRole[]>([])
    const [loadingUserRoles, setLoadingUserRoles] = useState(false)
    const [assignRoleId, setAssignRoleId] = useState("")
    const [assigning, setAssigning] = useState(false)
    const [removeTarget, setRemoveTarget] = useState<{ userId: string; roleId: number; roleName: string } | null>(null)
    const [removing, setRemoving] = useState(false)

    useEffect(() => {
        async function load() {
            try {
                setLoading(true)
                const c = await getAuthedClient(getToken)
                const [uRes, rRes] = await Promise.all([
                    c.get<{ success: boolean; data: ApiUser[] }>("/user/students"),
                    c.get<{ success: boolean; data: ApiRole[] }>("/roles"),
                ])
                setUsers([...uRes.data.data])
                setRoles(rRes.data.data)
            } catch (e) { console.error(e) } finally { setLoading(false) }
        }
        load()
    }, [getToken])

    async function loadUserRoles(userId: string) {
        if (!userId) { setUserRoles([]); return }
        try {
            setLoadingUserRoles(true)
            const c = await getAuthedClient(getToken)
            const res = await c.get<{ success: boolean; data: { role: ApiRole }[] }>(`/roles/users/${userId}`)
            setUserRoles(res.data.data.map((ur) => ur.role))
        } catch (e) { console.error(e) } finally { setLoadingUserRoles(false) }
    }

    async function handleAssign() {
        if (!selectedUserId || !assignRoleId) return
        try {
            setAssigning(true)
            const c = await getAuthedClient(getToken)
            await c.post(`/roles/users/${selectedUserId}/assign`, { roleId: Number(assignRoleId) })
            await loadUserRoles(selectedUserId)
            setAssignRoleId("")
        } catch (e) { console.error(e) } finally { setAssigning(false) }
    }

    async function handleRemove() {
        if (!removeTarget) return
        try {
            setRemoving(true)
            const c = await getAuthedClient(getToken)
            await c.delete(`/roles/users/${removeTarget.userId}/${removeTarget.roleId}`)
            setUserRoles((prev) => prev.filter((r) => r.id !== removeTarget.roleId))
            setRemoveTarget(null)
        } catch (e) { console.error(e) } finally { setRemoving(false) }
    }

    const availableRoles = roles.filter((r) => !userRoles.some((ur) => ur.id === r.id))

    return (
        <div className="space-y-4">
            <SectionHeader title="User Roles" subtitle="Assign or remove custom roles from users" />

            {loading ? <div className="flex justify-center py-8"><Loader2 className="size-6 animate-spin text-muted-foreground/50" /></div> : (
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <label className="text-xs font-semibold text-muted-foreground whitespace-nowrap">Select User:</label>
                        <select
                            value={selectedUserId}
                            onChange={(e) => { setSelectedUserId(e.target.value); loadUserRoles(e.target.value) }}
                            className="h-9 flex-1 max-w-xs rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                            <option value="">-- Choose a user --</option>
                            {users.map((u) => <option key={u.id} value={u.id}>{u.username} ({u.email})</option>)}
                        </select>
                    </div>

                    {selectedUserId && (
                        <>
                            <div className="flex items-center gap-2">
                                <select
                                    value={assignRoleId}
                                    onChange={(e) => setAssignRoleId(e.target.value)}
                                    className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                    disabled={availableRoles.length === 0}
                                >
                                    <option value="">{availableRoles.length === 0 ? "All roles assigned" : "Select role to assign..."}</option>
                                    {availableRoles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                                </select>
                                <Button size="sm" onClick={handleAssign} disabled={!assignRoleId || assigning}>
                                    {assigning ? <Loader2 className="mr-2 size-3.5 animate-spin" /> : null}
                                    Assign Role
                                </Button>
                            </div>

                            <div>
                                <p className="text-xs font-semibold text-muted-foreground mb-2">Current Roles</p>
                                {loadingUserRoles ? (
                                    <Loader2 className="size-4 animate-spin text-muted-foreground/50" />
                                ) : userRoles.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No custom roles assigned</p>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {userRoles.map((r) => (
                                            <div key={r.id} className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1">
                                                <span className="text-xs font-semibold text-primary">{r.name}</span>
                                                <button
                                                    onClick={() => setRemoveTarget({ userId: selectedUserId, roleId: r.id, roleName: r.name })}
                                                    className="text-muted-foreground hover:text-destructive transition-colors"
                                                >
                                                    <XCircle className="size-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}

            <ConfirmDialog open={!!removeTarget} onClose={() => setRemoveTarget(null)} onConfirm={handleRemove} confirming={removing}
                title="Remove Role" description={`Remove role "${removeTarget?.roleName}" from this user?`} />
        </div>
    )
}

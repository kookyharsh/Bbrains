"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RoleCards } from "./_components/RoleCards"
import { PermissionMatrix } from "./_components/PermissionMatrix"
import { UserRolesGrid } from "./_components/UserRolesGrid"
import { EditRoleDialog } from "./_components/EditRoleDialog"
import { EditUserRoleDialog } from "./_components/EditUserRoleDialog"
import type { Role, UserWithRoles } from "./_types"

interface RolesClientProps {
    initialRoles: Role[]
    initialUsers: UserWithRoles[]
}

export function RolesClient({ initialRoles, initialUsers }: RolesClientProps) {
    const [roles] = useState<Role[]>(initialRoles)
    const [users] = useState<UserWithRoles[]>(initialUsers)
    const [showRoleDialog, setShowRoleDialog] = useState(false)
    const [showUserDialog, setShowUserDialog] = useState(false)
    const [editRole, setEditRole] = useState<Role | null>(null)
    const [editUser, setEditUser] = useState<UserWithRoles | null>(null)
    const [selectedPerms, setSelectedPerms] = useState<string[]>([])
    const [selectedRoles, setSelectedRoles] = useState<string[]>([])

    const handleEditRole = (role: Role) => {
        setEditRole(role)
        const permNames = (role.permissions || []).map((p: string | {permission?: string}) => typeof p === 'string' ? p : p.permission || '')
        setSelectedPerms(permNames)
        setShowRoleDialog(true)
    }

    const handleCreateRole = () => {
        setEditRole(null)
        setSelectedPerms([])
        setShowRoleDialog(true)
    }

    const handleEditUser = (user: UserWithRoles) => {
        setEditUser(user)
        const userRoleNames = (user.roles || []).map((r: string | {role?: string}) => typeof r === 'string' ? r : r.role || '')
        setSelectedRoles(userRoleNames)
        setShowUserDialog(true)
    }

    const handleSaveRoles = () => {
        setShowRoleDialog(false)
    }

    const handleSaveUserRoles = () => {
        setShowUserDialog(false)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        Roles & Access
                    </h1>
                    <p className="text-muted-foreground">
                        Manage roles and permissions
                    </p>
                </div>
                <Button onClick={handleCreateRole}>
                    <Plus className="w-4 h-4 mr-1" /> New Role
                </Button>
            </div>

            <RoleCards roles={roles} onEdit={handleEditRole} />

            <PermissionMatrix roles={roles} />

            <UserRolesGrid users={users} onEdit={handleEditUser} />

            <EditRoleDialog
                open={showRoleDialog}
                onOpenChange={setShowRoleDialog}
                role={editRole}
                selectedPerms={selectedPerms}
                onPermsChange={setSelectedPerms}
                onSave={handleSaveRoles}
            />

            <EditUserRoleDialog
                open={showUserDialog}
                onOpenChange={setShowUserDialog}
                user={editUser}
                selectedRoles={selectedRoles}
                onRolesChange={setSelectedRoles}
                roles={roles}
                onSave={handleSaveUserRoles}
            />
        </div>
    )
}

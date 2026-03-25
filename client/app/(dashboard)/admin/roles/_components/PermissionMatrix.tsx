"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { type Role, type Permission } from "../_types"

interface PermissionMatrixProps {
    roles: Role[]
    permissions: Permission[]
    currentUserRank: number
    onPermissionToggle: (roleId: number, permissionId: number, enabled: boolean) => Promise<void>
}

export function PermissionMatrix({ 
    roles, 
    permissions, 
    currentUserRank,
    onPermissionToggle 
}: PermissionMatrixProps) {
    const [toggling, setToggling] = useState<string | null>(null)

    const handleToggle = async (roleId: number, permissionId: number, enabled: boolean) => {
        const key = `${roleId}-${permissionId}`
        setToggling(key)
        try {
            await onPermissionToggle(roleId, permissionId, enabled)
        } catch (error) {
            console.error(error)
            // Error handling is usually done in the parent via toast, 
            // but we can add a fallback here
        } finally {
            setToggling(null)
        }
    }

    const hasPermission = (role: Role, permName: string) => {
        return role.permissions.some(p => p.permission.name === permName)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Permission Matrix</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[200px]">Permission</TableHead>
                                {roles.map((role) => (
                                    <TableHead key={role.id} className="text-center min-w-[100px]">
                                        <div className="flex flex-col items-center gap-1">
                                            <span>{role.name}</span>
                                            <span className="text-[10px] text-muted-foreground font-normal">
                                                Rank: {role.rank}
                                            </span>
                                        </div>
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {permissions.map((perm) => (
                                <TableRow key={perm.id}>
                                    <TableCell className="font-medium text-sm">
                                        <div className="flex flex-col">
                                            <span className="capitalize">{perm.name.replace(/_/g, " ")}</span>
                                            {perm.description && (
                                                <span className="text-[10px] text-muted-foreground font-normal leading-tight">
                                                    {perm.description}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    {roles.map((role) => {
                                        const isEditable = currentUserRank < role.rank;
                                        const isEnabled = hasPermission(role, perm.name);
                                        const key = `${role.id}-${perm.id}`;

                                        return (
                                            <TableCell key={role.id} className="text-center">
                                                <div className="flex justify-center">
                                                    <Switch
                                                        checked={isEnabled}
                                                        onCheckedChange={(checked) => handleToggle(role.id, perm.id, checked)}
                                                        disabled={!isEditable || toggling === key}
                                                        aria-label={`Toggle ${perm.name} for ${role.name}`}
                                                    />
                                                </div>
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}

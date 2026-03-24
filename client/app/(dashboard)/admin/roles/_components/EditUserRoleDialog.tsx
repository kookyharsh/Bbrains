"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import type { Role, UserWithRoles } from "../_types"

interface EditUserRoleDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    user: UserWithRoles | null
    selectedRoles: string[]
    onRolesChange: (roles: string[]) => void
    roles: Role[]
    onSave: () => void
}

export function EditUserRoleDialog({
    open,
    onOpenChange,
    user,
    selectedRoles,
    onRolesChange,
    roles,
    onSave,
}: EditUserRoleDialogProps) {
    const toggleRole = (roleName: string) => {
        onRolesChange(
            selectedRoles.includes(roleName)
                ? selectedRoles.filter((r) => r !== roleName)
                : [...selectedRoles, roleName]
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit User Roles</DialogTitle>
                </DialogHeader>
                {user && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                            <Avatar className="w-10 h-10">
                                <AvatarFallback className="bg-primary/10 text-primary">
                                    {user.firstName.charAt(0)}
                                    {user.lastName.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-medium text-foreground">
                                    @{user.username}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {user.email}
                                </p>
                            </div>
                        </div>
                        <div>
                            <Label className="mb-2 block">Select Roles</Label>
                            <div className="space-y-2">
                                {roles.map((role) => (
                                    <div
                                        key={role.id}
                                        className="flex items-center justify-between p-2 rounded-lg border border-border"
                                    >
                                        <div>
                                            <span className="text-sm font-medium text-foreground">
                                                {role.name}
                                            </span>
                                            <p className="text-xs text-muted-foreground">
                                                {role.description}
                                            </p>
                                        </div>
                                        <Switch
                                            checked={selectedRoles.includes(role.name)}
                                            onCheckedChange={() => toggleRole(role.name)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)}>Save Roles</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

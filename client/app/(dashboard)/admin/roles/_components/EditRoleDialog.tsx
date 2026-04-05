"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { allPermissions, type Role } from "../_types"

interface EditRoleDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    role: Role | null
    selectedPerms: string[]
    onPermsChange: (perms: string[]) => void
    onSave: () => void
}

export function EditRoleDialog({
    open,
    onOpenChange,
    role,
    selectedPerms,
    onPermsChange,
    onSave,
}: EditRoleDialogProps) {
    const togglePerm = (perm: string) => {
        onPermsChange(
            selectedPerms.includes(perm)
                ? selectedPerms.filter((p) => p !== perm)
                : [...selectedPerms, perm]
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{role ? "Edit Role" : "Create Role"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label>Name</Label>
                        <Input defaultValue={role?.name} placeholder="Role name" />
                    </div>
                    <div>
                        <Label>Description</Label>
                        <Input
                            defaultValue={role?.description ?? ""}
                            placeholder="Role description"
                        />
                    </div>
                    <div>
                        <Label className="mb-2 block">Permissions</Label>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {allPermissions.map((perm) => (
                                <div
                                    key={perm}
                                    className="flex items-center justify-between"
                                >
                                    <span className="text-sm capitalize text-foreground">
                                        {perm.replace(/_/g, " ")}
                                    </span>
                                    <Switch
                                        checked={selectedPerms.includes(perm)}
                                        onCheckedChange={() => togglePerm(perm)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)}>
                        {role ? "Save" : "Create"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

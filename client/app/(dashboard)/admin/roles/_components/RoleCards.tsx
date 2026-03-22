"use client"

import { Shield, Pencil, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Role } from "../_types"

interface RoleCardsProps {
    roles: Role[]
    onEdit: (role: Role) => void
}

export function RoleCards({ roles, onEdit }: RoleCardsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {roles.map((role) => (
                <Card key={role.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Shield className="w-5 h-5 text-primary" />
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => onEdit(role)}
                            >
                                <Pencil className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                        <h3 className="font-semibold text-foreground">{role.name}</h3>
                        <p className="text-xs text-muted-foreground mb-3">{role.description}</p>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Users className="w-3 h-3" />
                                {role.users} users
                            </div>
                            <Badge variant="secondary" className="text-xs">
                                {role.permissions.length} permissions
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

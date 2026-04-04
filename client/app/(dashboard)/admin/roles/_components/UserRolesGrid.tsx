"use client"

import { useState } from "react"
import { Search, GraduationCap, Pencil, UserCog } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getRoleBadgeColor, type UserWithRoles } from "../_types"

interface UserRolesGridProps {
    users: UserWithRoles[]
    onEdit: (user: UserWithRoles) => void
}

export function UserRolesGrid({ users, onEdit }: UserRolesGridProps) {
    const [userSearch, setUserSearch] = useState("")

    const filteredUsers = users.filter((u) => {
        const fullName = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase()
        const query = userSearch.toLowerCase()
        return (
            (u.username || '').toLowerCase().includes(query) ||
            fullName.includes(query) ||
            (u.email || '').toLowerCase().includes(query)
        )
    })

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <CardTitle className="text-lg">User Roles</CardTitle>
                        <CardDescription>Manage roles for users in the system</CardDescription>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search users..."
                            value={userSearch}
                            onChange={(e) => setUserSearch(e.target.value)}
                            className="pl-9 w-full sm:w-[250px]"
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredUsers.map((user) => (
                        <div
                            key={user.id}
                            className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                        >
                            <Avatar className="w-10 h-10">
                                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                    {user.firstName?.charAt(0)}
                                    {user.lastName?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-foreground text-sm truncate">
                                    @{user.username}
                                </p>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <GraduationCap className="w-3 h-3" />
                                    {user.grade}
                                </div>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {(user.roles || []).map((r) => {
                                        const roleName = r
                                        return (
                                            <Badge
                                                key={roleName}
                                                variant="outline"
                                                className={`text-[10px] ${getRoleBadgeColor(roleName)}`}
                                            >
                                                {roleName}
                                            </Badge>
                                        )
                                    })}
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 shrink-0"
                                onClick={() => onEdit(user)}
                            >
                                <Pencil className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    ))}
                </div>
                {filteredUsers.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                        <UserCog className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No users found</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

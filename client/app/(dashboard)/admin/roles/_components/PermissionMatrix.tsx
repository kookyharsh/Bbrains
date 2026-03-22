"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { allPermissions, type Role } from "../_types"

interface PermissionMatrixProps {
    roles: Role[]
}

export function PermissionMatrix({ roles }: PermissionMatrixProps) {
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
                                <TableHead>Permission</TableHead>
                                {roles.map((role) => (
                                    <TableHead key={role.id} className="text-center">
                                        {role.name}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {allPermissions.map((perm) => (
                                <TableRow key={perm}>
                                    <TableCell className="font-medium text-sm capitalize">
                                        {perm.replace(/_/g, " ")}
                                    </TableCell>
                                    {roles.map((role) => (
                                        <TableCell key={role.id} className="text-center">
                                            {role.permissions.includes(perm) ? (
                                                <span className="text-green-600">✓</span>
                                            ) : (
                                                <span className="text-muted-foreground">—</span>
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}

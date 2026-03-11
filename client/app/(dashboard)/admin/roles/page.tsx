"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Shield, Plus, Pencil, Trash2, Users } from "lucide-react";

const mockRoles = [
  { id: 1, name: "Admin", description: "Full system access", users: 2, permissions: ["manage_users", "manage_roles", "manage_courses", "view_audit_log", "manage_products", "view_stats"] },
  { id: 2, name: "Teacher", description: "Course and student management", users: 56, permissions: ["manage_students", "manage_assignments", "grade_assignments", "manage_announcements"] },
  { id: 3, name: "Student", description: "Standard student access", users: 1248, permissions: ["view_courses", "submit_assignments", "use_wallet", "use_market", "use_chat"] },
  { id: 4, name: "Staff", description: "Limited administrative access", users: 8, permissions: ["view_users", "view_stats"] },
];

const allPermissions = [
  "manage_users", "manage_roles", "manage_courses", "view_audit_log",
  "manage_products", "view_stats", "manage_students", "manage_assignments",
  "grade_assignments", "manage_announcements", "view_courses",
  "submit_assignments", "use_wallet", "use_market", "use_chat", "view_users",
];

export default function RolesPage() {
  const [showDialog, setShowDialog] = useState(false);
  const [editRole, setEditRole] = useState<typeof mockRoles[0] | null>(null);
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);

  const handleEdit = (role: typeof mockRoles[0]) => {
    setEditRole(role);
    setSelectedPerms(role.permissions);
    setShowDialog(true);
  };

  const togglePerm = (perm: string) => {
    setSelectedPerms((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Roles & Access</h1>
          <p className="text-muted-foreground">Manage roles and permissions</p>
        </div>
        <Button onClick={() => { setEditRole(null); setSelectedPerms([]); setShowDialog(true); }}>
          <Plus className="w-4 h-4 mr-1" /> New Role
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {mockRoles.map((role) => (
          <Card key={role.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(role)}>
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
                <Badge variant="secondary" className="text-xs">{role.permissions.length} permissions</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Permissions Table */}
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
                  {mockRoles.map((role) => (
                    <TableHead key={role.id} className="text-center">{role.name}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {allPermissions.map((perm) => (
                  <TableRow key={perm}>
                    <TableCell className="font-medium text-sm capitalize">{perm.replace(/_/g, " ")}</TableCell>
                    {mockRoles.map((role) => (
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

      {/* Edit Role Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editRole ? "Edit Role" : "Create Role"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Name</Label><Input defaultValue={editRole?.name} placeholder="Role name" /></div>
            <div><Label>Description</Label><Input defaultValue={editRole?.description} placeholder="Role description" /></div>
            <div>
              <Label className="mb-2 block">Permissions</Label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {allPermissions.map((perm) => (
                  <div key={perm} className="flex items-center justify-between">
                    <span className="text-sm capitalize text-foreground">{perm.replace(/_/g, " ")}</span>
                    <Switch checked={selectedPerms.includes(perm)} onCheckedChange={() => togglePerm(perm)} />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowDialog(false)}>{editRole ? "Save" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

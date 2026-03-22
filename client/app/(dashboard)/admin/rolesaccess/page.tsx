"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Shield, Plus, Pencil, Users, Search, GraduationCap, UserCog } from "lucide-react";

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

interface UserWithRoles {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  grade?: string;
  roles: string[];
}

const mockUsersWithRoles: UserWithRoles[] = [
  { id: "u1", username: "alex_j", firstName: "Alex", lastName: "Johnson", email: "alex@uni.edu", grade: "10th Grade", roles: ["Student"] },
  { id: "u2", username: "sarah_j", firstName: "Sarah", lastName: "Jenkins", email: "sarah@uni.edu", grade: "11th Grade", roles: ["Student"] },
  { id: "u3", username: "dr_smith", firstName: "Robert", lastName: "Smith", email: "smith@uni.edu", grade: "Faculty", roles: ["Teacher"] },
  { id: "u4", username: "prof_johnson", firstName: "Emily", lastName: "Johnson", email: "johnson@uni.edu", grade: "Faculty", roles: ["Teacher"] },
  { id: "u5", username: "mike_c", firstName: "Michael", lastName: "Chang", email: "mike@uni.edu", grade: "9th Grade", roles: ["Student"] },
  { id: "u6", username: "emily_d", firstName: "Emily", lastName: "Davis", email: "emily@uni.edu", grade: "12th Grade", roles: ["Student"] },
  { id: "u7", username: "admin_adams", firstName: "Principal", lastName: "Adams", email: "adams@uni.edu", grade: "Administration", roles: ["Admin"] },
  { id: "u8", username: "jane_w", firstName: "Jane", lastName: "Wilson", email: "jane@uni.edu", grade: "10th Grade", roles: ["Student"] },
  { id: "u9", username: "mr_brown", firstName: "James", lastName: "Brown", email: "brown@uni.edu", grade: "Faculty", roles: ["Teacher", "Staff"] },
  { id: "u10", username: "lisa_m", firstName: "Lisa", lastName: "Miller", email: "lisa@uni.edu", grade: "11th Grade", roles: ["Student"] },
];

export default function RolesAccessPage() {
  const [showDialog, setShowDialog] = useState(false);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [editRole, setEditRole] = useState<typeof mockRoles[0] | null>(null);
  const [editUser, setEditUser] = useState<UserWithRoles | null>(null);
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const filteredUsers = mockUsersWithRoles.filter(u => {
    const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
    const query = userSearch.toLowerCase();
    return u.username.toLowerCase().includes(query) || 
           fullName.includes(query) || 
           u.email.toLowerCase().includes(query);
  });

  const handleEdit = (role: typeof mockRoles[0]) => {
    setEditRole(role);
    setSelectedPerms(role.permissions);
    setShowDialog(true);
  };

  const handleEditUser = (user: UserWithRoles) => {
    setEditUser(user);
    setSelectedRoles(user.roles);
    setShowUserDialog(true);
  };

  const togglePerm = (perm: string) => {
    setSelectedPerms((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const toggleUserRole = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "Admin": return "bg-red-500/10 text-red-600 hover:bg-red-500/20";
      case "Teacher": return "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20";
      case "Staff": return "bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20";
      default: return "bg-green-500/10 text-green-600 hover:bg-green-500/20";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
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

      {/* User Roles Management */}
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
                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm truncate">@{user.username}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <GraduationCap className="w-3 h-3" />
                    {user.grade}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {user.roles.map((role) => (
                      <Badge key={role} variant="outline" className={`text-[10px] ${getRoleBadgeColor(role)}`}>
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 shrink-0"
                  onClick={() => handleEditUser(user)}
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

      {/* Edit User Role Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User Roles</DialogTitle>
          </DialogHeader>
          {editUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {editUser.firstName.charAt(0)}{editUser.lastName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground">@{editUser.username}</p>
                  <p className="text-sm text-muted-foreground">{editUser.email}</p>
                </div>
              </div>
              <div>
                <Label className="mb-2 block">Select Roles</Label>
                <div className="space-y-2">
                  {mockRoles.map((role) => (
                    <div key={role.id} className="flex items-center justify-between p-2 rounded-lg border border-border">
                      <div>
                        <span className="text-sm font-medium text-foreground">{role.name}</span>
                        <p className="text-xs text-muted-foreground">{role.description}</p>
                      </div>
                      <Switch 
                        checked={selectedRoles.includes(role.name)} 
                        onCheckedChange={() => toggleUserRole(role.name)} 
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowUserDialog(false)}>Save Roles</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

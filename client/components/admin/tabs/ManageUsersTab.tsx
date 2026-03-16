"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Search, Plus, Pencil, Trash2, Users, Mail, Phone, MapPin, Building, User,
} from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UserDetails {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "student" | "teacher" | "admin";
  status: "active" | "inactive";
  joinDate: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  emergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
  bio?: string;
}

const mockUsers: UserDetails[] = [
  { id: "u1", username: "alex_j", email: "alex@uni.edu", firstName: "Alex", lastName: "Johnson", role: "student", status: "active", joinDate: "2025-09-01", phone: "+1 555-0101", address: { street: "123 College Ave", city: "Boston", state: "MA", zipCode: "02115", country: "USA" }, emergencyContact: { name: "John Johnson", phone: "+1 555-0102", relationship: "Father" } },
  { id: "u2", username: "sarah_j", email: "sarah@uni.edu", firstName: "Sarah", lastName: "Jenkins", role: "student", status: "active", joinDate: "2025-09-01", phone: "+1 555-0103", address: { street: "456 Oak Street", city: "Cambridge", state: "MA", zipCode: "02139", country: "USA" }, emergencyContact: { name: "Mary Jenkins", phone: "+1 555-0104", relationship: "Mother" } },
  { id: "u3", username: "dr_smith", email: "smith@uni.edu", firstName: "Robert", lastName: "Smith", role: "teacher", status: "active", joinDate: "2024-01-15", phone: "+1 555-0105", address: { street: "789 Faculty Lane", city: "Boston", state: "MA", zipCode: "02115", country: "USA" }, bio: "Professor of Computer Science with 15 years of experience." },
  { id: "u4", username: "prof_johnson", email: "johnson@uni.edu", firstName: "Emily", lastName: "Johnson", role: "teacher", status: "active", joinDate: "2023-08-20", phone: "+1 555-0106", address: { street: "321 Academic Blvd", city: "Cambridge", state: "MA", zipCode: "02138", country: "USA" }, bio: "Department Head for Mathematics." },
  { id: "u5", username: "mike_c", email: "mike@uni.edu", firstName: "Michael", lastName: "Chang", role: "student", status: "inactive", joinDate: "2025-09-01" },
  { id: "u6", username: "emily_d", email: "emily@uni.edu", firstName: "Emily", lastName: "Davis", role: "student", status: "active", joinDate: "2025-09-01", phone: "+1 555-0107", address: { street: "555 Student Way", city: "Boston", state: "MA", zipCode: "02115", country: "USA" } },
  { id: "u7", username: "admin_adams", email: "adams@uni.edu", firstName: "Principal", lastName: "Adams", role: "admin", status: "active", joinDate: "2020-01-01", phone: "+1 555-0108", address: { street: "100 Admin Building", city: "Boston", state: "MA", zipCode: "02115", country: "USA" } },
  { id: "u8", username: "jane_w", email: "jane@uni.edu", firstName: "Jane", lastName: "Wilson", role: "student", status: "active", joinDate: "2025-09-01", phone: "+1 555-0109", address: { street: "777 University Ave", city: "Boston", state: "MA", zipCode: "02115", country: "USA" }, emergencyContact: { name: "Robert Wilson", phone: "+1 555-0110", relationship: "Father" } },
];

export function ManageUsersTab() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showDialog, setShowDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editUser, setEditUser] = useState<UserDetails | null>(null);

  const filtered = mockUsers.filter((u) => {
    const fullName = `${u.firstName} ${u.lastName}`;
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (search && !fullName.toLowerCase().includes(search.toLowerCase()) && !u.username.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">View and manage all users</p>
        <Button onClick={() => { setEditUser(null); setShowDialog(true); }}>
          <Plus className="w-4 h-4 mr-1" /> Add User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: mockUsers.length, icon: Users },
          { label: "Students", value: mockUsers.filter(u => u.role === "student").length },
          { label: "Teachers", value: mockUsers.filter(u => u.role === "teacher").length },
          { label: "Active", value: mockUsers.filter(u => u.status === "active").length },
        ].map((s, i) => (
          <Card key={i}>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Filter role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="student">Student</SelectItem>
            <SelectItem value="teacher">Teacher</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead className="hidden sm:table-cell">Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground text-sm">{user.firstName} {user.lastName}</p>
                          <p className="text-xs text-muted-foreground">@{user.username}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">{user.email}</TableCell>
                    <TableCell><Badge variant="outline" className="capitalize">{user.role}</Badge></TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant={user.status === "active" ? "default" : "secondary"} className="capitalize">{user.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditUser(user); setShowDialog(true); }}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(user.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editUser ? "Edit User" : "Add New User"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <User className="w-4 h-4" /> Basic Information
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>First Name</Label><Input defaultValue={editUser?.firstName} placeholder="First name" /></div>
                <div><Label>Last Name</Label><Input defaultValue={editUser?.lastName} placeholder="Last name" /></div>
              </div>
              <div><Label>Username</Label><Input defaultValue={editUser?.username} placeholder="Username" /></div>
              <div><Label>Email</Label><Input defaultValue={editUser?.email} placeholder="Email" type="email" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Role</Label>
                  <Select defaultValue={editUser?.role || "student"}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="teacher">Teacher</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select defaultValue={editUser?.status || "active"}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Phone className="w-4 h-4" /> Contact Information
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Phone</Label><Input defaultValue={editUser?.phone} placeholder="+1 555-0000" /></div>
                <div><Label>Date of Birth</Label><Input defaultValue={editUser?.dateOfBirth} type="date" /></div>
              </div>
              <div>
                <Label>Gender</Label>
                <Select defaultValue={editUser?.gender || ""}>
                  <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer-not">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Address
              </h3>
              <div><Label>Street Address</Label><Input defaultValue={editUser?.address?.street} placeholder="123 Main St" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>City</Label><Input defaultValue={editUser?.address?.city} placeholder="City" /></div>
                <div><Label>State/Province</Label><Input defaultValue={editUser?.address?.state} placeholder="State" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Zip/Postal Code</Label><Input defaultValue={editUser?.address?.zipCode} placeholder="12345" /></div>
                <div><Label>Country</Label><Input defaultValue={editUser?.address?.country} placeholder="Country" /></div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Building className="w-4 h-4" /> Emergency Contact
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Contact Name</Label><Input defaultValue={editUser?.emergencyContact?.name} placeholder="Full name" /></div>
                <div><Label>Phone</Label><Input defaultValue={editUser?.emergencyContact?.phone} placeholder="+1 555-0000" /></div>
              </div>
              <div><Label>Relationship</Label><Input defaultValue={editUser?.emergencyContact?.relationship} placeholder="e.g., Father, Mother, Guardian" /></div>
            </div>

            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Mail className="w-4 h-4" /> Additional Information
              </h3>
              <div><Label>Bio</Label><Textarea defaultValue={editUser?.bio} placeholder="Brief description about the user..." className="resize-none" rows={3} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowDialog(false)}>{editUser ? "Save Changes" : "Add User"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => setDeleteId(null)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

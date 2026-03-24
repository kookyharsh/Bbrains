"use client";

import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatsCards } from "./_components/StatsCards";
import { UserFilters } from "./_components/UserFilters";
import { UsersTable } from "./_components/UsersTable";
import { UserDialog } from "./_components/UserDialog";
import { DeleteConfirmationDialog } from "./_components/DeleteConfirmationDialog";
import { mockUsers } from "./_types";
import type { ApiUser } from "@/lib/types/api";

export default function ManageUsersPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showDialog, setShowDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editUser, setEditUser] = useState<ApiUser | null>(null);

  const filtered = useMemo(() => {
    return mockUsers.filter((u) => {
      const firstName = u.userDetails?.firstName || "";
      const lastName = u.userDetails?.lastName || "";
      const fullName = `${firstName} ${lastName}`;
      
      if (typeFilter !== "all" && u.type !== typeFilter) return false;
      if (
        search &&
        !fullName.toLowerCase().includes(search.toLowerCase()) &&
        !u.username.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      return true;
    });
  }, [search, typeFilter]);

  const handleAddUser = () => {
    setEditUser(null);
    setShowDialog(true);
  };

  const handleEditUser = (user: ApiUser) => {
    setEditUser(user);
    setShowDialog(true);
  };

  const handleDeleteUser = (userId: string) => {
    setDeleteId(userId);
  };

  const handleConfirmDelete = () => {
    setDeleteId(null);
  };

  const handleManageRoles = (user: ApiUser) => {
    console.log("Manage roles for", user.username);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Manage Users & Roles</h1>
          <p className="text-muted-foreground">View users and manage custom role assignments in one place</p>
        </div>
        <Button onClick={handleAddUser}>
          <Plus className="w-4 h-4 mr-1" /> Add User
        </Button>
      </div>

      <StatsCards users={mockUsers} />

      <UserFilters
        search={search}
        onSearchChange={setSearch}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
      />

      <UsersTable
        users={filtered}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
        onManageRoles={handleManageRoles}
      />

      <UserDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        user={editUser}
      />

      <DeleteConfirmationDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

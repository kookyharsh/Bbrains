"use client";

import { useEffect, useMemo, useState } from "react";
import { BriefcaseBusiness } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/services/api/client";
import type { ApiUser } from "@/lib/types/api";
import { CrudDrawer } from "@/features/admin/components/CrudDrawer";
import { StatsCards } from "./_components/StatsCards";
import { UserFilters } from "./_components/UserFilters";
import { UsersTable } from "./_components/UsersTable";
import { UserRolesDialog } from "./_components/UserRolesDialog";
import { DeleteConfirmationDialog } from "./_components/DeleteConfirmationDialog";
import { ManagerForm } from "./_components/ManagerForm";
import { emptyManagerForm, hasManagerRole, type ManagerForm as ManagerFormType } from "./_types";

export default function ManageUsersPage() {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState<ManagerFormType>(emptyManagerForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [roleDialogUser, setRoleDialogUser] = useState<ApiUser | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadUsers() {
      try {
        setLoading(true);
        const response = await api.get<ApiUser[]>("/roles/users");
        if (mounted) {
          if (response.success) {
            setUsers(response.data || []);
          } else {
            toast.error(response.message || "Failed to load users");
          }
        }
      } catch (error) {
        console.error(error);
        if (mounted) toast.error("Failed to load users");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadUsers();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    return users.filter((user) => {
      const firstName = user.userDetails?.firstName || "";
      const lastName = user.userDetails?.lastName || "";
      const fullName = `${firstName} ${lastName}`.trim().toLowerCase();
      const query = search.toLowerCase();

      if (typeFilter === "manager" && !hasManagerRole(user)) return false;
      if (typeFilter !== "all" && typeFilter !== "manager" && user.type !== typeFilter) return false;

      if (
        query &&
        !fullName.includes(query) &&
        !user.username.toLowerCase().includes(query) &&
        !user.email.toLowerCase().includes(query)
      ) {
        return false;
      }

      return true;
    });
  }, [search, typeFilter, users]);

  function handleAddManager() {
    setForm(emptyManagerForm);
    setShowDialog(true);
  }

  async function handleCreateManager() {
    if (!form.username.trim() || !form.email.trim() || !form.firstName.trim() || !form.lastName.trim()) {
      toast.error("Please fill in the required manager details");
      return;
    }
    if (form.password.length < 8) {
      toast.error("Temporary password must be at least 8 characters");
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setSubmitting(true);
      const response = await api.post<ApiUser>("/user/managers", {
        username: form.username,
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        sex: form.sex,
        dob: form.dob || "1995-01-01",
        phone: form.phone || undefined,
        bio: form.bio || undefined,
        ...(form.collegeId.trim() ? { collegeId: Number(form.collegeId) } : {}),
      });

      if (response.success && response.data) {
        setUsers((prev) => [response.data as ApiUser, ...prev]);
        setShowDialog(false);
        toast.success("Manager account created");
      } else {
        toast.error(response.message || "Failed to create manager");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to create manager");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteId) return;

    try {
      const response = await api.delete(`/user/delete/${deleteId}`);
      if (response.success) {
        setUsers((prev) => prev.filter((user) => user.id !== deleteId));
        toast.success("User deleted");
      } else {
        toast.error(response.message || "Failed to delete user");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete user");
    } finally {
      setDeleteId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Manage Users & Roles</h1>
          <p className="text-muted-foreground">Create manager accounts and manage custom role assignments in one place</p>
        </div>
      </div>

      <StatsCards users={users} />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <UserFilters
          search={search}
          onSearchChange={setSearch}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
        />
        <button
          type="button"
          onClick={handleAddManager}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
        >
          <BriefcaseBusiness className="h-4 w-4" />
          Add Manager
        </button>
      </div>

      <UsersTable
        users={filtered}
        loading={loading}
        onDelete={setDeleteId}
        onManageRoles={setRoleDialogUser}
      />

      <CrudDrawer
        open={showDialog}
        onClose={() => !submitting && setShowDialog(false)}
        title="Add Manager"
        description="Creates a staff account and assigns manager access."
        onSubmit={handleCreateManager}
        submitting={submitting}
        submitLabel="Create Manager"
      >
        <ManagerForm form={form} onChange={setForm} disabled={submitting} />
      </CrudDrawer>

      <UserRolesDialog
        open={!!roleDialogUser}
        onOpenChange={(open) => !open && setRoleDialogUser(null)}
        userId={roleDialogUser?.id ?? null}
        username={roleDialogUser?.username ?? ""}
      />

      <DeleteConfirmationDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { RolesClient } from "@/app/(dashboard)/admin/roles/RolesClient";
import { fetchRolesData } from "@/app/(dashboard)/admin/roles/data";
import type { Role, UserWithRoles } from "@/app/(dashboard)/admin/roles/_types";

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const data = await fetchRolesData();
        if (mounted) {
          setRoles(data.roles);
          setUsers(data.users);
        }
      } catch (error) {
        console.error("Failed to fetch roles data:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="size-6 animate-spin text-muted-foreground/50" />
      </div>
    );
  }

  return <RolesClient initialRoles={roles} initialUsers={users} />;
}

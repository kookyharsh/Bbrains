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
          const normalizedRoles = (data.roles || []).map((r: unknown) => {
            if (typeof r === 'string') return { id: r, name: r, description: '', users: 0, permissions: [] }
            if (r && typeof r === 'object') {
              const roleObj = r as Record<string, unknown>
              const roleCount =
                roleObj._count && typeof roleObj._count === "object"
                  ? (roleObj._count as Record<string, unknown>)
                  : null
              const rawPermissions = Array.isArray(roleObj.permissions) ? roleObj.permissions : []

              return {
                id:
                  typeof roleObj.id === "string" || typeof roleObj.id === "number"
                    ? roleObj.id
                    : Math.random().toString(),
                name: typeof roleObj.name === 'string' ? roleObj.name : 'Unknown',
                description: typeof roleObj.description === 'string' ? roleObj.description : '',
                users:
                  typeof roleObj.users === 'number'
                    ? roleObj.users
                    : typeof roleCount?.users === "number"
                      ? roleCount.users
                      : 0,
                permissions: rawPermissions.map((perm) => {
                  if (typeof perm === "string") return perm
                  if (perm && typeof perm === "object") {
                    const permObj = perm as Record<string, unknown>
                    if (typeof permObj.permission === "string") return permObj.permission
                    if (typeof permObj.name === "string") return permObj.name
                  }
                  return ""
                }).filter(Boolean),
              }
            }
            return { id: 'unknown', name: 'Unknown', description: '', users: 0, permissions: [] }
          })
          const normalizedUsers = (data.users || []).map((u: unknown) => {
            if (u && typeof u === 'object') {
              const userObj = u as Record<string, unknown>
              const userDetails =
                userObj.userDetails && typeof userObj.userDetails === "object"
                  ? (userObj.userDetails as Record<string, unknown>)
                  : null

              return {
                id: typeof userObj.id === 'string' ? userObj.id : '',
                username: typeof userObj.username === 'string' ? userObj.username : '',
                firstName: typeof userDetails?.firstName === 'string' ? userDetails.firstName : '',
                lastName: typeof userDetails?.lastName === 'string' ? userDetails.lastName : '',
                email: typeof userObj.email === 'string' ? userObj.email : '',
                avatar: typeof userDetails?.avatar === 'string' ? userDetails.avatar : undefined,
                grade: typeof userObj.type === 'string' ? userObj.type : '',
                roles: Array.isArray(userObj.roles)
                  ? userObj.roles.map((roleEntry) => {
                      if (typeof roleEntry === "string") return roleEntry
                      if (roleEntry && typeof roleEntry === "object") {
                        const roleWrapper = roleEntry as Record<string, unknown>
                        if (typeof roleWrapper.role === "string") return roleWrapper.role
                        if (roleWrapper.role && typeof roleWrapper.role === "object") {
                          const roleObj = roleWrapper.role as Record<string, unknown>
                          if (typeof roleObj.name === "string") return roleObj.name
                        }
                        if (typeof roleWrapper.name === "string") return roleWrapper.name
                      }
                      return ""
                    }).filter(Boolean)
                  : [],
              }
            }
            return { id: '', username: '', firstName: '', lastName: '', email: '', roles: [] }
          })
          setRoles(normalizedRoles);
          setUsers(normalizedUsers);
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

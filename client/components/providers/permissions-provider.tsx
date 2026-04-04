"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/services/supabase/client";
import { useUser } from "@/hooks/use-user";

type PermissionsContextType = {
  permissions: string[];
  roles: any[];
  isLoading: boolean;
  hasPermission: (key: string) => boolean;
};

const PermissionsContext = createContext<PermissionsContextType>({
  permissions: [],
  roles: [],
  isLoading: true,
  hasPermission: () => false,
});

export function PermissionsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!user || !supabase) {
      setPermissions([]);
      setRoles([]);
      setIsLoading(false);
      return;
    }

    const fetchPermissions = async () => {
      try {
        setIsLoading(true);
        // Fetch user's roles and permissions for their active college
        const { data: userRoles, error: rolesError } = await supabase
          .from("user_roles")
          .select(`
            role_id,
            role:role (
              id:role_id,
              name,
              color,
              is_system,
              is_default,
              college_id,
              permissions:role_permissions (
                permission:permission (
                  key
                ),
                enabled
              )
            )
          `)
          .eq("user_id", user.id);

        if (rolesError) throw rolesError;

        if (userRoles) {
          const activeRoles = userRoles.map((ur: any) => ur.role);
          setRoles(activeRoles);

          // Extract all enabled permission keys
          const activeKeys = new Set<string>();
          activeRoles.forEach((role: any) => {
            if (role?.permissions) {
              role.permissions.forEach((rp: any) => {
                if (rp.enabled && rp.permission?.key) {
                  activeKeys.add(rp.permission.key);
                }
              });
            }
          });
          
          const finalPerms = Array.from(activeKeys);
          console.log("PermissionsProvider: Calculated active keys", { userId: user.id, count: finalPerms.length, keys: finalPerms });
          setPermissions(finalPerms);
        }
      } catch (err) {
        console.error("Error fetching permissions:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPermissions();

    // Subscribe to realtime changes
    const rolePermissionsChannel = supabase
      .channel("role_permissions_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "role_permissions" },
        () => {
          // Re-fetch when permissions change
          fetchPermissions();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user_roles", filter: `user_id=eq.${user.id}` },
        () => {
          fetchPermissions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(rolePermissionsChannel);
    };
  }, [user, supabase]);

  // Utility to check permission
  const hasPermission = (key: string) => {
    // If the user has a superadmin role, they inherently have all permissions
    const isSuperAdmin = roles.some((r) => r?.name?.toLowerCase() === "superadmin");
    if (isSuperAdmin) return true;
    
    // If the user has administrator permission, they bypass all other permission checks
    const hasAdminPermission = permissions.includes("administrator");
    if (hasAdminPermission) return true;
    
    return permissions.includes(key);
  };

  return (
    <PermissionsContext.Provider value={{ permissions, roles, isLoading, hasPermission }}>
      {children}
    </PermissionsContext.Provider>
  );
}

export const usePermissionsContext = () => useContext(PermissionsContext);

export function useHasPermission(key: string): boolean {
  const { hasPermission, isLoading } = usePermissionsContext();
  
  // While loading, we don't know yet - return true to avoid blocking UI
  // The actual check will happen once permissions are loaded
  if (isLoading) return true;
  
  return hasPermission(key);
}

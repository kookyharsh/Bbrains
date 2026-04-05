"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { createClient } from "@/services/supabase/client";
import { useUser } from "@/hooks/use-user";
import RoleList from "./_components/RoleList";
import RoleDetail from "./_components/RoleDetail";
import type { Role, Permission, UserWithRoles } from "./_types";

type RoleRelation = {
  position?: number | null;
  name?: string | null;
};

type RawRole = Role & {
  is_default: boolean;
  is_system: boolean;
  college_id?: number | null;
};

type RawUser = {
  user_id: string;
  username: string;
  user_details?: Array<{
    first_name?: string | null;
    last_name?: string | null;
    avatar?: string | null;
  }>;
  user_roles: Array<{
    role_id: number;
  }>;
};

type RawUserRole = {
  role_id: number;
  role: RoleRelation | RoleRelation[] | null;
};

export default function RolesPage() {
  const { user, loading: userLoading } = useUser();
  const supabase = createClient();
  
  const [roles, setRoles] = useState<Role[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [isMobileListVisible, setIsMobileListVisible] = useState(true);
  const [userLowestPosition, setUserLowestPosition] = useState<number>(Infinity);
  const [isUserSuperAdmin, setIsUserSuperAdmin] = useState(false);

  const normalizeRoleRelation = (roleRelation: RoleRelation | RoleRelation[] | null): RoleRelation | null => {
    if (Array.isArray(roleRelation)) {
      return roleRelation[0] ?? null;
    }

    return roleRelation ?? null;
  };

  const loadData = useCallback(async (collegeId: number, currentUser: NonNullable<typeof user>) => {
    setLoading(true);
    setLoadError(null);
    try {
      // Fetch Roles (global + college-specific)
      const { data: rolesData, error: rolesError } = await supabase
        .from("role")
        .select(`
          id:role_id, 
          name, 
          description, 
          color, 
          is_default, 
          is_system, 
          position, 
          college_id,
          permissions:role_permissions (
            enabled,
            permission:permission ( 
              id:permission_id, 
              key, 
              label, 
              description, 
              category 
            )
          ),
          _count:user_roles ( count )
        `)
        .or(`college_id.eq.${collegeId},college_id.is.null`)
        .order('position', { ascending: true });

      if (rolesError) throw rolesError;

      // Map snake_case to camelCase
      const formattedRoles = (rolesData ?? []).map((r: RawRole) => ({
        ...r,
        isDefault: r.is_default,
        isSystem: r.is_system,
        collegeId: r.college_id,
      })) as Role[];

      setRoles(formattedRoles);

      // Fetch all available permissions for the matrix
      const { data: permsData, error: permsError } = await supabase
        .from("permission")
        .select(`
          id:permission_id,
          key,
          label,
          description,
          category
        `);
      
      if (permsError) throw permsError;
      console.log("Fetched permissions:", permsData?.length);
      setAllPermissions(permsData as Permission[]);

      // For managing members, we would typically paginate, but for now we fetch users in the college
      // Since Prisma uses `user`, but Supabase query is direct:
      const { data: usersData, error: usersError } = await supabase
        .from("user")
        .select(`
          user_id, username,
          user_details ( first_name, last_name, avatar ),
          user_roles ( role_id )
        `)
        .eq("college_id", collegeId);
      
      if (!usersError && usersData) {
        const formattedUsers = (usersData as RawUser[]).map((u) => ({
          id: u.user_id,
          username: u.username,
          firstName: u.user_details?.[0]?.first_name || "",
          lastName: u.user_details?.[0]?.last_name || "",
          avatar: u.user_details?.[0]?.avatar ?? undefined,
          roles: u.user_roles.map((ur) => ur.role_id.toString())
        })) as UserWithRoles[];
        setUsers(formattedUsers);
      }

      // Fetch current user's role positions for hierarchy
      const { data: userRolesData, error: userRolesError } = await supabase
        .from("user_roles")
        .select("role_id, role:role(position, name)")
        .eq("user_id", currentUser.id);
      
      if (userRolesError) console.error("Error fetching user roles for hierarchy:", userRolesError);

      if (userRolesData && userRolesData.length > 0) {
        const normalizedUserRoles = (userRolesData as RawUserRole[]).map((ur) =>
          normalizeRoleRelation(ur.role)
        );
        const positions = normalizedUserRoles.map((role) => role?.position ?? 1000);
        const minPos = Math.min(...positions);
        const isSuper = normalizedUserRoles.some((role) =>
          role?.name?.toLowerCase() === "superadmin"
        );
        
        console.log("Hierarchy Debug:", {
          userId: currentUser.id,
          roles: normalizedUserRoles.map((role) => role?.name),
          minPos,
          isSuper
        });
        
        setUserLowestPosition(minPos);
        setIsUserSuperAdmin(isSuper);
      } else {
        console.warn("No roles found for current user, hierarchy management will be restricted.");
        setUserLowestPosition(1000); // Default to very low authority
        setIsUserSuperAdmin(false);
      }

    } catch (error) {
      console.error("Failed to load roles data:", error);
      setLoadError("Failed to load roles. Check console/network, and verify database columns + RLS policies.");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    if (userLoading) return;
    if (!user?.collegeId) {
      setLoading(false);
      return;
    }

    const collegeId = user.collegeId;
    loadData(collegeId, user);

    // Subscribe to realtime role updates
    const channel = supabase
      .channel("admin_roles_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "role" },
        () => loadData(collegeId, user)
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "role_permissions" },
        () => loadData(collegeId, user)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadData, user, userLoading, supabase]);

  const handleSelectRole = (id: number) => {
    setSelectedRoleId(id);
    setIsMobileListVisible(false);
  };

  const handleBackToList = () => {
    setIsMobileListVisible(true);
    setSelectedRoleId(null);
  };

  if (userLoading || loading) {
    return (
      <div className="flex h-full items-center justify-center py-8">
        <Loader2 className="size-6 animate-spin text-muted-foreground/50" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-[calc(100vh-4.5rem)] items-center justify-center py-8 text-[#dbdee1]">
        <div className="text-center">
          <h2 className="mb-2 text-lg font-semibold">Please log in to manage roles</h2>
          <p className="text-sm text-[#80848e]">No active session found.</p>
        </div>
      </div>
    );
  }

  if (!user.collegeId) {
    return (
      <div className="flex h-[calc(100vh-4.5rem)] items-center justify-center py-8 text-[#dbdee1]">
        <div className="text-center">
          <h2 className="mb-2 text-lg font-semibold">College not set</h2>
          <p className="text-sm text-[#80848e]">This page needs `user.collegeId` to load roles.</p>
        </div>
      </div>
    );
  }

  const selectedRole = roles.find((r) => r.id === selectedRoleId) || null;
  const currentCollegeId = user.collegeId!;

  return (
    <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden bg-[#313338] text-[#dbdee1] font-sans">
      {/* Left Panel: Role List */}
      <div
        className={`${
          isMobileListVisible ? "flex" : "hidden"
        } md:flex w-full md:w-64 lg:w-80 flex-col bg-[#2b2d31] border-r border-black/20`}
      >
        {loadError ? (
          <div className="p-4 text-sm text-[#f23f43]">{loadError}</div>
        ) : null}
        <RoleList 
          roles={roles} 
          selectedRoleId={selectedRoleId} 
          onSelectRole={handleSelectRole} 
          collegeId={currentCollegeId}
          onRoleCreated={() => loadData(currentCollegeId, user)}
          userLowestPosition={userLowestPosition}
          isUserSuperAdmin={isUserSuperAdmin}
        />
      </div>

      {/* Right Panel: Role Detail */}
      <div
        className={`${
          !isMobileListVisible ? "flex" : "hidden"
        } md:flex flex-1 flex-col bg-[#313338] overflow-hidden relative`}
      >
        {selectedRole ? (
          <RoleDetail 
            role={selectedRole} 
            allPermissions={allPermissions}
            allUsers={users}
            onBack={handleBackToList}
            onUpdate={() => loadData(currentCollegeId, user)}
            userLowestPosition={userLowestPosition}
            isUserSuperAdmin={isUserSuperAdmin}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[#80848e]">
            Select a role to manage its settings
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import type { Role, Permission } from "../_types";
import { createClient } from "@/services/supabase/client";

interface PermissionsTabProps {
  role: Role;
  allPermissions: Permission[];
  isSelectedRoleSuperAdmin: boolean;
  onUpdate: () => void;
  userLowestPosition: number;
  isUserSuperAdmin: boolean;
}

export default function PermissionsTab({ role, allPermissions, isSelectedRoleSuperAdmin, onUpdate, userLowestPosition, isUserSuperAdmin }: PermissionsTabProps) {
  const [search, setSearch] = useState("");
  // Local state for toggles: { [permId]: enabled }
  const [pendingPermissions, setPendingPermissions] = useState<Record<number, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const supabase = createClient();

  const isHierarchyLocked = role.position <= userLowestPosition && !isUserSuperAdmin;

  // Initialize local state from role permissions
  useEffect(() => {
    const initial: Record<number, boolean> = {};
    allPermissions.forEach(p => {
      const isEnabled = role.permissions?.some(rp => rp.permission?.key === p.key && rp.enabled) || false;
      initial[p.id] = isEnabled;
    });
    setPendingPermissions(initial);
  }, [role, allPermissions]);

  const handleToggle = (permissionId: number) => {
    if (isSelectedRoleSuperAdmin || isHierarchyLocked) return;
    
    setPendingPermissions(prev => ({
      ...prev,
      [permissionId]: !prev[permissionId]
    }));
  };

  const handleReset = () => {
    const initial: Record<number, boolean> = {};
    allPermissions.forEach(p => {
      const isEnabled = role.permissions?.some(rp => rp.permission?.key === p.key && rp.enabled) || false;
      initial[p.id] = isEnabled;
    });
    setPendingPermissions(initial);
  };

  const handleSave = async () => {
    if (isSelectedRoleSuperAdmin || isHierarchyLocked) return;
    setIsSaving(true);
    try {
      // For each permission, upsert the record
      const updates = Object.entries(pendingPermissions).map(([id, enabled]) => ({
        role_id: role.id,
        permission_id: parseInt(id),
        enabled
      }));

      const { error } = await supabase
        .from("role_permissions")
        .upsert(updates, { onConflict: 'role_id,permission_id' });
      
      if (error) throw error;
      onUpdate();
    } catch (err) {
      console.error("Failed to save permissions:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Check if anything actually changed
  const hasChanges = allPermissions.some(p => {
    const originalEnabled = role.permissions?.some(rp => rp.permission?.key === p.key && rp.enabled) || false;
    return pendingPermissions[p.id] !== originalEnabled;
  });

  // Group permissions
  const filteredPerms = allPermissions.filter((p) =>
    p.label.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = filteredPerms.reduce((acc, p) => {
    const cat = p.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-black/20 p-4 shrink-0">
        <div className="relative">
          <input
            type="text"
            placeholder="Search permissions"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded bg-[#1e1f22] py-2 pl-9 pr-4 text-sm text-[#dbdee1] placeholder-[#949ba4] outline-none focus:ring-2 focus:ring-[#5865f2]"
          />
          <Search className="absolute left-3 top-2.5 size-4 text-[#949ba4]" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-24">
        {isSelectedRoleSuperAdmin && (
          <div className="rounded bg-[#f23f42]/10 p-4 text-sm text-[#f23f42] border border-[#f23f42]/20">
            SuperAdmin has all permissions by default. You cannot modify permissions for this role.
          </div>
        )}

        {isHierarchyLocked && !isSelectedRoleSuperAdmin && (
          <div className="rounded bg-[#f59e0b]/10 p-4 text-sm text-[#f59e0b] border border-[#f59e0b]/20">
            This role is at or above your own hierarchy position. You cannot modify its permissions.
          </div>
        )}

        {Object.entries(grouped).map(([category, perms]) => (
          <div key={category} className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#dbdee1]">{category}</h3>
            
            <div className="rounded-md bg-[#2b2d31] divide-y divide-black/10">
              {perms.map((perm) => {
                const isEnabled = isSelectedRoleSuperAdmin ? true : (pendingPermissions[perm.id] || false);

                return (
                  <div key={perm.id} className="flex items-start justify-between p-4">
                    <div className="pr-4">
                      <div className="text-sm font-medium text-[#dbdee1]">{perm.label}</div>
                      {perm.description && (
                        <div className="mt-1 text-sm text-[#949ba4] leading-snug">
                          {perm.description}
                        </div>
                      )}
                    </div>
                    
                    {/* Toggle Switch */}
                    <button
                      type="button"
                      disabled={isSelectedRoleSuperAdmin || isHierarchyLocked}
                      onClick={() => handleToggle(perm.id)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                        isEnabled ? "bg-[#3ba55c]" : "bg-[#80848e]"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          isEnabled ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        
        {Object.keys(grouped).length === 0 && (
          <div className="text-center text-[#949ba4] py-8">
            No permissions found.
          </div>
        )}
      </div>

      {/* Unsaved Changes Bar */}
      {hasChanges && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl animate-in slide-in-from-bottom-5 rounded-lg bg-[#111214] p-3 shadow-lg flex items-center justify-between z-50">
          <p className="text-sm text-white font-medium pl-2">Careful — you have unsaved changes!</p>
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-white hover:underline disabled:opacity-50"
            >
              Reset
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="rounded bg-[#248046] px-4 py-2 text-sm font-medium text-white hover:bg-[#1a6334] transition-colors disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

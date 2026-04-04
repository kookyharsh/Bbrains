"use client";

import { useState } from "react";
import { Search, UserMinus, UserPlus } from "lucide-react";
import type { Role, UserWithRoles } from "../_types";
import { createClient } from "@/services/supabase/client";

interface ManageMembersTabProps {
  role: Role;
  allUsers: UserWithRoles[];
  isSuperAdmin: boolean;
  onUpdate: () => void;
  userLowestPosition: number;
  isUserSuperAdmin: boolean;
}

export default function ManageMembersTab({ role, allUsers, isSuperAdmin, onUpdate, userLowestPosition, isUserSuperAdmin }: ManageMembersTabProps) {
  const [search, setSearch] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const supabase = createClient();

  const members = allUsers.filter((u) => u.roles.includes(role.id.toString()));
  const nonMembers = allUsers.filter((u) => !u.roles.includes(role.id.toString()));

  const isHierarchyLocked = role.position <= userLowestPosition && !isUserSuperAdmin;

  const handleAddMember = async (userId: string) => {
    if (isSuperAdmin || isHierarchyLocked) return;
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role_id: role.id });
      
      if (error) throw error;
      onUpdate();
    } catch (err) {
      console.error("Failed to add member:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (isSuperAdmin || isHierarchyLocked) return;
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .match({ user_id: userId, role_id: role.id });
      
      if (error) throw error;
      onUpdate();
    } catch (err) {
      console.error("Failed to remove member:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredMembers = members.filter((u) =>
    (u.firstName + " " + u.lastName).toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  const filteredNonMembers = nonMembers.filter((u) =>
    (u.firstName + " " + u.lastName).toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-black/20 p-4 shrink-0">
        <div className="relative">
          <input
            type="text"
            placeholder="Search members"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded bg-[#1e1f22] py-2 pl-9 pr-4 text-sm text-[#dbdee1] placeholder-[#949ba4] outline-none focus:ring-2 focus:ring-[#5865f2]"
          />
          <Search className="absolute left-3 top-2.5 size-4 text-[#949ba4]" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {isSuperAdmin && (
          <div className="rounded bg-[#f23f42]/10 p-4 text-sm text-[#f23f42] border border-[#f23f42]/20">
            SuperAdmin membership is managed securely at the database level.
          </div>
        )}

        {isHierarchyLocked && !isSuperAdmin && (
          <div className="rounded bg-[#f59e0b]/10 p-4 text-sm text-[#f59e0b] border border-[#f59e0b]/20">
            This role is at or above your own hierarchy position. You cannot manage its members.
          </div>
        )}

        {/* Current Members */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#dbdee1]">
            Members ({members.length})
          </h3>
          <div className="space-y-1">
            {filteredMembers.length > 0 ? (
              filteredMembers.map((user) => (
                <div key={user.id} className="flex items-center justify-between rounded p-2 hover:bg-[#2b2d31]">
                  <div className="flex items-center gap-3">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.username} className="size-8 rounded-full" />
                    ) : (
                      <div className="flex size-8 items-center justify-center rounded-full bg-[#5865f2] text-white font-bold">
                        {user.firstName?.charAt(0) || user.username?.charAt(0) || "?"}
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-medium text-[#dbdee1]">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-xs text-[#949ba4]">@{user.username}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveMember(user.id)}
                    disabled={isSuperAdmin || isHierarchyLocked || isProcessing}
                    className="p-2 text-[#949ba4] hover:text-[#f23f42] disabled:opacity-50"
                    title="Remove from role"
                  >
                    <UserMinus className="size-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-sm text-[#949ba4]">No members match your search.</div>
            )}
          </div>
        </div>

        {/* Add Members */}
        {!isSuperAdmin && !isHierarchyLocked && (
          <div className="space-y-4 pt-6 border-t border-black/20">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#dbdee1]">
              Add Members
            </h3>
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {filteredNonMembers.length > 0 ? (
                filteredNonMembers.slice(0, 20).map((user) => (
                  <div key={user.id} className="flex items-center justify-between rounded p-2 hover:bg-[#2b2d31]">
                    <div className="flex items-center gap-3">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.username} className="size-8 rounded-full" />
                      ) : (
                        <div className="flex size-8 items-center justify-center rounded-full bg-[#5865f2] text-white font-bold">
                          {user.firstName?.charAt(0) || user.username?.charAt(0) || "?"}
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-[#dbdee1]">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-xs text-[#949ba4]">@{user.username}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddMember(user.id)}
                      disabled={isProcessing}
                      className="p-2 text-[#949ba4] hover:text-[#3ba55c] disabled:opacity-50"
                      title="Add to role"
                    >
                      <UserPlus className="size-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-sm text-[#949ba4]">No users available to add.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

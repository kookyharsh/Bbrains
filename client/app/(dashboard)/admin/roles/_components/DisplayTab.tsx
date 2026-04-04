"use client";

import { useState, useEffect } from "react";
import type { Role } from "../_types";
import { createClient } from "@/services/supabase/client";
import { Trash2, AlertTriangle } from "lucide-react";

interface DisplayTabProps {
  role: Role;
  isSuperAdmin: boolean;
  onUpdate: () => void;
  userLowestPosition: number;
  isUserSuperAdmin: boolean;
}

export default function DisplayTab({ role, isSuperAdmin, onUpdate, userLowestPosition, isUserSuperAdmin }: DisplayTabProps) {
  const [name, setName] = useState(role.name);
  const [color, setColor] = useState(role.color || "#99aab5");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    setName(role.name);
    setColor(role.color || "#99aab5");
  }, [role]);

  const hasChanges = name !== role.name || color !== (role.color || "#99aab5");

  const handleSave = async () => {
    if (isSuperAdmin) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("role")
        .update({ name, color })
        .eq("role_id", role.id);
      
      if (error) throw error;
      onUpdate();
    } catch (err) {
      console.error("Failed to save display settings:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setName(role.name);
    setColor(role.color || "#99aab5");
  };

  const canDeleteRole =
    !role.isSystem && (isUserSuperAdmin || role.position > userLowestPosition);

  const handleDelete = async () => {
    if (!canDeleteRole) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("role")
        .delete()
        .eq("role_id", role.id);
      
      if (error) throw error;
      onUpdate();
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error("Failed to delete role:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const isSystemLocked = role.isSystem && !isUserSuperAdmin;

  return (
    <div className="flex h-full flex-col">
      {isSystemLocked && (
          <div className="m-5 rounded bg-[#f59e0b]/10 p-3 text-sm text-[#f59e0b] border border-[#f59e0b]/20">
            This is a system role. Its name and color are protected, but you can still manage its permissions and members.
          </div>
        )}
      <div className="p-6 pt-1 space-y-6 flex-1">
        {/* Name */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[#dbdee1]">
            Role Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isSuperAdmin || isSystemLocked}
            className="w-full rounded bg-[#1e1f22] p-2.5 text-sm text-[#dbdee1] outline-none focus:ring-2 focus:ring-[#5865f2] disabled:opacity-50"
          />
        </div>

        {/* Color */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[#dbdee1]">
            Role Color
          </label>
          <div className="flex items-center gap-4">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              disabled={isSuperAdmin || isSystemLocked}
              className="h-10 w-20 cursor-pointer rounded bg-[#1e1f22] p-1 disabled:opacity-50"
            />
            <div className="text-sm text-[#949ba4] font-mono">{color}</div>
          </div>
        </div>

        {isSuperAdmin && (
          <div className="rounded bg-[#f23f42]/10 p-3 text-sm text-[#f23f42] border border-[#f23f42]/20">
            You cannot edit the display properties of the SuperAdmin role.
          </div>
        )}

        

        {canDeleteRole && (
          <div className="border-t border-black/20 pt-6">
            <div className="rounded-lg border border-[#f23f42]/20 bg-[#f23f42]/5 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="size-5 text-[#f23f42] shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-[#f23f42]">Danger Zone</h3>
                  <p className="mt-1 text-xs text-[#949ba4]">
                    Once you delete this role, it cannot be recovered. Users with this role will lose it.
                  </p>
                  {!showDeleteConfirm ? (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="mt-3 inline-flex items-center gap-2 rounded bg-[#f23f42] px-4 py-2 text-sm font-medium text-white hover:bg-[#d32f33] transition-colors"
                    >
                      <Trash2 className="size-4" />
                      Delete Role
                    </button>
                  ) : (
                    <div className="mt-3 space-y-3">
                      <div className="rounded bg-[#1e1f22] p-3 text-xs text-[#dbdee1]">
                        Are you sure you want to delete <strong>{role.name}</strong>? This action is permanent.
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowDeleteConfirm(false)}
                          disabled={isDeleting}
                          className="px-4 py-2 text-sm font-medium text-[#949ba4] hover:text-[#dbdee1] transition-colors disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleDelete}
                          disabled={isDeleting}
                          className="rounded bg-[#f23f42] px-4 py-2 text-sm font-medium text-white hover:bg-[#d32f33] transition-colors disabled:opacity-50"
                        >
                          {isDeleting ? "Deleting..." : "Confirm Delete"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Unsaved Changes Bar */}
      {hasChanges && !isSuperAdmin && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl animate-in slide-in-from-bottom-5 rounded-lg bg-[#111214] p-3 shadow-lg flex items-center justify-between">
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

"use client";

import { useState, useMemo } from "react";
import { Plus, Shield, Lock, Search, GripVertical } from "lucide-react";
import type { Role } from "../_types";
import { createClient } from "@/services/supabase/client";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface RoleListProps {
  roles: Role[];
  selectedRoleId: number | null;
  onSelectRole: (id: number) => void;
  collegeId: number | undefined;
  onRoleCreated: () => void;
  userLowestPosition: number;
  isUserSuperAdmin: boolean;
}

function SortableRoleItem({
  role,
  isSelected,
  isLocked,
  onSelect,
}: {
  role: Role;
  isSelected: boolean;
  isLocked: boolean;
  onSelect: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: role.id, disabled: isLocked });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isSuperAdminRole = role.name.toLowerCase() === "superadmin";

  return (
    <div ref={setNodeRef} style={style} className="group">
      <button
        onClick={onSelect}
        className={`flex w-full items-center justify-between rounded p-2 text-left transition-colors ${
          isSelected
            ? "bg-[#404249] text-white"
            : isLocked
            ? "text-[#6d6f78] cursor-default opacity-70"
            : "text-[#949ba4] hover:bg-[#35373c] hover:text-[#dbdee1]"
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          {!isLocked && (
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <GripVertical className="size-3.5 text-[#6d6f78]" />
            </div>
          )}
          {isLocked && (
            <div className="w-5 flex items-center justify-center">
              <Lock className="size-3 text-[#6d6f78]" />
            </div>
          )}
          <div
            className="flex size-3 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: role.color || "#99aab5" }}
          >
            {isSuperAdminRole && <Shield className="size-2 text-[#2b2d31]" />}
          </div>
          <span className="truncate text-sm font-medium">{role.name}</span>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {role.isDefault && (
            <span className="rounded bg-[#5865f2]/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-[#5865f2]">
              Default
            </span>
          )}
        </div>
      </button>
    </div>
  );
}

export default function RoleList({
  roles,
  selectedRoleId,
  onSelectRole,
  collegeId,
  onRoleCreated,
  userLowestPosition,
  isUserSuperAdmin,
}: RoleListProps) {
  const [search, setSearch] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const supabase = createClient();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleCreateRole = async () => {
    if (!collegeId) return;
    setIsCreating(true);
    try {
      // Find current max position to put new role at the bottom (but before student if possible)
      const maxPos = Math.max(...roles.map(r => r.position < 100 ? r.position : 0), 4);
      
      const { data, error } = await supabase
        .from("role")
        .insert({
          name: "New Role",
          color: "#99aab5",
          college_id: collegeId,
          is_system: false,
          is_default: false,
          position: maxPos + 1,
        })
        .select("id:role_id")
        .single();

      if (error) throw error;

      onRoleCreated();
      if (data) {
        onSelectRole(data.id);
      }
    } catch (err) {
      console.error("Failed to create role:", err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sortedRoles.findIndex((r) => r.id === active.id);
    const newIndex = sortedRoles.findIndex((r) => r.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const draggedRole = sortedRoles[oldIndex];
    const targetRole = sortedRoles[newIndex];

    // Hierarchy check for dragging
    if (draggedRole.name.toLowerCase() === "superadmin" && !isUserSuperAdmin) return;
    if (draggedRole.position <= userLowestPosition && !isUserSuperAdmin) return;

    const newOrder = arrayMove(sortedRoles, oldIndex, newIndex);

    setIsReordering(true);
    try {
      const updates = newOrder.map((role, index) => ({
        role_id: role.id,
        position: index + 1, // Keep it 1-based
      }));

      // In a real app, we'd use a single RPC or batch update
      for (const update of updates) {
        await supabase
          .from("role")
          .update({ position: update.position })
          .eq("role_id", update.role_id);
      }

      onRoleCreated();
    } catch (err) {
      console.error("Failed to reorder roles:", err);
    } finally {
      setIsReordering(false);
    }
  };

  const sortedRoles = useMemo(
    () => [...roles].sort((a, b) => a.position - b.position),
    [roles]
  );

  const filteredRoles = useMemo(
    () => sortedRoles.filter((r) => r.name.toLowerCase().includes(search.toLowerCase())),
    [sortedRoles, search]
  );

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-black/20">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#949ba4]">
          Roles
        </h2>
        <button
          onClick={handleCreateRole}
          disabled={isCreating}
          className="text-[#949ba4] hover:text-[#dbdee1] transition-colors"
          title="Create Role"
        >
          <Plus className="size-4" />
        </button>
      </div>

      {/* Search */}
      <div className="p-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Search roles"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded bg-[#1e1f22] py-1.5 pl-8 pr-3 text-sm text-[#dbdee1] placeholder-[#949ba4] outline-none"
          />
          <Search className="absolute left-2.5 top-2 size-4 text-[#949ba4]" />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filteredRoles.map((r) => r.id)}
            strategy={verticalListSortingStrategy}
          >
            {filteredRoles.map((role) => {
              const isSelected = selectedRoleId === role.id;
              const isSuperAdminRole = role.name.toLowerCase() === "superadmin";
              
              // LOGIC: Higher position (lower number) manages lower position (higher number).
              // SuperAdmin (1) is ALWAYS locked for selection by ANYONE (even itself).
              // Other roles are locked if their position is LESS THAN OR EQUAL TO yours.
              // Example: Admin (2) can manage Manager (3) because 3 > 2.
              // Example: Admin (2) CANNOT manage Admin (2) because 2 <= 2.
              const isLocked =
                isSuperAdminRole ||
                (role.position <= userLowestPosition && !isUserSuperAdmin);

              return (
                <SortableRoleItem
                  key={role.id}
                  role={role}
                  isSelected={isSelected}
                  isLocked={isLocked}
                  onSelect={() => {
                    if (!isLocked) {
                      onSelectRole(role.id);
                    }
                  }}
                />
              );
            })}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}

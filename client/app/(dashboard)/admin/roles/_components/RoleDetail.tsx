"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import type { Role, Permission, UserWithRoles } from "../_types";
import DisplayTab from "./DisplayTab";
import PermissionsTab from "./PermissionsTab";
import ManageMembersTab from "./ManageMembersTab";

interface RoleDetailProps {
  role: Role;
  allPermissions: Permission[];
  allUsers: UserWithRoles[];
  onBack: () => void;
  onUpdate: () => void;
  userLowestPosition: number;
  isUserSuperAdmin: boolean;
}

type TabType = "display" | "permissions" | "members";

export default function RoleDetail({ role, allPermissions, allUsers, onBack, onUpdate, userLowestPosition, isUserSuperAdmin }: RoleDetailProps) {
  const [activeTab, setActiveTab] = useState<TabType>("display");

  const isSuperAdmin = role.name.toLowerCase() === "superadmin";

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-black/20 p-4 shrink-0">
        <button
          onClick={onBack}
          className="md:hidden flex items-center justify-center rounded-full p-2 hover:bg-[#3f4147] text-[#949ba4]"
        >
          <ArrowLeft className="size-5" />
        </button>
        <h2 className="text-lg font-bold text-white">Edit Role — {role.name}</h2>
      </div>

      {/* Tabs */}
      <div className="flex shrink-0 gap-4 border-b border-black/20 px-4">
        <button
          onClick={() => setActiveTab("display")}
          className={`border-b-2 px-2 py-3 text-sm font-medium transition-colors ${
            activeTab === "display"
              ? "border-[#dbdee1] text-[#dbdee1]"
              : "border-transparent text-[#949ba4] hover:border-[#949ba4] hover:text-[#dbdee1]"
          }`}
        >
          Display
        </button>
        <button
          onClick={() => setActiveTab("permissions")}
          className={`border-b-2 px-2 py-3 text-sm font-medium transition-colors ${
            activeTab === "permissions"
              ? "border-[#dbdee1] text-[#dbdee1]"
              : "border-transparent text-[#949ba4] hover:border-[#949ba4] hover:text-[#dbdee1]"
          }`}
        >
          Permissions
        </button>
        <button
          onClick={() => setActiveTab("members")}
          className={`border-b-2 px-2 py-3 text-sm font-medium transition-colors ${
            activeTab === "members"
              ? "border-[#dbdee1] text-[#dbdee1]"
              : "border-transparent text-[#949ba4] hover:border-[#949ba4] hover:text-[#dbdee1]"
          }`}
        >
          Manage Members
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto bg-[#313338] relative">
        {activeTab === "display" && <DisplayTab role={role} isSuperAdmin={isSuperAdmin} onUpdate={onUpdate} userLowestPosition={userLowestPosition} isUserSuperAdmin={isUserSuperAdmin} />}
        {activeTab === "permissions" && (
          <PermissionsTab role={role} allPermissions={allPermissions} isSelectedRoleSuperAdmin={isSuperAdmin} onUpdate={onUpdate} userLowestPosition={userLowestPosition} isUserSuperAdmin={isUserSuperAdmin} />
        )}
        {activeTab === "members" && (
          <ManageMembersTab role={role} allUsers={allUsers} isSuperAdmin={isSuperAdmin} onUpdate={onUpdate} userLowestPosition={userLowestPosition} isUserSuperAdmin={isUserSuperAdmin} />
        )}
      </div>
    </div>
  );
}

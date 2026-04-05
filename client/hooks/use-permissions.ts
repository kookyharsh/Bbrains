"use client";

import { usePermissionsContext } from "@/components/providers/permissions-provider";

export function usePermissions() {
  const context = usePermissionsContext();
  
  if (context === undefined) {
    throw new Error("usePermissions must be used within a PermissionsProvider");
  }

  return context;
}

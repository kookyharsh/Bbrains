export type Role = {
  id: number;
  name: string;
  description: string | null;
  color: string | null;
  isDefault: boolean;
  isSystem: boolean;
  position: number;
  permissions: { permission: { key: string; label: string; description: string; category: string }; enabled: boolean }[];
  _count?: { users: number };
};

export type Permission = {
  id: number;
  key: string;
  label: string;
  description: string | null;
  category: string;
};

export type UserWithRoles = {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  roles: string[];
  grade?: string;
};

export function getRoleBadgeColor(role: string): string {
  const roleColors: Record<string, string> = {
    super_admin: "bg-purple-100 text-purple-800 border-purple-200",
    admin: "bg-red-100 text-red-800 border-red-200",
    manager: "bg-orange-100 text-orange-800 border-orange-200",
    editor: "bg-blue-100 text-blue-800 border-blue-200",
    viewer: "bg-gray-100 text-gray-800 border-gray-200",
  }
  const normalizedRole = role.toLowerCase().replace(/\s+/g, "_")
  return roleColors[normalizedRole] || "bg-gray-100 text-gray-800 border-gray-200"
}

export const allPermissions = [
  "view_dashboard",
  "view_analytics",
  "view_users",
  "create_users",
  "edit_users",
  "delete_users",
  "manage_user_roles",
  "view_roles",
  "create_roles",
  "edit_roles",
  "delete_roles",
  "view_products",
  "create_products",
  "edit_products",
  "delete_products",
  "manage_product_inventory",
  "view_orders",
  "manage_orders",
  "view_subscriptions",
  "manage_subscriptions",
  "view_payments",
  "manage_payments",
  "view_invoices",
  "manage_invoices",
  "view_calendar",
  "manage_calendar",
  "view_reports",
  "manage_reports",
  "view_settings",
  "manage_settings",
  "view_audit_logs",
  "manage_audit_logs",
] as const;

export type AllPermissionsType = typeof allPermissions[number];

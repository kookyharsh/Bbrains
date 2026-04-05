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
  firstName: string;
  lastName: string;
  avatar?: string;
  roles: string[];
};

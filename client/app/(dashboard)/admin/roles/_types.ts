export interface Permission {
    id: number
    name: string
    description?: string
}

export interface Role {
    id: number
    name: string
    description?: string
    rank: number
    collegeId?: number | null
    users: number
    permissions: {
        permission: Permission
    }[]
}

export interface UserWithRoles {
    id: string
    username: string
    firstName: string
    lastName: string
    email: string
    avatar?: string
    grade?: string
    isSuperAdmin: boolean
    roles: {
        role: Role
    }[]
}

export const allPermissions = [
    // Academic
    "manage_courses",
    "manage_assignments",
    "manage_enrollments",
    "manage_grades",
    "view_submissions",
    "manage_submissions",
    "manage_attendance",
    // Content / Events
    "manage_announcements",
    "manage_suggestions",
    "create_events",
    "manage_events",
    // Marketplace
    "manage_products",
    "approve_products",
    "view_orders",
    "view_transactions",
    // User & Access
    "manage_users",
    "view_users",
    "manage_roles",
    "manage_permissions",
    "administrator",
    // Profile
    "manage_displayname",
    "change_nickname",
    // Communication
    "send_messages",
    "manage_messages",
    "mention_everyone",
    "pin_messages",
    // Finance
    "view_wallets",
    "manage_wallets",
    // System
    "manage_system_config",
    "view_audit_logs",
    "manage_gamification",
]

export function getRoleBadgeColor(role: string): string {
    switch (role) {
        case "Admin":
            return "bg-red-500/10 text-red-600 hover:bg-red-500/20"
        case "Teacher":
            return "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20"
        case "Staff":
            return "bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20"
        default:
            return "bg-green-500/10 text-green-600 hover:bg-green-500/20"
    }
}

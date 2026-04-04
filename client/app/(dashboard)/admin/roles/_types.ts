export interface Role {
    id: string | number
    name: string
    description?: string
    users: number
    permissions: string[]
}

export interface UserWithRoles {
    id: string
    username: string
    firstName: string
    lastName: string
    email: string
    avatar?: string
    grade?: string
    roles: string[]
}

export const allPermissions = [
    "manage_users",
    "manage_roles",
    "manage_courses",
    "view_audit_log",
    "manage_products",
    "view_stats",
    "manage_students",
    "manage_assignments",
    "grade_assignments",
    "manage_announcements",
    "view_courses",
    "submit_assignments",
    "use_wallet",
    "use_market",
    "use_chat",
    "view_users",
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

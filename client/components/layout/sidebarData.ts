import {
    Calendar, Home, MessageSquare, MessageSquarePlus,
    Megaphone, Wallet, Book, ShoppingCart, FileText,
    Library, CreditCard, Shield, LayoutDashboard, Wrench,
    GraduationCap, BarChart3, Settings2, ShoppingBag, UserCheck,
    Users, ArrowUpDown, Trophy, BookOpen, UserCog, CheckSquare,
    School, Key
} from "lucide-react";
import { LucideIcon } from "lucide-react";

export type Role = "student" | "teacher" | "admin";

export type SidebarUserRoleContext = {
    type?: string | null;
    roleNames?: Array<string | null | undefined>;
    isSuperAdmin?: boolean | null;
};

export type SubItem = {
    title: string;
    url: string;
    icon?: LucideIcon;
};

export type SidebarItem = {
    title: string;
    url: string;
    icon: LucideIcon;
    subItems?: SubItem[];
    superAdminOnly?: boolean;
};

export type SidebarGroup = {
    groupLabel?: string;  // undefined = no section header
    items: SidebarItem[];
};

// ─── Shared by all roles ───────────────────────────────────────────────────
const baseSidebarItems: SidebarItem[] = [
    { title: "Dashboard", url: "/dashboard", icon: Home },
    { title: "Announcements", url: "/announcements", icon: Megaphone },
    { title: "Exam/Assignments", url: "/assignments", icon: Book },
    { title: "Chat", url: "/chat", icon: MessageSquare },
    {
        title: "Wallet",
        url: "/wallet",
        icon: Wallet,
        subItems: [
            { title: "Payment History", url: "/wallet/payments", icon: CreditCard },
        ],
    },
    { title: "Calendar", url: "/calendar", icon: Calendar },
    {
        title: "Market",
        url: "/market",
        icon: ShoppingCart,
        subItems: [
            { title: "Browse", url: "/market", icon: ShoppingCart },
            { title: "Library", url: "/market/library", icon: Library },
        ],
    },
    { title: "Tools", url: "/tools", icon: Wrench },
];

// ─── Admin-only ────────────────────────────────────────────────────────────
const adminExtraItems: SidebarItem[] = [
    { title: "Overview",      url: "/admin/overview",      icon: LayoutDashboard },
    { title: "Colleges",      url: "/admin/colleges",      icon: School, superAdminOnly: true },
    { title: "Manage Users",  url: "/admin/users",         icon: UserCog },
    { title: "Teachers",      url: "/admin/teachers",      icon: UserCheck },
    { title: "Students",      url: "/admin/students",      icon: Users },
    { title: "Roles & Access",url: "/admin/roles",         icon: Shield },
    { title: "Academics",     url: "/admin/academics",     icon: GraduationCap },
    { title: "Assignments",   url: "/admin/assignments",   icon: BookOpen },
    { title: "Announcements", url: "/admin/announcements", icon: Megaphone },
    { title: "Products",      url: "/admin/products",      icon: ShoppingBag },
    { title: "Achievements",  url: "/admin/achievements",  icon: Trophy },
    { title: "XP & Levels",   url: "/admin/xpconfig",     icon: Trophy },
    { title: "Statistics",    url: "/admin/stats",         icon: BarChart3 },
    { title: "Audit Log",     url: "/admin/audit-log",     icon: FileText },
    { title: "Transactions",  url: "/admin/transactions",  icon: ArrowUpDown },
    { title: "System Config", url: "/admin/config",        icon: Settings2 },
    { title: "Suggestions",   url: "/admin/suggestions",   icon: MessageSquarePlus },
];

// ─── Teacher-only ──────────────────────────────────────────────────────────
const teacherExtraItems: SidebarItem[] = [
    { title: "Overview",      url: "/teacher/overview",      icon: LayoutDashboard },
    { title: "Assignments",   url: "/teacher/assignments",   icon: BookOpen },
    { title: "Grading",       url: "/teacher/grading",       icon: CheckSquare },
    { title: "Attendance",    url: "/teacher/attendance",    icon: Calendar },
    { title: "Students",      url: "/teacher/students",      icon: Users },
    { title: "Announcements", url: "/teacher/announcements", icon: Megaphone },
    { title: "Products",      url: "/teacher/products",      icon: ShoppingBag },
    { title: "Audit Log",     url: "/teacher/audit-log",     icon: FileText },
    { title: "Suggestions",   url: "/suggestions",          icon: MessageSquarePlus },
];

// ─── Role → grouped sidebar ────────────────────────────────────────────────
const extraItemsMap: Record<Role, { label: string; items: SidebarItem[] } | null> = {
    student: null,
    teacher: { label: "Teacher Panel", items: teacherExtraItems },
    admin:   { label: "Admin Panel",   items: adminExtraItems },
};

const normalizeRoleName = (value?: string | null) => value?.trim().toLowerCase() ?? "";

export function resolveSidebarRole(user?: SidebarUserRoleContext | null): Role {
    const hasRoleToken = (role: string, token: string) =>
        role === token || role.includes(token);

    if (user?.isSuperAdmin) {
        return "admin";
    }

    const assignedRoles = (user?.roleNames ?? []).map(normalizeRoleName);
    if (assignedRoles.some(role =>
        hasRoleToken(role, "admin") ||
        role === "super admin" ||
        role === "super_admin"
    )) {
        return "admin";
    }

    if (assignedRoles.some(role => hasRoleToken(role, "teacher"))) {
        return "teacher";
    }

    const userType = normalizeRoleName(user?.type);
    if (userType === "admin") {
        return "admin";
    }

    if (userType === "teacher") {
        return "teacher";
    }

    if (userType === "staff") {
        return "teacher";
    }

    return "student";
}

export function getSidebarGroups(role: Role, isSuperAdmin: boolean = false): SidebarGroup[] {
    const groups: SidebarGroup[] = [
        { items: baseSidebarItems },
    ];

    const extra = extraItemsMap[role];
    if (extra) {
        // Filter out superAdminOnly items if the user is not a Super Admin
        const filteredItems = extra.items.filter(item => !item.superAdminOnly || isSuperAdmin);
        groups.push({ groupLabel: extra.label, items: filteredItems });
    }

    return groups;
}

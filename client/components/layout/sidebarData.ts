import {
    Calendar, Home, MessageSquare, MessageSquarePlus,
    Megaphone, Wallet, Book, ShoppingCart, FileText,
    Library, CreditCard, Shield, Wrench,
    GraduationCap, BarChart3, Settings2, ShoppingBag, UserCheck,
    Users, ArrowUpDown, Trophy, BookOpen, UserCog, CheckSquare
} from "lucide-react";
import { LucideIcon } from "lucide-react";

export type Role =
    | "student"
    | "teacher"
    | "admin"
    | "staff"
    | "manager"
    | "superadmin"
    | "bbrains_official";

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
};

export type SidebarGroup = {
    groupLabel?: string;
    items: SidebarItem[];
};

function getDashboardUrl(primaryRole: Role): string {
    switch (primaryRole) {
        case "admin":
            return "/admin/overview";
        case "teacher":
            return "/teacher/overview";
        case "manager":
            return "/manager/overview";
        case "superadmin":
        case "bbrains_official":
            return "/superadmin/overview";
        default:
            return "/dashboard";
    }
}

function getBaseSidebarItems(primaryRole: Role): SidebarItem[] {
    return [
        { title: "Dashboard", url: getDashboardUrl(primaryRole), icon: Home },
        { title: "announcements", url: "/announcements", icon: Megaphone },
        { title: "Assignments", url: "/assignments", icon: Book },
        { title: "Chat", url: "/chat", icon: MessageSquare },
        { title: "My Transactions", url: "/transactions", icon: ArrowUpDown },
        {
            title: "Wallet",
            url: "/wallet",
            icon: Wallet,
            subItems: [
                { title: "Payment History", url: "/wallet/payments", icon: CreditCard },
            ],
        },
        {
            title: "Market",
            url: "/market",
            icon: ShoppingCart,
            subItems: [
                { title: "Browse", url: "/market", icon: ShoppingCart },
                { title: "My Products", url: "/products", icon: ShoppingBag },
                { title: "Library", url: "/library", icon: Library },
                { title: "Orders", url: "/orders", icon: FileText },
            ],
        },
        { title: "Tools", url: "/tools", icon: Wrench },
    ];
}

const bbrainsOfficialExtraItems: SidebarItem[] = [
    { title: "Achievements", url: "/admin/achievements", icon: Trophy },
    { title: "XP & Levels", url: "/admin/xpconfig", icon: Trophy },
    { title: "System Config", url: "/admin/config", icon: Settings2 },
];

const adminExtraItems: SidebarItem[] = [
    { title: "Manage Users", url: "/admin/users", icon: UserCog },
    { title: "Teachers", url: "/admin/teachers", icon: UserCheck },
    { title: "Students", url: "/admin/students", icon: Users },
    { title: "Roles & Access", url: "/admin/roles", icon: Shield },
    { title: "Academics", url: "/admin/academics", icon: GraduationCap },
    { title: "Assignments", url: "/admin/assignments", icon: BookOpen },
    { title: "Announcements", url: "/admin/announcements", icon: Megaphone },
    { title: "Products", url: "/admin/products", icon: ShoppingBag },
    { title: "Statistics", url: "/admin/stats", icon: BarChart3 },
    { title: "Audit Log", url: "/admin/audit-log", icon: FileText },
    { title: "Transactions", url: "/admin/transactions", icon: ArrowUpDown },
    { title: "System Config", url: "/admin/config", icon: Settings2 },
    { title: "Suggestions", url: "/admin/suggestions", icon: MessageSquarePlus },
];

const teacherExtraItems: SidebarItem[] = [
    { title: "Tests & Exams", url: "/teacher/assignments", icon: BookOpen },
    { title: "Grading", url: "/teacher/grading", icon: CheckSquare },
    { title: "Attendance", url: "/teacher/attendance", icon: Calendar },
    { title: "Students", url: "/teacher/students", icon: Users },
    { title: "Announcements", url: "/teacher/announcements", icon: Megaphone },
    { title: "Products", url: "/teacher/products", icon: ShoppingBag },
    { title: "Audit Log", url: "/teacher/audit-log", icon: FileText },
    { title: "Suggestions", url: "/admin/suggestions", icon: MessageSquarePlus },
];

const managerExtraItems: SidebarItem[] = [
    { title: "Classes", url: "/manager/classes", icon: BookOpen },
    { title: "Teachers", url: "/manager/teachers", icon: UserCheck },
    { title: "Students", url: "/manager/students", icon: Users },
    { title: "Transactions", url: "/manager/transactions", icon: ArrowUpDown },
];

const extraItemsMap: Record<Role, { label: string; items: SidebarItem[] } | null> = {
    student: null,
    teacher: { label: "Teacher Panel", items: teacherExtraItems },
    admin: { label: "Admin Panel", items: adminExtraItems },
    staff: null,
    manager: { label: "Manager Panel", items: managerExtraItems },
    superadmin: { label: "Admin Panel", items: adminExtraItems },
    bbrains_official: { label: "Bbrains Official", items: bbrainsOfficialExtraItems },
};

const allowedRoles: ReadonlySet<Role> = new Set<Role>([
    "student",
    "teacher",
    "admin",
    "staff",
    "manager",
    "superadmin",
    "bbrains_official",
]);

export function resolveRole(rawRole?: string | string[] | null): Role | Role[] {
    if (Array.isArray(rawRole)) {
        const result = rawRole.map((r) => resolveRole(r) as Role).filter(Boolean) as Role[];
        return result.length > 0 ? result : ["student"];
    }

    const normalized = rawRole?.trim().toLowerCase().replace(/[\s-]+/g, "_");
    if (!normalized) return "student";
    if (allowedRoles.has(normalized as Role)) return normalized as Role;
    return "student";
}

export function getSidebarGroups(role: Role | Role[]): SidebarGroup[] {
    const roles = Array.isArray(role) ? role : [role];
    const primaryRole = roles[0] || "student";

    const sharedItems = getBaseSidebarItems(primaryRole).filter((item) => {
        if (item.url !== "/transactions") return true;
        return primaryRole !== "admin" && primaryRole !== "superadmin" && primaryRole !== "bbrains_official";
    });

    if (primaryRole === "student") {
        const assignmentsIndex = sharedItems.findIndex((item) => item.url === "/assignments");
        sharedItems.splice(assignmentsIndex + 1, 0, { title: "Results", url: "/results", icon: Trophy });
    }

    const groups: SidebarGroup[] = [
        { items: sharedItems },
    ];

    for (const r of roles) {
        const extra = extraItemsMap[r];
        if (extra) {
            const existingLabel = groups.find((g) => g.groupLabel === extra.label);
            if (!existingLabel) {
                groups.push({ groupLabel: extra.label, items: extra.items });
            }
        }
    }

    return groups;
}

import {
    Calendar, Home, MessageSquare, MessageSquarePlus,
    Megaphone, Wallet, Book, ShoppingCart, FileText,
    Library, CreditCard, Shield, LayoutDashboard, Wrench,
    GraduationCap, BarChart3, Settings2, ShoppingBag, UserCheck,
    Users, ArrowUpDown, Trophy, BookOpen, UserCog, CheckSquare
} from "lucide-react";
import { LucideIcon } from "lucide-react";

export type Role = "student" | "teacher" | "admin" | "staff" | "manager" | "bbrains_official";

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
    groupLabel?: string;  // undefined = no section header
    items: SidebarItem[];
};

// ─── Shared by all roles ───────────────────────────────────────────────────
const baseSidebarItems: SidebarItem[] = [
    { title: "Dashboard", url: "/dashboard", icon: Home },
    {title:"announcement",url:"/announcement",icon:Megaphone},
    { title: "Assignments", url: "/assignments", icon: Book },
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
const bbrainsOfficialExtraItems: SidebarItem[] = [
    { title: "Overview",      url: "/bbrains/overview",      icon: LayoutDashboard },
    { title: "Achievements",  url: "/admin/achievements",  icon: Trophy },
    { title: "XP & Levels",   url: "/admin/xpconfig",     icon: Trophy },
    { title: "System Config", url: "/admin/config",        icon: Settings2 },
];

const adminExtraItems: SidebarItem[] = [
    { title: "Overview",      url: "/admin/overview",      icon: LayoutDashboard },
    { title: "Manage Users",  url: "/admin/users",         icon: UserCog },
    { title: "Teachers",      url: "/admin/teachers",      icon: UserCheck },
    { title: "Students",      url: "/admin/students",      icon: Users },
    { title: "Roles & Access",url: "/admin/roles",         icon: Shield },
    { title: "Academics",     url: "/admin/academics",     icon: GraduationCap },
    { title: "Assignments",   url: "/admin/assignments",   icon: BookOpen },
    { title: "Announcements", url: "/admin/announcements", icon: Megaphone },
    { title: "Products",      url: "/admin/products",      icon: ShoppingBag },
    { title: "Statistics",    url: "/admin/stats",         icon: BarChart3 },
    { title: "Audit Log",     url: "/admin/audit-log",     icon: FileText },
    { title: "Transactions",  url: "/admin/transactions",  icon: ArrowUpDown },
    { title: "System Config", url: "/admin/config",        icon: Settings2 },
    { title: "Suggestions",   url: "/admin/suggestions",   icon: MessageSquarePlus },
];

// ─── Teacher-only ──────────────────────────────────────────────────────────
const teacherExtraItems: SidebarItem[] = [
    { title: "Overview",      url: "/teacher/overview",      icon: LayoutDashboard },
    { title: "Tests & Exams", url: "/teacher/assignments",   icon: BookOpen },
    { title: "Grading",       url: "/teacher/grading",       icon: CheckSquare },
    { title: "Attendance",    url: "/teacher/attendance",    icon: Calendar },
    { title: "Students",      url: "/teacher/students",      icon: Users },
    { title: "Announcements", url: "/teacher/announcements", icon: Megaphone },
    { title: "Products",      url: "/teacher/products",      icon: ShoppingBag },
    { title: "Audit Log",     url: "/teacher/audit-log",     icon: FileText },
    { title: "Suggestions",   url: "/admin/suggestions",     icon: MessageSquarePlus },
];

const managerExtraItems: SidebarItem[] = [
    { title: "Overview",      url: "/manager/overview",      icon: LayoutDashboard },
    { title: "Classes",       url: "/manager/classes",       icon: BookOpen },
    { title: "Teachers",      url: "/manager/teachers",      icon: UserCheck },
    { title: "Students",      url: "/manager/students",      icon: Users },
];

// ─── Role → grouped sidebar ────────────────────────────────────────────────
const extraItemsMap: Record<Role, { label: string; items: SidebarItem[] } | null> = {
    student: null,
    teacher: { label: "Teacher Panel", items: teacherExtraItems },
    admin:   { label: "Admin Panel",   items: adminExtraItems },
    staff: null,
    manager: { label: "Manager Panel", items: managerExtraItems },
    bbrains_official: { label: "Bbrains Official", items: bbrainsOfficialExtraItems },
};

export function getSidebarGroups(role: Role): SidebarGroup[] {
    const sharedItems = [...baseSidebarItems];

    if (role === "student") {
        const assignmentsIndex = sharedItems.findIndex((item) => item.url === "/assignments");
        sharedItems.splice(assignmentsIndex + 1, 0, { title: "Results", url: "/results", icon: Trophy });
    }

    const groups: SidebarGroup[] = [
        { items: sharedItems },
    ];

    const extra = extraItemsMap[role];
    if (extra) {
        groups.push({ groupLabel: extra.label, items: extra.items });
    }

    return groups;
}

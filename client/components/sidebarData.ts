import {
    Calendar,
    Home,
    MessageSquare,
    MessageSquarePlus,
    User,
    Megaphone,
    Wallet,
    Book,
    ShoppingCart,
    FileText,
    Palette,
    Library,
    CreditCard,
    Shield,
    LayoutDashboard,
    Wrench,
    GraduationCap,
    BarChart3,
    Settings2,
    ShoppingBag,
    UserCheck,
    Users,
    ArrowUpDown,
    Trophy,
    BookOpen,
    UserCog,
    CheckSquare
} from "lucide-react";
import { LucideIcon } from "lucide-react";


export type SubItem = {
    title: string,
    url: string,
    icon?: LucideIcon;
}

export type SidebarItem = {
    title: string;
    url: string;
    icon: LucideIcon;
    subItems?: SubItem[];
    roles?: string[];
}

export const baseSidebarItems: SidebarItem[] = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: Home,
    },
    {
        title: "Exam/Assignments",
        url: "/assignments",
        icon: Book,
    },
    {
        title: "Chat",
        url: "/chat",
        icon: MessageSquare,
    },
    {
        title: "Wallet",
        url: "/wallet",
        icon: Wallet,
        subItems: [
            {
                title: "Payment History",
                url: "/wallet/payments",
                icon: CreditCard,
            }
        ]
    },
    {
        title: "Calendar",
        url: "/calendar",
        icon: Calendar,
    },
    {
        title: "Market",
        url: "/market",
        icon: ShoppingCart,
        subItems: [
            {
                title: "Browse",
                url: "/market",
                icon: ShoppingCart,
            },
            {
                title: "Library",
                url: "/market/library",
                icon: Library,
            }
        ]
    },
    {
        title: "Tools",
        url: "/tools",
        icon: Wrench,
    },
]

export const adminExtraItems: SidebarItem[] = [
    { title: "Overview", url: "/admin/overview", icon: LayoutDashboard },
    { title: "Manage Users", url: "/admin/manageusers", icon: UserCog },
    { title: "Teachers", url: "/admin/teachers", icon: UserCheck },
    { title: "Students", url: "/admin/students", icon: Users },
    { title: "Roles & Access", url: "/admin/rolesaccess", icon: Shield },
    { title: "Quick Roles", url: "/admin/roles", icon: Shield },
    { title: "Academics", url: "/admin/academics", icon: GraduationCap },
    { title: "Assignments", url: "/admin/assignments", icon: BookOpen },
    { title: "Announcements", url: "/admin/announcements", icon: Megaphone },
    { title: "Products", url: "/admin/products", icon: ShoppingBag },
    { title: "Achievements", url: "/admin/achievements", icon: Trophy },
    { title: "XP & Levels", url: "/admin/xpconfig", icon: Trophy },
    { title: "Statistics", url: "/admin/stats", icon: BarChart3 },
    { title: "Audit Log", url: "/admin/auditlog", icon: FileText },
    { title: "Transactions", url: "/admin/transactions", icon: ArrowUpDown },
    { title: "System Config", url: "/admin/config", icon: Settings2 },
    { title: "Suggestions", url: "/admin/suggestions", icon: MessageSquarePlus },
]

export const teacherExtraItems: SidebarItem[] = [
    { title: "Overview", url: "/teacher/overview", icon: LayoutDashboard },
    { title: "Assignments", url: "/teacher/assignments", icon: BookOpen },
    { title: "Grading", url: "/teacher/grading", icon: CheckSquare },
    { title: "Attendance", url: "/teacher/attendance", icon: Calendar },
    { title: "Students", url: "/teacher/students", icon: Users },
    { title: "Announcements", url: "/teacher/announcements", icon: Megaphone },
    { title: "Products", url: "/teacher/products", icon: ShoppingBag },
    { title: "Audit Log", url: "/teacher/audit-log", icon: FileText },
    { title: "Suggestions", url: "/admin/suggestions", icon: MessageSquarePlus },
]

export const sidebarItems = baseSidebarItems

import {
    Calendar,
    Home,
    MessageSquare,
    Megaphone,
    Wallet,
    Book,
    ShoppingCart,
    Wrench,
    FileText,
    Palette,
    Library,
    CreditCard,
    Users,
    UserCheck,
    Shield,
    LayoutDashboard,
    Award,
    ShoppingBag,
    Trophy,
    ClipboardList,
    UserCog,
    Settings
} from "lucide-react"

export type SubItem = {
    title: string;
    url: string;
    icon?: any;
}

export type SidebarItem = {
    title: string;
    url: string;
    icon: any;
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
        title: "Announcements",
        url: "/announcements",
        icon: Megaphone,
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
                title: "Themes",
                url: "/market/themes",
                icon: Palette,
            },
            {
                title: "Library",
                url: "/market/library",
                icon: Library,
            },
        ]
    },
    {
        title: "Tools",
        url: "/tools",
        icon: Wrench,
    }
]

export const adminExtraItems: SidebarItem[] = [
    {
        title: "Admin Panel",
        url: "/admin",
        icon: LayoutDashboard,
    },
]

export const teacherExtraItems: SidebarItem[] = [
    {
        title: "Teacher Panel",
        url: "/teacher",
        icon: LayoutDashboard,
    },
]

export const sidebarItems = baseSidebarItems

import {
    Calendar,
    Home,
    MessageSquare,
    Megaphone,
    Wallet,
    Book,
    ShoppingCart,
    CreditCard,
    Wrench,
    FileText
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
}

export const sidebarItems: SidebarItem[] = [
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
    },
    {
        title: "Tools",
        url: "/tools",
        icon: Wrench,
    }
]

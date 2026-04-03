import { MainNavbar } from "@/components/layout/main-navbar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav"

import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import React from 'react'
import { NotificationProvider } from "@/components/providers/notification-provider"
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getBaseUrl } from "@/services/api/client"

type LayoutRoleEntry = {
    role?: {
        name?: string | null;
    } | null;
}

type LayoutUserDetails = {
    avatar?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    bio?: string | null;
}

type LayoutUserXP = {
    level?: number;
    xp?: number;
}

type LayoutDBUser = {
    id?: string | null;
    type?: string | null;
    username?: string | null;
    createdAt?: string | null;
    roles?: LayoutRoleEntry[] | null;
    userDetails?: LayoutUserDetails | null;
    xp?: LayoutUserXP | null;
    avatar?: string | null;
}

async function fetchUserFromAPI(token: string): Promise<LayoutDBUser | null> {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
        const response = await fetch(`${baseUrl}/user/me`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        })

        if (!response.ok) return null

        const result = await response.json()
        if (result.success && result.data) {
            return result.data
        }
        return null
    } catch {
        return null
    }
}

async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) {
        redirect("/auth/login")
    }

    const dbUser = await fetchUserFromAPI(token)

    if (!dbUser) {
        redirect("/auth/login")
    }

    const userXp = dbUser.xp || { level: 1, xp: 0 };
    const roleEntries = Array.isArray(dbUser?.roles) ? (dbUser.roles as LayoutRoleEntry[]) : [];
    const roleNames = roleEntries
        .map((entry) => entry.role?.name?.trim().toLowerCase())
        .filter((value): value is string => Boolean(value));
    const dbType = dbUser?.type?.trim().toLowerCase();

    let appRole = dbType || 'student';
    if (roleNames.some((name) => name.includes('bbrains_official'))) {
        appRole = 'bbrains_official';
    } else if (roleNames.some((name) => name.includes('manager'))) {
        appRole = 'manager';
    } else if (roleNames.some((name) => name.includes('superadmin'))) {
        appRole = 'superadmin';
    } else if (roleNames.some((name) => name.includes('admin')) || dbType === 'admin') {
        appRole = 'admin';
    } else if (roleNames.some((name) => name.includes('teacher')) || dbType === 'teacher') {
        appRole = 'teacher';
    }
    
    const allRoles: string[] = []
    
    if (dbType && dbType !== 'student') {
        allRoles.push(dbType)
    }
    
    for (const name of roleNames) {
        if (!allRoles.includes(name)) {
            allRoles.push(name)
        }
    }
    
    if (allRoles.length === 0) {
        allRoles.push('student')
    }
    
    const details = dbUser?.userDetails;
    
    const formattedUser = {
        id: dbUser.id || '',
        imageUrl: details?.avatar || dbUser?.avatar || "",
        firstName: details?.firstName || "",
        lastName: details?.lastName || "",
        bio: details?.bio || "",
        fullName: details?.firstName ? `${details.firstName} ${details.lastName || ""}` : (dbUser?.username || ""),
        username: dbUser?.username || "",
        type: dbType || "student",
        appRole,
        roles: allRoles,
        level: userXp.level,
        xp: userXp.xp,
        createdAt: dbUser?.createdAt || undefined,
    };

    return (
        <SidebarProvider defaultOpen={true}>
            <NotificationProvider>
                <div className="flex h-screen w-full overflow-hidden bg-background">
                    <AppSidebar user={formattedUser} />

                    <SidebarInset className="md:ml-2 flex flex-col h-full overflow-hidden min-w-0 w-full">
                        <MainNavbar user={formattedUser} />

                        <main className="scrollbar-hide flex-1 min-h-0 flex flex-col relative overflow-y-auto overflow-x-hidden pb-0 md:pb-0">
                             {children}
                        </main>
                        <MobileBottomNav user={formattedUser} />
                    </SidebarInset>
                </div>
            </NotificationProvider>

        </SidebarProvider>
    )
}

export default DashboardLayout

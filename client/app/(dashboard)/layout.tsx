import { MainNavbar } from "@/components/layout/main-navbar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav"

import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import React from 'react'
import { NotificationProvider } from "@/components/providers/notification-provider"

import { getServerSupabase as createClient } from "@/services/supabase/server"
import { AuthRefresher } from "@/components/shell/AuthRefresher"

type DashboardRoleRecord = {
    role?: {
        name?: string | null;
    } | null;
};

type DashboardDbUser = {
    type?: string | null;
    username?: string | null;
    is_super_admin?: boolean | null;
    created_at?: string | null;
    roles?: DashboardRoleRecord[] | null;
    userDetails?: {
        avatar?: string | null;
        first_name?: string | null;
        last_name?: string | null;
        bio?: string | null;
    } | {
        avatar?: string | null;
        first_name?: string | null;
        last_name?: string | null;
        bio?: string | null;
    }[] | null;
    xp?: {
        level?: number | null;
        xp?: number | null;
    } | {
        level?: number | null;
        xp?: number | null;
    }[] | null;
};

async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let formattedUser: {
        id: string;
        email?: string;
        imageUrl?: string;
        firstName?: string;
        lastName?: string;
        fullName?: string;
        username?: string;
        type?: string;
        bio?: string;
        level?: number;
        xp?: number;
        createdAt?: string;
        isSuperAdmin?: boolean;
        roleNames?: string[];
    } | null = null;
    if (user) {
        const userSelect = `
            type,
            username,
            email,
            is_super_admin,
            created_at,
            roles:user_roles (
                role:role_id (
                    name
                )
            ),
            userDetails:user_details (
                avatar,
                first_name,
                last_name,
                bio
            ),
            xp (level, xp)
        `

        // Prefer user_id match, but fall back to email if the auth user id does not match DB records.
        const { data: dbUserById } = await supabase
            .from('user')
            .select(userSelect)
            .eq('user_id', user.id)
            .maybeSingle()

        const { data: dbUserByEmail } = dbUserById || !user.email
            ? { data: null as DashboardDbUser | null }
            : await supabase
                .from('user')
                .select(userSelect)
                .eq('email', user.email)
                .maybeSingle()

        const dbUser = (dbUserById ?? dbUserByEmail) as DashboardDbUser | null

        const userXpData = Array.isArray(dbUser?.xp) ? dbUser.xp[0] : dbUser?.xp;
        const userXp = userXpData || { level: 1, xp: 0 };

        // Get details from user_details table if they exist
        const rawDetails = dbUser?.userDetails;
        const details = Array.isArray(rawDetails) ? rawDetails[0] : rawDetails;
        const roleNames = Array.isArray(dbUser?.roles)
            ? dbUser.roles
                .map((userRole) => userRole?.role?.name)
                .filter((roleName: string | null | undefined): roleName is string => Boolean(roleName))
            : [];

        // 🔍 TEMP DIAGNOSTICS — remove after fixing
        console.log("[layout] dbUserById:", JSON.stringify(dbUserById, null, 2))
        console.log("[layout] dbUserByEmail:", JSON.stringify(dbUserByEmail, null, 2))
        console.log("[layout] dbUser.type:", dbUser?.type, "| is_super_admin:", dbUser?.is_super_admin)
        console.log("[layout] roleNames:", roleNames)
        console.log("[layout] user.user_metadata:", JSON.stringify(user.user_metadata, null, 2))

        const meta = user.user_metadata as Record<string, unknown> | undefined;
        const metaType = typeof meta?.type === "string" ? meta.type : undefined;
        const metaFirstName = typeof meta?.first_name === "string" ? meta.first_name : "";
        const metaLastName = typeof meta?.last_name === "string" ? meta.last_name : "";
        const metaAvatar = typeof meta?.avatar_url === "string" ? meta.avatar_url : "";
        const metaIsSuperAdmin = meta?.is_super_admin === true;

        formattedUser = {
            id: user.id,
            email: user.email,
            imageUrl: details?.avatar || metaAvatar,
            firstName: details?.first_name || metaFirstName,
            lastName: details?.last_name || metaLastName,
            bio: details?.bio || "",
            fullName: details?.first_name ? `${details.first_name} ${details.last_name || ""}` : (dbUser?.username || user.email?.split('@')[0] || ""),
            username: dbUser?.username || user.email?.split('@')[0] || "",
            type: dbUser?.type || metaType || 'student',
            isSuperAdmin: dbUser?.is_super_admin || metaIsSuperAdmin || false,
            roleNames,
            level: userXp?.level ?? undefined,
            xp: userXp?.xp ?? undefined,
            createdAt: dbUser?.created_at ?? undefined,
        };
    }

    return (
        <SidebarProvider defaultOpen={true}>
            <NotificationProvider>
                <AuthRefresher />
                <div className="flex h-screen w-full overflow-hidden bg-background">
                    {/* Sidebar on the left - height: 100vh */}
                    <AppSidebar user={formattedUser ?? undefined} />

                    {/* Main Content Area on the right */}
                    <SidebarInset className="flex flex-col h-full overflow-hidden min-w-0 w-full">
                        {/* Navbar starts after the sidebar and spans the remaining width */}
                        <MainNavbar user={formattedUser ?? undefined} />

                        {/* 
                            Fix 7: Layout Scroll Conflict
                            We remove overflow-y-auto from this container and use flex-1 min-h-0.
                            This ensures that children like Chat (which use h-full) are strictly constrained.
                            Pages that need to scroll will now have their own scroll containers.
                        */}
                        <main className="flex-1 min-h-0 flex flex-col relative pb-16 md:pb-0 overflow-hidden">
                            {children}
                        </main>
                        <MobileBottomNav user={formattedUser ?? undefined} />
                    </SidebarInset>
                </div>
            </NotificationProvider>

        </SidebarProvider>
    )
}

export default DashboardLayout

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
    } | null = null;
    if (user) {
        // Fetch user type and details from DB
        const { data: dbUser } = await supabase
            .from('user')
            .select(`
                type,
                username,
                created_at,
                userDetails:user_details (
                    avatar,
                    first_name,
                    last_name,
                    bio
                ),
                xp (level, xp)
            `)
            .eq('user_id', user.id)
            .single()

        const userXpData = Array.isArray(dbUser?.xp) ? dbUser?.xp[0] : dbUser?.xp;
        const userXp = userXpData || { level: 1, xp: 0 };
        
        // Get details from user_details table if they exist
        const rawDetails = (dbUser as any)?.userDetails;
        const details = Array.isArray(rawDetails) ? rawDetails[0] : rawDetails;
        
        formattedUser = {
            id: user.id,
            email: user.email,
            imageUrl: details?.avatar || "",
            firstName: details?.first_name || "",
            lastName: details?.last_name || "",
            bio: details?.bio || "",
            fullName: details?.first_name ? `${details.first_name} ${details.last_name || ""}` : (dbUser?.username || user.email?.split('@')[0] || ""),
            username: dbUser?.username || user.email?.split('@')[0] || "",
            type: dbUser?.type || 'student',
            level: userXp.level,
            xp: userXp.xp,
            createdAt: dbUser?.created_at,
        };
    }

    return (
        <SidebarProvider defaultOpen={true}>
            <NotificationProvider>
                <div className="flex h-screen w-full overflow-hidden bg-background">
                    {/* Sidebar on the left - height: 100vh */}
                    <AppSidebar user={formattedUser} />

                    {/* Main Content Area on the right */}
                    <SidebarInset className="flex flex-col h-full overflow-hidden min-w-0 w-full">
                        {/* Navbar starts after the sidebar and spans the remaining width */}
                        <MainNavbar user={formattedUser} />

                        {/* 
                            Fix 7: Layout Scroll Conflict
                            We remove overflow-y-auto from this container and use flex-1 min-h-0.
                            This ensures that children like Chat (which use h-full) are strictly constrained.
                            Pages that need to scroll will now have their own scroll containers.
                        */}
                        <main className="scrollbar-hide flex-1 min-h-0 flex flex-col relative overflow-y-auto overflow-x-hidden pb-16 md:pb-0">
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

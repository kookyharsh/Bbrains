import { MainNavbar } from "@/components/main-navbar"
import { AppSidebar } from "@/components/app-sidebar"

import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import React from 'react'
import { NotificationProvider } from "@/components/providers/notification-provider"

import { createClient } from "@/lib/server"

async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let formattedUser = null;
    if (user) {
        const metadata = user.user_metadata || {};
        formattedUser = {
            id: user.id,
            email: user.email,
            imageUrl: metadata.avatar_url || metadata.image_url || "",
            firstName: metadata.first_name || metadata.firstName || "",
            lastName: metadata.last_name || metadata.lastName || "",
            fullName: metadata.full_name || metadata.name || "",
            username: metadata.username || user.email?.split('@')[0] || "",
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
                        <main className="flex-1 min-h-0 flex flex-col relative">
                             {children}
                        </main>
                    </SidebarInset>
                </div>
            </NotificationProvider>

        </SidebarProvider>
    )
}

export default DashboardLayout

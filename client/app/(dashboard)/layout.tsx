import { MainNavbar } from "@/components/main-navbar"
import { AppSidebar } from "@/components/app-sidebar"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { DashboardBreadcrumb } from "@/components/dashboard-breadcrumb"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import React from 'react'

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
            <div className="flex h-screen w-full overflow-hidden">
                {/* Sidebar on the left - height: 100vh */}
                <AppSidebar user={formattedUser} />

                {/* Main Content Area on the right */}
                <SidebarInset className="flex flex-col h-full overflow-hidden min-w-0">
                    {/* Navbar starts after the sidebar and spans the remaining width */}
                    <MainNavbar user={formattedUser} />

                    {/* Breadcrumb showing current page */}
                    <DashboardBreadcrumb />

                    {/* Page Content */}
                    <main className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6">
                        {children}
                    </main>
                </SidebarInset>
            </div>

            {/* Mobile Bottom Navigation - only visible on small screens */}
            <MobileBottomNav />
        </SidebarProvider>
    )
}

export default DashboardLayout

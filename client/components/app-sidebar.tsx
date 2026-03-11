"use client"

import React from 'react'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    useSidebar,
} from "@/components/ui/sidebar"

import {
    Settings,
    BarChart3
} from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { sidebarItems } from "./sidebarData"

export function AppSidebar({ user }: { user?: any }) {
    const pathname = usePathname()

    const { state } = useSidebar()
    const isCollapsed = state === "collapsed"

    return (
        <Sidebar collapsible="icon" className="border-r border-gray-100 dark:border-gray-800">
            <SidebarHeader className="bg-ui-light-surface dark:bg-ui-dark-surface pt-6 px-3">
                <div className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"} mb-6 text-ui-light-textPrimary dark:text-ui-dark-textPrimary`}>
                    <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"} min-w-0`}>
                        <div className={`${isCollapsed ? "w-8 h-8" : "w-10 h-10"} bg-brand-purple rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm transition-all duration-200`}>
                            <BarChart3 className={`${isCollapsed ? "h-4 w-4" : "h-6 w-6"} transition-all duration-200`} />
                        </div>
                        {!isCollapsed && (
                            <span className="font-bold text-xl tracking-tight truncate">Bbrains</span>
                        )}
                    </div>

                </div>
            </SidebarHeader>

            <SidebarContent className={`bg-ui-light-surface dark:bg-ui-dark-surface custom-scrollbar ${isCollapsed ? "px-1.5" : "px-3"}`}>
                <SidebarGroup>
                    <SidebarGroupLabel className="px-4 text-[10px] font-bold text-ui-light-textSecondary dark:text-ui-dark-textSecondary uppercase tracking-[0.1em] mb-4 group-data-[collapsible=icon]:hidden">
                        Main menu
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className={`${isCollapsed ? "space-y-2" : "space-y-1.5"}`}>
                            {sidebarItems.map((item) => {
                                const isActive = pathname === item.url || pathname.startsWith(`${item.url}/`);
                                return (
                                    <React.Fragment key={item.url}>
                                        <SidebarMenuItem>
                                            <SidebarMenuButton asChild tooltip={item.title}>
                                                <Link
                                                    href={item.url}
                                                    className={`flex items-center gap-3 px-4 py-3 min-h-[48px] rounded-xl transition-all duration-200 ${isCollapsed ? "!size-11 !min-h-0 !p-0 !gap-0 justify-center mx-auto" : ""} ${isActive
                                                        ? "bg-brand-purple text-white shadow-sm font-semibold"
                                                        : "text-ui-light-textSecondary dark:text-ui-dark-textSecondary hover:bg-black/5 dark:hover:bg-white/5"
                                                        }`}
                                                >
                                                    <item.icon className={`${isCollapsed ? "h-[22px] w-[22px]" : "h-5 w-5"} shrink-0 ${isActive ? "text-white" : ""}`} />
                                                    <span className="text-[13px] group-data-[collapsible=icon]:hidden">{item.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>

                                        {item.subItems && item.subItems.length > 0 && isActive && (
                                            <div className="group-data-[collapsible=icon]:hidden">
                                                <SidebarMenu className="mt-1 space-y-1">
                                                    {item.subItems.map((subItem) => {
                                                        const isSubActive = pathname === subItem.url;
                                                        return (
                                                            <SidebarMenuItem key={subItem.url} className="ml-10">
                                                                <SidebarMenuButton asChild>
                                                                    <Link
                                                                        href={subItem.url}
                                                                        className={`flex items-center gap-3 py-2 transition-colors text-[12px] ${isSubActive
                                                                            ? "text-ui-light-textPrimary dark:text-ui-dark-textPrimary font-medium"
                                                                            : "text-ui-light-textSecondary hover:text-ui-light-textPrimary dark:text-ui-dark-textSecondary dark:hover:text-white"
                                                                            }`}
                                                                    >
                                                                        <span>{subItem.title}</span>
                                                                    </Link>
                                                                </SidebarMenuButton>
                                                            </SidebarMenuItem>
                                                        )
                                                    })}
                                                </SidebarMenu>
                                            </div>
                                        )}
                                    </React.Fragment>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="bg-ui-light-surface dark:bg-ui-dark-surface px-3 pb-6 pt-4 border-t border-gray-100 dark:border-gray-800/50">
                {user && (
                    <div className="flex flex-col gap-4">
                        <button
                            className={`flex items-center gap-3 rounded-xl text-ui-light-textSecondary dark:text-ui-dark-textSecondary hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${isCollapsed ? "justify-center px-0 py-2.5" : "px-4 py-2.5"}`}
                            title="Settings"
                        >
                            <Settings className="h-5 w-5 shrink-0" />
                            {!isCollapsed && (
                                <span className="font-medium text-[13px]">Settings</span>
                            )}
                        </button>

                        <div className={isCollapsed ? "flex justify-center" : "px-2"}>
                            {!isCollapsed && (
                                <h3 className="text-[10px] font-bold text-ui-light-textSecondary dark:text-ui-dark-textSecondary uppercase tracking-[0.1em] mb-4">Account</h3>
                            )}
                            <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"}`}>
                                <Avatar className={`${isCollapsed ? "h-8 w-8" : "h-10 w-10"} rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-800 shrink-0 transition-all duration-200`}>
                                    <AvatarImage src={user?.imageUrl} />
                                    <AvatarFallback className="bg-brand-mint/20 text-brand-mint font-bold text-xs uppercase">
                                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                                    </AvatarFallback>
                                </Avatar>
                                {!isCollapsed && (
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[13px] font-bold text-ui-light-textPrimary dark:text-ui-dark-textPrimary truncate">
                                            {user?.fullName || user?.username || "Anonymous User"}
                                        </p>
                                        <p className="text-[11px] text-ui-light-textSecondary dark:text-ui-dark-textSecondary truncate mt-0.5">
                                            Student
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </SidebarFooter>

            <SidebarRail />
        </Sidebar >
    )
}

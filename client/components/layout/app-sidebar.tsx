"use client"
import React, { useState } from 'react'
import {
    Sidebar, SidebarContent, SidebarFooter, SidebarGroup,
    SidebarGroupContent, SidebarGroupLabel, SidebarHeader,
    SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail,
    useSidebar,
} from "@/components/ui/sidebar"
import Link from "next/link";
import { Settings, BarChart3 } from "lucide-react";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getSidebarGroups, resolveRole } from "./sidebarData"
import type { Role } from "./sidebarData"
import { UserProfileCard, UserStatus, statusColors, statusLabels } from "../user-profile-card"
import { useNotifications } from "../providers/notification-provider"

interface AppSidebarProps {
    user?: {
        id: string;
        email?: string;
        imageUrl?: string;
        firstName?: string;
        lastName?: string;
        fullName?: string;
        username?: string;
        type?: string;
        appRole?: string;
        roles?: string[];
        bio?: string;
        level?: number;
        xp?: number;
        createdAt?: string;
    } | null;
}

export function AppSidebar({ user }: AppSidebarProps) {
    const pathname = usePathname()
    const { state } = useSidebar()
    const isCollapsed = state === "collapsed"
    const { unreadCount } = useNotifications()

    const [showProfileCard, setShowProfileCard] = useState(false)
    const [userStatus, setUserStatus] = useState<UserStatus>("online")

    const userRoles = user?.roles || [user?.type || "student"]
    const resolvedRoles = resolveRole(userRoles) as Role[]
    const groups = getSidebarGroups(resolvedRoles)

    return (
        <Sidebar collapsible="icon" className="border-r border-sidebar-border">
            <SidebarHeader className="bg-sidebar pt-6 px-3">
                <div className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"} mb-6 text-sidebar-foreground`}>
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

            <SidebarContent className={`bg-sidebar ${isCollapsed ? "px-1.5" : "px-3"}`}>
                {groups.map((group, groupIndex) => (
                    <SidebarGroup key={groupIndex}>
                        <SidebarGroupLabel className="px-4 text-[10px] font-bold text-sidebar-foreground/60 uppercase tracking-[0.1em] mb-4 group-data-[collapsible=icon]:hidden">
                            {group.groupLabel ?? "Main Menu"}
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu className={`${isCollapsed ? "space-y-2" : "space-y-1.5"}`}>
                                {group.items.map((item) => {
                                    const isActive = pathname === item.url || pathname.startsWith(`${item.url}/`);
                                    const isChat = item.url === "/chat";

                                    return (
                                        <React.Fragment key={item.url}>
                                            <SidebarMenuItem>
                                                <SidebarMenuButton asChild tooltip={item.title}>
                                                    <Link
                                                        href={item.url}
                                                        className={`flex items-center gap-3 px-4 py-3 min-h-[48px] rounded-xl transition-all duration-200
                                                            ${isCollapsed ? "!size-11 !min-h-0 !p-0 !gap-0 justify-center mx-auto" : ""}
                                                            ${isActive
                                                                ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm font-semibold"
                                                                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/10"
                                                            }`}
                                                    >
                                                        <div className="relative">
                                                            <item.icon className={`${isCollapsed ? "h-[22px] w-[22px]" : "h-5 w-5"} shrink-0 ${isActive ? "text-white" : ""}`} />
                                                            {isChat && unreadCount > 0 && isCollapsed && (
                                                                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-800" />
                                                            )}
                                                        </div>
                                                        <span className="text-[13px] group-data-[collapsible=icon]:hidden flex-1">{item.title}</span>
                                                        {isChat && unreadCount > 0 && !isCollapsed && (
                                                            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full group-data-[collapsible=icon]:hidden">
                                                                {unreadCount}
                                                            </span>
                                                        )}
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
                                                                            className={`flex items-center gap-3 py-2 transition-colors text-[12px]
                                                                                ${isSubActive
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
                ))}
            </SidebarContent>

            <SidebarFooter className="bg-sidebar px-3 pb-6 pt-4 border-t border-sidebar-border">
                {user && (
                    <div className="flex flex-col gap-4">
                        <Link
                            href="/profile"
                            className={`flex items-center gap-3 rounded-xl text-sidebar-foreground/70 hover:bg-sidebar-accent/10 transition-colors ${isCollapsed ? "justify-center px-0 py-2.5" : "px-4 py-2.5"}`}
                            title="Settings"
                        >
                            <Settings className="h-5 w-5 shrink-0" />
                            {!isCollapsed && <span className="font-medium text-[13px]">Settings</span>}
                        </Link>

                        <div className={isCollapsed ? "flex justify-center" : "px-2"}>
                            {!isCollapsed && (
                                <h3 className="text-[10px] font-bold text-sidebar-foreground/60 uppercase tracking-[0.1em] mb-4">Account</h3>
                            )}
                            <button
                                onClick={() => setShowProfileCard(!showProfileCard)}
                                className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"} w-full ${isCollapsed ? "" : "hover:bg-sidebar-accent/10 rounded-xl p-2 -mx-2"} transition-colors`}
                            >
                                <div className="relative">
                                    <Avatar className={`${isCollapsed ? "h-8 w-8" : "h-10 w-10"} rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-800 shrink-0 transition-all duration-200`}>
                                        <AvatarImage src={user?.imageUrl} />
                                        <AvatarFallback className="bg-brand-mint/20 text-brand-mint font-bold text-xs uppercase">
                                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className={`absolute -bottom-0.5 -right-0.5 ${statusColors[userStatus]} w-3 h-3 rounded-full border-2 border-white dark:border-gray-800`} />
                                </div>
                                {!isCollapsed && (
                                    <div className="flex-1 min-w-0 text-left">
                                        <p className="text-[13px] font-bold text-sidebar-foreground truncate">
                                            {user?.fullName || user?.username || "Anonymous User"}
                                        </p>
                                        <p className="text-[11px] text-sidebar-foreground/60 truncate mt-0.5">
                                            {statusLabels[userStatus]}
                                        </p>
                                    </div>
                                )}
                            </button>

                            {showProfileCard && !isCollapsed && (
                                <UserProfileCard
                                    user={user}
                                    userStatus={userStatus}
                                    setUserStatus={setUserStatus}
                                />
                            )}
                        </div>
                    </div>
                )}
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}

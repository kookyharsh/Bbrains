"use client"

import React, { useState, useEffect, useCallback } from "react"
import { 
    Bell, Check, Calendar, Trophy, Megaphone, 
    Settings, MessageSquare, GraduationCap, Info
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { notificationApi, Notification } from "@/services/api/client"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { supabase } from "@/lib/supabase/chat"

export function NotificationsBell() {
    const { data: session } = useSession()
    const [notifications, setNotifications] = useState<any[]>([])
    const [chatNotifications, setChatNotifications] = useState<any[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const router = useRouter()

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await notificationApi.getNotifications()
            if (res.success && res.data) {
                setNotifications(res.data.notifications)
                setUnreadCount(prev => prev + res.data.unreadCount)
            }
        } catch (error) {
            // Silently handle network errors
        }
    }, [])

    const fetchChatNotifications = useCallback(async () => {
        if (!session?.user?.id) return;
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*, message:message_id(sender_name, content)')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false })
                .limit(20);

            if (!error && data) {
                setChatNotifications(data);
                setUnreadCount(prev => prev + data.filter(n => !n.is_read).length);
            }
        } catch (error) {
            console.error(error);
        }
    }, [session?.user?.id]);

    useEffect(() => {
        setUnreadCount(0); // Reset before fetching both
        fetchNotifications()
        fetchChatNotifications()

        const interval = setInterval(() => {
            setUnreadCount(0);
            fetchNotifications();
            fetchChatNotifications();
        }, 60000)

        return () => clearInterval(interval)
    }, [fetchNotifications, fetchChatNotifications])

    useEffect(() => {
        if (!session?.user?.id) return;

        const channel = supabase.channel('chat_notifications_bell')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${session.user.id}` },
                async (payload) => {
                    const { data } = await supabase.from('notifications').select('*, message:message_id(sender_name, content)').eq('id', payload.new.id).single();
                    if (data) {
                        setChatNotifications(prev => [data, ...prev]);
                        setUnreadCount(prev => prev + 1);
                    }
                }
            )
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'notifications', filter: `user_id=eq.${session.user.id}` },
                (payload) => {
                    setChatNotifications(prev => prev.map(n => n.id === payload.new.id ? { ...n, ...payload.new } : n));
                    if (payload.new.is_read && payload.old && !payload.old.is_read) {
                        setUnreadCount(prev => Math.max(0, prev - 1));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [session?.user?.id]);

    const handleMarkRead = async (id: number, relatedId?: string, type?: string) => {
        try {
            await notificationApi.markRead(id)
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, readAt: new Date().toISOString() } : n))
            setUnreadCount(prev => Math.max(0, prev - 1))
            
            if (type === 'attendance') router.push('/dashboard')
            else if (type === 'announcement') router.push('/announcements')
        } catch (error) {
            console.error("Failed to mark notification as read:", error)
        }
    }

    const handleChatNotificationClick = async (notification: any) => {
        try {
            await supabase.from('notifications').update({ is_read: true }).eq('id', notification.id);
            setChatNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n));
            if (!notification.is_read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }

            if (notification.type === 'global') {
                router.push('/chat');
            } else if (notification.type === 'dm') {
                router.push('/messages'); // Ideally we'd open the specific conversation if we used search params, e.g. /messages?id=${notification.conversation_id}
            }
        } catch (error) {
            console.error("Failed to mark chat notification read:", error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationApi.markAllRead()
            setNotifications(prev => prev.map(n => ({ ...n, readAt: new Date().toISOString() })))

            if (session?.user?.id) {
                await supabase.from('notifications').update({ is_read: true }).eq('user_id', session.user.id).eq('is_read', false);
                setChatNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            }

            setUnreadCount(0)
        } catch (error) {
            console.error("Failed to mark all as read:", error)
        }
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'attendance': return <Calendar className="h-4 w-4 text-blue-500" />
            case 'achievement': return <Trophy className="h-4 w-4 text-yellow-500" />
            case 'announcement': return <Megaphone className="h-4 w-4 text-brand-orange" />
            case 'grade': return <GraduationCap className="h-4 w-4 text-purple-500" />
            case 'system': return <Settings className="h-4 w-4 text-gray-500" />
            case 'dm':
            case 'global':
            case 'chat': return <MessageSquare className="h-4 w-4 text-green-500" />
            default: return <Info className="h-4 w-4 text-muted-foreground" />
        }
    }

    // Combine and sort
    const allNotifications = [
        ...notifications.map(n => ({ ...n, isChat: false, date: new Date(n.createdAt).getTime(), isRead: !!n.readAt })),
        ...chatNotifications.map(n => ({ ...n, isChat: true, date: new Date(n.created_at).getTime(), isRead: n.is_read }))
    ].sort((a, b) => b.date - a.date);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative group">
                    <Bell className="h-5 w-5 transition-transform group-hover:rotate-12" />
                    {unreadCount > 0 && (
                        <Badge 
                            className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 bg-brand-orange text-[10px] border-2 border-background"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0 shadow-2xl">
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <h3 className="font-bold text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 text-[10px] uppercase font-bold tracking-wider"
                            onClick={handleMarkAllRead}
                        >
                            Mark all as read
                        </Button>
                    )}
                </div>
                
                <ScrollArea className="h-[350px]">
                    {allNotifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                                <Bell className="h-6 w-6 text-muted-foreground/50" />
                            </div>
                            <p className="text-xs text-muted-foreground font-medium">No notifications yet</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {allNotifications.map((n) => (
                                <div 
                                    key={n.isChat ? `chat-${n.id}` : `sys-${n.id}`}
                                    className={cn(
                                        "p-4 transition-colors cursor-pointer hover:bg-muted/50 flex gap-3",
                                        !n.isRead && "bg-brand-orange/5"
                                    )}
                                    onClick={() => n.isChat ? handleChatNotificationClick(n) : handleMarkRead(n.id, n.relatedId, n.type)}
                                >
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-border bg-background shadow-sm"
                                    )}>
                                        {getIcon(n.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <p className={cn(
                                                "text-xs font-bold truncate",
                                                !n.isRead ? "text-foreground" : "text-muted-foreground"
                                            )}>
                                                {n.isChat ? (n.type === 'dm' ? `New message from ${n.message?.sender_name}` : "New messages in School Chat") : n.title}
                                            </p>
                                            <span className="text-[10px] text-muted-foreground shrink-0">
                                                {formatDistanceToNow(n.date, { addSuffix: true })}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                            {n.isChat ? n.message?.content : n.message}
                                        </p>
                                    </div>
                                    {!n.isRead && (
                                        <div className="w-2 h-2 rounded-full bg-brand-orange mt-1.5 shrink-0" />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
                
                <div className="p-2 border-t border-border">
                    <Button variant="ghost" className="w-full text-xs font-medium h-8" onClick={() => router.push('/notifications')}>
                        View all activity
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

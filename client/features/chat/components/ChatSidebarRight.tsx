import React, { useEffect, useState } from "react"
import { supabase } from "@/services/supabase/client"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export interface Member {
  id: string
  name: string
  username: string
  role: string
  avatar?: string
}

interface ChatSidebarRightProps {
  members: Member[]
  currentUserId: string
  onSelectUser?: (user: Member) => void
}

export function ChatSidebarRight({ members, currentUserId, onSelectUser }: ChatSidebarRightProps) {
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!currentUserId) return

    const channel = supabase.channel('chat_presence')

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState() as Record<string, any[]>
        const onlineIds = new Set<string>()
        for (const key in state) {
          state[key].forEach((presence: any) => {
            if (presence.user_id) onlineIds.add(presence.user_id)
          })
        }
        setOnlineUserIds(onlineIds)
      })
      .subscribe(async (status: string) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: currentUserId,
            online_at: new Date().toISOString()
          })
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentUserId])

  const onlineMembers = members.filter(m => onlineUserIds.has(m.id))
  // For others in offline
  const offlineMembers = members.filter(m => !onlineUserIds.has(m.id))

  const onlineByRole = onlineMembers.reduce((acc, m) => {
    if (!acc[m.role]) acc[m.role] = []
    acc[m.role].push(m)
    return acc
  }, {} as Record<string, Member[]>)

  const offlineByRole = offlineMembers.reduce((acc, m) => {
    if (!acc[m.role]) acc[m.role] = []
    acc[m.role].push(m)
    return acc
  }, {} as Record<string, Member[]>)

  return (
    <aside className="hidden md:flex flex-col w-60 border-l border-border bg-card shrink-0">
      <div className="p-4 border-b border-border text-sm shrink-0">
        <h3 className="font-semibold text-foreground">Members</h3>
      </div>
      <ScrollArea className="flex-1 p-4">
        {Object.entries(onlineByRole).map(([role, roleMembers]) => (
          <div key={`online-${role}`} className="mb-4">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              {role} — Online ({roleMembers.length})
            </h4>
            <div className="space-y-1">
              {roleMembers.map((member) => (
                <button
                  key={member.id}
                  onClick={() => onSelectUser?.(member)}
                  className="w-full text-left flex items-center gap-3 p-1.5 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors group"
                >
                  <div className="relative shrink-0">
                    <Avatar className="w-8 h-8">
                       <AvatarImage src={member.avatar} />
                       <AvatarFallback className="bg-primary/10 text-primary text-xs">{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-background rounded-full"></div>
                  </div>
                  <span className="font-medium text-sm text-foreground truncate">
                    {member.name} {member.id === currentUserId && "(You)"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}

        {Object.entries(offlineByRole).map(([role, roleMembers]) => (
          <div key={`offline-${role}`} className="mb-4 mt-6">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              {role} — Offline ({roleMembers.length})
            </h4>
            <div className="space-y-1">
              {roleMembers.map((member) => (
                <button
                  key={member.id}
                  onClick={() => onSelectUser?.(member)}
                  className="w-full text-left flex items-center gap-3 p-1.5 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors group opacity-60 hover:opacity-100"
                >
                  <div className="relative shrink-0">
                    <Avatar className="w-8 h-8">
                       <AvatarImage src={member.avatar} />
                       <AvatarFallback className="bg-primary/10 text-primary text-xs">{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-gray-400 border-2 border-background rounded-full"></div>
                  </div>
                  <span className="font-medium text-sm text-foreground truncate">{member.name}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </ScrollArea>
    </aside>
  )
}

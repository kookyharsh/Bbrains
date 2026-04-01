import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/chat";

export function usePresence(channelName: string, user: { id: string; name: string }) {
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);

  useEffect(() => {
    if (!user.id) return;

    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    channel.on("presence", { event: "sync" }, () => {
      const newState = channel.presenceState();
      // Extract unique users
      const users = Object.values(newState).map((presence: any) => presence[0]);
      setOnlineUsers(users);
    });

    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({
          user_id: user.id,
          name: user.name,
          online_at: new Date().toISOString(),
        });
      }
    });

    return () => {
      channel.untrack();
      supabase.removeChannel(channel);
    };
  }, [channelName, user.id, user.name]);

  return onlineUsers;
}

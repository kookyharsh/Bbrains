"use client";

import { useSession } from "next-auth/react";
import GlobalChatWindow from "@/components/chat/GlobalChatWindow";

export default function ChatPage() {
  const { data: session } = useSession();

  if (!session?.user) {
    return <div className="p-4">Please log in to access the chat.</div>;
  }

  // NextAuth gives us session.user. We assume id, name, role, image are available.
  const user = {
    id: session.user.id || "",
    name: session.user.name || "Unknown User",
    role: (session.user as any).role || "student",
    avatarUrl: session.user.image || null,
  };

  return (
    <div className="h-screen flex flex-col pt-16 bg-background">
      <GlobalChatWindow currentUser={user} />
    </div>
  );
}

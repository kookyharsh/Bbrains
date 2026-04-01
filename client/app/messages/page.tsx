"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import InboxList from "@/components/messages/InboxList";
import DMChatWindow from "@/components/messages/DMChatWindow";

export default function MessagesPage() {
  const { data: session } = useSession();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  if (!session?.user) {
    return <div className="p-4">Please log in to access your messages.</div>;
  }

  const currentUser = {
    id: session.user.id || "",
    name: session.user.name || "Unknown User",
    role: (session.user as any).role || "student",
    avatarUrl: session.user.image || null,
  };

  return (
    <div className="h-screen flex pt-16 bg-background">
      <div className={`w-full md:w-80 border-r flex flex-col bg-muted/20 ${activeConversationId ? "hidden md:flex" : "flex"}`}>
        <InboxList
          currentUser={currentUser}
          activeConversationId={activeConversationId}
          onSelectConversation={setActiveConversationId}
        />
      </div>

      <div className={`flex-1 flex flex-col ${!activeConversationId ? "hidden md:flex" : "flex"}`}>
        {activeConversationId ? (
          <DMChatWindow
            conversationId={activeConversationId}
            currentUser={currentUser}
            onBack={() => setActiveConversationId(null)}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground flex-col gap-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-2">
              <span className="text-3xl">💬</span>
            </div>
            <p>Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}

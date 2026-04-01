import { useEffect, useState } from "react";
import { getConversations, supabase } from "@/lib/supabase/chat";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import NewConversationModal from "./NewConversationModal";

interface InboxListProps {
  currentUser: {
    id: string;
    role: string;
  };
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
}

export default function InboxList({ currentUser, activeConversationId, onSelectConversation }: InboxListProps) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      const data = await getConversations();
      setConversations(data);
    }
    load();

    const channel = supabase.channel('conversations_updates')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'conversations' },
        (payload) => {
          setConversations(prev => {
            const updated = prev.map(c => c.id === payload.new.id ? { ...c, ...payload.new } : c);
            return updated.sort((a, b) => new Date(b.last_message_at || 0).getTime() - new Date(a.last_message_at || 0).getTime());
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filtered = conversations.filter(c => {
    const otherUser = c.student_id === currentUser.id ? c.teacher.user_details : c.student.user_details;
    const name = `${otherUser?.first_name} ${otherUser?.last_name}`.toLowerCase();
    const course = c.course?.name?.toLowerCase() || "";
    return name.includes(search.toLowerCase()) || course.includes(search.toLowerCase());
  });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Messages</h2>
          {currentUser.role === 'student' && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="p-1.5 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search messages..."
            className="pl-9 h-9 text-sm rounded-full bg-muted/50 border-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {filtered.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground p-4">
            No conversations found
          </div>
        ) : (
          filtered.map(c => {
            const otherUser = c.student_id === currentUser.id ? c.teacher?.user_details : c.student?.user_details;
            const displayName = otherUser ? `${otherUser.first_name} ${otherUser.last_name}` : "Unknown User";

            return (
              <div
                key={c.id}
                onClick={() => onSelectConversation(c.id)}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer mb-1 transition-colors ${
                  activeConversationId === c.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
              >
                <div className="relative">
                  <Avatar className="w-12 h-12 shadow-sm">
                    <AvatarImage src={otherUser?.avatar || ""} />
                    <AvatarFallback>{displayName.charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className="font-semibold truncate text-sm">{displayName}</span>
                    <span className={`text-[10px] whitespace-nowrap ${activeConversationId === c.id ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {c.last_message_at ? formatDistanceToNow(new Date(c.last_message_at), { addSuffix: true }) : ""}
                    </span>
                  </div>
                  <div className={`text-xs truncate ${activeConversationId === c.id ? "text-primary-foreground/90" : "text-muted-foreground"}`}>
                    {c.course?.name || "General"}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {isModalOpen && (
        <NewConversationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          currentUser={currentUser}
          onSelectConversation={onSelectConversation}
        />
      )}
    </div>
  );
}

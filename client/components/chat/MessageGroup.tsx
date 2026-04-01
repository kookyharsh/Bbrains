import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { deleteMessage } from "@/lib/supabase/chat";
import { MoreHorizontal, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MessageGroupProps {
  group: any[];
  currentUser: {
    id: string;
    role: string;
  };
}

export default function MessageGroup({ group, currentUser }: MessageGroupProps) {
  const firstMessage = group[0];
  const senderId = firstMessage.sender_id;
  const isMe = senderId === currentUser.id;

  const handleDelete = async (msgId: string) => {
    try {
      await deleteMessage(msgId, currentUser.id);
    } catch (err) {
      console.error("Failed to delete message", err);
    }
  };

  return (
    <div className={`flex gap-3 group/main w-full items-start mb-2 hover:bg-muted/30 px-2 py-1 -mx-2 rounded transition-colors`}>
      <div className="flex-shrink-0 mt-1 w-10 h-10">
        <Avatar className="w-10 h-10">
          <AvatarImage src={firstMessage.sender_avatar_url || ""} />
          <AvatarFallback>{firstMessage.sender_name?.charAt(0)?.toUpperCase() || "?"}</AvatarFallback>
        </Avatar>
      </div>

      <div className="flex flex-col w-full min-w-0">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-semibold text-sm hover:underline cursor-pointer">{firstMessage.sender_name}</span>
          {["teacher", "admin", "superadmin"].includes(firstMessage.sender_role) && (
            <span className="text-[10px] bg-indigo-500/10 text-indigo-500 px-1.5 py-0.5 rounded uppercase tracking-wider font-bold">
              {firstMessage.sender_role}
            </span>
          )}
          <span className="text-[11px] text-muted-foreground ml-1">
            {format(new Date(firstMessage.created_at), "MM/dd/yyyy h:mm a")}
          </span>
        </div>

        {group.map((msg, index) => (
          <div key={msg.id} className="group/msg relative flex items-center pr-8 min-h-[1.5rem] hover:bg-muted/50 rounded -ml-2 pl-2">
            {msg.is_deleted ? (
              <span className="italic text-muted-foreground text-[13px]">
                This message was deleted
              </span>
            ) : (
              <span className="text-[14px] leading-relaxed whitespace-pre-wrap break-words text-foreground/90">
                {msg.content}
              </span>
            )}

            {!msg.is_deleted && (isMe || ["teacher", "admin", "superadmin"].includes(currentUser.role)) && (
              <div className="absolute right-2 opacity-0 group-hover/msg:opacity-100 transition-opacity bg-background border shadow-sm rounded">
                <DropdownMenu>
                  <DropdownMenuTrigger className="p-1 hover:bg-muted focus:outline-none flex items-center justify-center">
                    <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem
                      className="text-red-500 focus:bg-red-50 focus:text-red-600 cursor-pointer"
                      onClick={() => handleDelete(msg.id)}
                    >
                      <Trash className="w-4 h-4 mr-2" />
                      Delete Message
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

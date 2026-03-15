"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Loader2, Hash } from "lucide-react";
import { toast } from "sonner";

// Hooks
import { useChatMessages } from "@/hooks/useChatMessages";
import { useNotifications } from "@/components/providers/notification-provider";
import { useCloudinaryUpload } from "@/hooks/use-cloudinary-upload";
import { supabase } from "@/integrations/supabase/client";

// Components
import { ChannelHeader } from "./_components/ChannelHeader";
import { MessageItem } from "./_components/MessageItem";
import { MessageInput } from "./_components/MessageInput";
import { ChatSidebarRight } from "./_components/ChatSidebarRight";
import { ProfileDialog } from "./_components/ProfileDialog";

// Data & Utils
import { Message, Member } from "./data";
import { mapApiMember } from "./utils";

export default function ChatPage() {
  // Hooks
  const { 
    messages, 
    loading, 
    isConnected, 
    sendMessage, 
    deleteMessage, 
    editMessage, 
    currentUserId 
  } = useChatMessages();
  
  const { markAsRead } = useNotifications();
  const { uploadFile, isUploading } = useCloudinaryUpload();

  // State
  const [message, setMessage] = useState("");
  const [showMembers, setShowMembers] = useState(true);
  const [profileUser, setProfileUser] = useState<Member | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [replyingMsg, setReplyingMsg] = useState<{ id: string; username: string; content: string } | null>(null);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionIndex, setMentionIndex] = useState(0);
  const [membersList, setMembersList] = useState<Member[]>([]);
  const [pendingAttachments, setPendingAttachments] = useState<{ file: File; previewUrl: string }[]>([]);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Current user's username for mention highlighting
  const currentUsername = useMemo(() => {
    // Attempt to find current user's username from messages or session
    const own = messages.find((m) => m.user.id === currentUserId);
    return own?.user.username ?? null;
  }, [messages, currentUserId]);

  // Fetch members from Supabase
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const { data: users } = await supabase.from("user").select("user_id, username, type");
        const { data: details } = await supabase.from("user_details").select("user_id, first_name, last_name, avatar, sex, pronouns");
        
        if (users && details) {
          const members = users.map((u) => {
            const d = details.find((det) => det.user_id === u.user_id);
            // Using mapApiMember to ensure consistent structure
            return mapApiMember({
                userId: u.user_id,
                username: u.username,
                displayName: d ? `${d.first_name} ${d.last_name}`.trim() : u.username,
                avatar: d?.avatar || "",
                pronouns: d?.pronouns || (d?.sex === 'male' ? 'he/him' : d?.sex === 'female' ? 'she/her' : 'they/them'),
                grade: "N/A",
                roles: [],
                type: u.type || "student"
            }, []);
          });
          setMembersList(members);
        }
      } catch (error) {
        console.error("Error fetching members:", error);
      }
    };
    fetchMembers();
  }, []);

  // Helpers
  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const diff = today.getTime() - d.getTime();
    const days = diff / (1000 * 60 * 60 * 24);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    return d.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
  };

  const groupedMessages = useMemo(() => {
    const groups: { label: string; messages: Message[] }[] = [];
    let currentLabel = "";
    messages.forEach((msg) => {
      const label = getDateLabel(msg.createdAt);
      if (label !== currentLabel) {
        currentLabel = label;
        groups.push({ label, messages: [msg] });
      } else {
        groups[groups.length - 1].messages.push(msg);
      }
    });
    return groups;
  }, [messages]);

  // Auto-scroll on new messages
  useEffect(() => {
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
    if (messages.length > 0) {
      markAsRead();
    }
    return () => clearTimeout(timer);
  }, [messages.length, markAsRead]);

  // Handlers
  const handleSend = async () => {
    if (!message.trim() && pendingAttachments.length === 0) return;
    if (isUploading) return;

    try {
        const uploadedAttachments: { url: string; type: string; name?: string }[] = [];
        
        for (const att of pendingAttachments) {
            const url = await uploadFile(att.file);
            if (url) {
                uploadedAttachments.push({
                    url,
                    type: att.file.type,
                    name: att.file.name
                });
            }
        }

        if (editingMsgId) {
            await editMessage(editingMsgId, message.trim());
            setEditingMsgId(null);
        } else {
            const content = message.trim();
            // Mentions are extracted by the backend from the @ pattern
            await sendMessage(content, uploadedAttachments, [], replyingMsg?.id);
        }
        
        setMessage("");
        setReplyingMsg(null);
        pendingAttachments.forEach(att => URL.revokeObjectURL(att.previewUrl));
        setPendingAttachments([]);
    } catch (error) {
        toast.error("Failed to send message");
    }
  };

  const handleFileSelect = (files: File[]) => {
    const newPending = files.map(f => ({
      file: f,
      previewUrl: URL.createObjectURL(f)
    }));
    setPendingAttachments(prev => [...prev, ...newPending]);
  };

  const handleRemoveAttachment = (index: number) => {
    const newPending = [...pendingAttachments];
    URL.revokeObjectURL(newPending[index].previewUrl);
    newPending.splice(index, 1);
    setPendingAttachments(newPending);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (mentionQuery !== null && mentionIndex >= 0) {
        // Handled by MessageInput component mostly, but we can prevent default send here
        if (["ArrowDown", "ArrowUp", "Enter", "Tab"].includes(e.key)) {
            // Let the MessageInput's own suggestions handle these
            return;
        }
    }
    
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === "Escape") {
        if (editingMsgId) {
            setEditingMsgId(null);
            setMessage("");
        }
        if (replyingMsg) setReplyingMsg(null);
        setMentionQuery(null);
    }
  };

  const onDetectMention = (val: string) => {
    const cursorPos = (document.activeElement as HTMLInputElement)?.selectionStart || 0;
    const textBeforeCursor = val.slice(0, cursorPos);
    const match = textBeforeCursor.match(/@(\w*)$/);
    if (match) {
      setMentionQuery(match[1]);
      setMentionIndex(0);
    } else {
      setMentionQuery(null);
    }
  };

  const onMentionSelect = (username: string) => {
    const input = document.querySelector('input[aria-label="Message input"]') as HTMLInputElement;
    const cursorPos = input?.selectionStart || 0;
    const textBeforeCursor = message.slice(0, cursorPos);
    const textAfterCursor = message.slice(cursorPos);
    const beforeMention = textBeforeCursor.replace(/@(\w*)$/, "");
    const newMessage = `${beforeMention}@${username} ${textAfterCursor}`;
    setMessage(newMessage);
    setMentionQuery(null);
    setTimeout(() => {
      const newPos = beforeMention.length + username.length + 2;
      input?.focus();
      input?.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const handleOpenProfile = (userId: string) => {
    const member = membersList.find(m => m.id === userId);
    if (member) {
        setProfileUser(member);
        setShowProfile(true);
    }
  };

  const handleReply = (msg: Message) => {
    setReplyingMsg({ 
        id: msg.id, 
        username: msg.user.username, 
        content: msg.content 
    });
    setEditingMsgId(null);
  };

  const handleEdit = (id: string, content: string) => {
    setEditingMsgId(id);
    setMessage(content);
    setReplyingMsg(null);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden bg-card md:rounded-xl md:border md:shadow-sm">
      <ChannelHeader 
        channelName="Global Chat"
        showMembers={showMembers}
        messageCount={messages.length}
        isConnected={isConnected}
        onToggleMembers={() => setShowMembers(!showMembers)}
      />

      <div className="flex flex-1 min-h-0">
        <div className="flex-1 flex flex-col min-w-0">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-1">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground text-sm">Loading messages...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Hash className="w-10 h-10 mb-2" />
                  <p className="text-sm font-medium">No messages yet</p>
                  <p className="text-xs">Be the first to say something!</p>
                </div>
              ) : (
                groupedMessages.map((group) => (
                  <div key={group.label}>
                    <div className="flex items-center gap-3 my-4">
                      <Separator className="flex-1" />
                      <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">{group.label}</span>
                      <Separator className="flex-1" />
                    </div>
                    <div className="space-y-1">
                        {group.messages.map((msg) => (
                            <MessageItem 
                                key={msg.id}
                                msg={msg}
                                currentUserId={currentUserId}
                                currentUsername={currentUsername}
                                onReply={handleReply}
                                onCopy={(content) => {
                                    navigator.clipboard.writeText(content);
                                    toast.success("Copied to clipboard");
                                }}
                                onEdit={handleEdit}
                                onDelete={deleteMessage}
                                onOpenProfile={handleOpenProfile}
                            />
                        ))}
                    </div>
                  </div>
                ))
              )}
            </div>
            <div ref={messagesEndRef} className="h-px w-full" />
          </ScrollArea>

          <MessageInput 
            message={message}
            channelName="Global Chat"
            members={membersList}
            editingMessageId={editingMsgId}
            replyingMessage={replyingMsg}
            pendingAttachments={pendingAttachments}
            isUploading={isUploading}
            onChange={(val) => {
                setMessage(val);
                onDetectMention(val);
            }}
            onSend={handleSend}
            onKeyDown={handleKeyDown}
            onEmojiSelect={(emoji) => setMessage(prev => prev + emoji.emoji)}
            onCancelEdit={() => {
                setEditingMsgId(null);
                setMessage("");
            }}
            onCancelReply={() => setReplyingMsg(null)}
            onFileSelect={handleFileSelect}
            onRemoveAttachment={handleRemoveAttachment}
            onMentionSelect={onMentionSelect}
            mentionQuery={mentionQuery}
            mentionIndex={mentionIndex}
            setMentionIndex={setMentionIndex}
          />
        </div>

        {showMembers && (
          <ChatSidebarRight 
            members={membersList} 
            currentUserId={currentUserId || ""} 
            onSelectUser={(user) => handleOpenProfile(user.id)} 
          />
        )}
      </div>

      <ProfileDialog 
        open={showProfile}
        onOpenChange={setShowProfile}
        member={profileUser}
      />
    </div>
  );
}

"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { ChatImagePreview } from "@/components/chat-image-preview";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Send,
  Reply,
  Copy,
  Pencil,
  Trash2,
  Hash,
  Users,
  Smile,
  ImagePlus,
  Search,
  Loader2,
  X,
} from "lucide-react";
import { useChatMessages } from "@/features/chat/hooks/useChatMessages";
import { useNotifications } from "@/components/providers/notification-provider";
import { ChatSidebarRight } from "./ChatSidebarRight";
import { useCloudinaryUpload } from "@/hooks/use-cloudinary-upload";
import { supabase } from "@/services/supabase/client";

// ── Helpers ──

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function getDateLabel(date: Date) {
  const today = new Date();
  const d = new Date(date);
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  const diff = today.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return d.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
}

// ── Component ──

export default function ChatView() {
  const { messages, loading, loadingMore, hasMore, loadMore, isConnected, sendMessage, deleteMessage, editMessage, currentUserId } = useChatMessages();
  const { markAllRead } = useNotifications();
  const { uploadFile, isUploading } = useCloudinaryUpload();
  const [pendingAttachments, setPendingAttachments] = useState<{ file: File; previewUrl: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const previousScrollHeight = useRef<number>(0);
  
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showMembers, setShowMembers] = useState(true);
  const [profileUser, setProfileUser] = useState<{ id: string; name: string; username: string; role: string } | null>(null);
  const [deleteMsg, setDeleteMsg] = useState<string | null>(null);
  const [hoveredMsg, setHoveredMsg] = useState<string | null>(null);
  const [editingMsg, setEditingMsg] = useState<string | null>(null);
  const [replyingMsg, setReplyingMsg] = useState<{ id: string; username: string; content: string } | null>(null);
  const [editContent, setEditContent] = useState("");
  const [membersList, setMembersList] = useState<{ id: string; name: string; username: string; role: string }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch members from Supabase
  useEffect(() => {
    const fetchMembers = async () => {
      const { data: users } = await supabase
        .from("user")
        .select("id, username, type");
      const { data: details } = await supabase
        .from("user_details")
        .select("user_id, first_name, last_name");

      if (users) {
        const members = users.map((u: any) => {
          const d = details?.find((det: any) => det.user_id === u.id);
          return {
            id: u.id,
            name: d ? `${d.first_name} ${d.last_name}`.trim() : u.username,
            username: u.username,
            role: u.type ?? "student",
          };
        });
        setMembersList(members);
      }
    };
    fetchMembers();
  }, []);

  // filtered messages
  const filteredMessages = useMemo(() => {
    let result = messages;
    if (searchQuery) {
        result = result.filter(msg => 
            msg.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            msg.user.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }
    return result;
  }, [messages, searchQuery]);

  // Grouped messages
  const grouped = useMemo(() => {
    const groups: { label: string; messages: typeof filteredMessages }[] = [];
    let currentLabel = "";
    filteredMessages.forEach((msg) => {
      const label = getDateLabel(new Date(msg.createdAt));
      if (label !== currentLabel) {
        currentLabel = label;
        groups.push({ label, messages: [msg] });
      } else {
        groups[groups.length - 1].messages.push(msg);
      }
    });
    return groups;
  }, [filteredMessages]);

  const currentUsername = useMemo(() => membersList.find(m => m.id === currentUserId)?.username, [membersList, currentUserId]);

  const isInitialLoad = useRef(true);

  // Mark all read when messages change
  useEffect(() => {
    if (messages.length > 0) {
      markAllRead?.();
    }
  }, [messages.length, markAllRead]);

  // Adjust scroll position when historical messages are loaded,
  // or auto-scroll to bottom for new messages/initial load
  useEffect(() => {
    if (!scrollAreaRef.current) return;
    const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
    if (!viewport) return;

    if (previousScrollHeight.current > 0) {
      // Historical messages were added at the top
      const newScrollHeight = viewport.scrollHeight;
      const heightDifference = newScrollHeight - previousScrollHeight.current;

      // Keep scroll position relative to the elements that were previously there
      viewport.scrollTop = viewport.scrollTop + heightDifference;
      previousScrollHeight.current = 0; // Reset
    } else if (messages.length > 0) {
      // Normal new message or first load - scroll to bottom
      if (isInitialLoad.current) {
        // Skip smooth scroll animation on initial load to just "be" at the bottom
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
        isInitialLoad.current = false;
      } else {
        // Smooth scroll for subsequent new messages sent or received
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [messages.length]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;

    // Ensure we are only responding to the main scroll viewport
    if (!target.hasAttribute('data-radix-scroll-area-viewport')) {
      return;
    }

    if (target.scrollTop < 100 && hasMore && !loadingMore && !loading) {
      previousScrollHeight.current = target.scrollHeight;
      loadMore();
    }
  };

  const handleSend = async () => {
    if (!message.trim() && pendingAttachments.length === 0) return;
    if (isUploading) return;

    // Upload pending files first
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

    const content = message.trim();
    const extractMentions = (text: string) => {
      const matches = text.match(/@(\w+)/g);
      return matches ? matches.map((m) => m.slice(1)) : [];
    };
    const mentions = extractMentions(content);
    await sendMessage(content, uploadedAttachments, mentions, replyingMsg?.id || undefined);
    
    setMessage("");
    setReplyingMsg(null);
    // Cleanup preview URLs
    pendingAttachments.forEach(att => URL.revokeObjectURL(att.previewUrl));
    setPendingAttachments([]);
    inputRef.current?.focus();
  };

  const handleDelete = async () => {
    if (!deleteMsg) return;
    await deleteMessage(deleteMsg);
    setDeleteMsg(null);
  };

  const handleEditSave = async () => {
    if (!editingMsg || !editContent.trim()) return;
    const extractMentions = (text: string) => {
      const matches = text.match(/@(\w+)/g);
      return matches ? matches.map((m) => m.slice(1)) : [];
    };
    const mentions = extractMentions(editContent.trim());
    await editMessage(editingMsg, editContent.trim(), mentions);
    setEditingMsg(null);
    setEditContent("");
  };

  const renderContent = (content: string, mentions?: string[]) => {
    if (!mentions || mentions.length === 0) return content;
    let result = content;
    mentions.forEach((m) => {
      result = result.replace(`@${m}`, `%%MENTION_${m}%%`);
    });
    const parts = result.split(/(%%MENTION_\w+%%)/);
    return parts.map((part, i) => {
      const match = part.match(/%%MENTION_(\w+)%%/);
      if (match) {
        return (
          <span key={i} className="bg-primary/20 text-primary rounded px-1 font-medium">
            @{match[1]}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Channel Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card rounded-t-lg">
          <div className="flex items-center gap-2">
          <Hash className="w-5 h-5 text-muted-foreground" />
          <h2 className="font-semibold text-foreground">Global Chat</h2>
            <Badge variant="secondary" className="text-xs">{messages.length} messages</Badge>
            <span className={`h-2 w-2 rounded-full ml-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} title={isConnected ? 'Connected' : 'Disconnected'} />
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search messages..."
              className="bg-background border border-input rounded-md pl-7 pr-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-ring w-40 placeholder:text-muted-foreground"
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMembers(!showMembers)}
            className="hidden md:flex"
          >
            <Users className="w-4 h-4 mr-1" />
            Members
          </Button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        <div className="flex-1 flex flex-col min-w-0">
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef} onScrollCapture={handleScroll}>
            <div className="space-y-1">
              {loading && messages.length === 0 ? (
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
                <>
                  {loadingMore && (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    </div>
                  )}
                  {grouped.map((group) => (
                  <div key={group.label}>
                    <div className="flex items-center gap-3 my-4">
                      <Separator className="flex-1" />
                      <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">{group.label}</span>
                      <Separator className="flex-1" />
                    </div>
                    {group.messages.map((msg) => {
                      const isMentioned = currentUsername ? msg.mentions?.includes(currentUsername) : false;
                      const isReplyToMe = msg.replyTo && msg.replyTo.username === currentUsername;
                      const isEditing = editingMsg === msg.id;
                      const isOwn = msg.user.id === currentUserId;

                      return (
                        <div
                          key={msg.id}
                          className={`group flex items-start gap-3 px-3 py-1.5 rounded-md transition-colors relative animate-in fade-in slide-in-from-bottom-4 duration-300 ${
                            isMentioned ? "bg-primary/5 border-l-2 border-primary" : 
                            isReplyToMe ? "bg-accent/5 border-l-2 border-accent" :
                            "hover:bg-muted/50"
                          }`}
                          onMouseEnter={() => setHoveredMsg(msg.id)}
                          onMouseLeave={() => setHoveredMsg(null)}
                        >
                          <button onClick={() => setProfileUser({ id: msg.user.id, name: msg.user.name, username: msg.user.username, role: msg.user.badge ?? "student" })}>
                            <Avatar className="w-9 h-9 shrink-0 mt-0.5">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">{msg.user.avatar || msg.user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                          </button>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-baseline gap-2">
                              <button
                                onClick={() => setProfileUser({ id: msg.user.id, name: msg.user.name, username: msg.user.username, role: msg.user.badge ?? "student" })}
                                className="font-semibold text-sm text-foreground hover:underline"
                              >
                                {msg.user.name}
                              </button>
                              <span className="text-xs text-muted-foreground">{formatTime(new Date(msg.createdAt))}</span>
                            </div>
                            {isEditing ? (
                              <div className="flex items-center gap-2 mt-1">
                                <input
                                  value={editContent}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditContent(e.target.value)}
                                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                    if (e.key === "Enter") handleEditSave();
                                    if (e.key === "Escape") { setEditingMsg(null); setEditContent(""); }
                                  }}
                                  className="flex-1 bg-background border border-input rounded-md px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-ring"
                                  autoFocus
                                />
                                <Button size="sm" variant="ghost" onClick={() => { setEditingMsg(null); setEditContent(""); }}>Cancel</Button>
                                <Button size="sm" onClick={handleEditSave}>Save</Button>
                              </div>
                            ) : (
                              <>
                                {msg.replyTo && (
                                    <p className="mb-1 text-xs text-muted-foreground border-l-2 border-primary pl-2 italic">
                                      Replying to @{msg.replyTo.username}: {msg.replyTo.content.slice(0, 30)}{msg.replyTo.content.length > 30 ? '...' : ''}
                                    </p>
                                )}
                                <p className="text-sm text-foreground/90 wrap-break-word">{renderContent(msg.content, msg.mentions)}</p>
                              </>
                            )}
                            {msg.attachments && msg.attachments.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {msg.attachments.map((att, idx) => (
                                    <ChatImagePreview
                                      key={`${msg.id}-att-${idx}`}
                                      attachment={att}
                                      className="max-w-[200px]"
                                    />
                                  ))}
                                </div>
                            )}
                          </div>

                          {/* Message Actions */}
                          {hoveredMsg === msg.id && !isEditing && (
                            <div className="absolute right-2 -top-3 flex items-center bg-card border border-border rounded-md shadow-sm">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setReplyingMsg({ id: msg.id, username: msg.user.username, content: msg.content })}>
                                    <Reply className="w-3.5 h-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Reply</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigator.clipboard.writeText(msg.content)}>
                                    <Copy className="w-3.5 h-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Copy</TooltipContent>
                              </Tooltip>
                              {isOwn && (
                                <>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingMsg(msg.id); setEditContent(msg.content); }}>
                                        <Pencil className="w-3.5 h-3.5" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Edit</TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteMsg(msg.id)}>
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Delete</TooltipContent>
                                  </Tooltip>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
                </>
              )}
            </div>
            <div ref={messagesEndRef} className="h-px w-full" />
          </ScrollArea>

          <div className="px-3 py-2 border-t border-border bg-card mt-auto pb-9 ">
            {replyingMsg && (
              <div className="flex items-center justify-between mb-2 px-2 py-1.5 bg-muted/50 rounded-md text-xs">
                <span className="text-muted-foreground">
                  Replying to <span className="font-medium text-foreground">@{replyingMsg.username}</span>: {replyingMsg.content.slice(0, 50)}{replyingMsg.content.length > 50 ? '...' : ''}
                </span>
                <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setReplyingMsg(null)}>
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8" onClick={() => fileInputRef.current?.click()}>
                <ImagePlus className="w-4 h-4" />
              </Button>
              <input 
                ref={fileInputRef} 
                type="file" 
                multiple
                accept="image/*,video/*" 
                className="hidden" 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const files = Array.from(e.target.files || []);
                  const newPending = files.map(f => ({
                    file: f,
                    previewUrl: URL.createObjectURL(f)
                  }));
                  setPendingAttachments(prev => [...prev, ...newPending]);
                  e.target.value = '';
                }} 
              />
              <div className="flex-1 flex flex-col gap-2 relative">
                <div className="flex-1 relative flex items-center bg-background border border-input rounded-full transition-all duration-300 focus-within:ring-1 focus-within:ring-ring">
                <input
                  ref={inputRef}
                  value={message}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)}
                  placeholder="Message #Global Chat"
                  className="flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
                />
                <button className="px-2 text-muted-foreground hover:text-foreground transition-colors">
                  <Smile className="w-4 h-4" />
                </button>
              </div>
            </div>
              {(message.trim() || pendingAttachments.length > 0) && (
                <Button 
                  size="icon" 
                  onClick={handleSend} 
                  disabled={isUploading}
                  className="shrink-0 h-8 w-8"
                >
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              )}
            </div>
          </div>
        </div>

        {showMembers && (
          <ChatSidebarRight 
            members={membersList} 
            currentUserId={currentUserId} 
            onSelectUser={setProfileUser} 
          />
        )}
      </div>

      <Dialog open={!!profileUser} onOpenChange={() => setProfileUser(null)}>
        <DialogContent className="sm:max-w-sm">
          <div className="bg-primary/10 h-20 -mx-6 -mt-6 rounded-t-lg" />
          <div className="-mt-12 flex flex-col items-center">
            <Avatar className="w-16 h-16 border-4 border-background">
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                {profileUser?.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <DialogHeader>
              <DialogTitle className="font-bold text-center text-foreground mt-2">{profileUser?.name}</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">@{profileUser?.username}</p>
            <Badge variant="secondary" className="mt-2 capitalize">{profileUser?.role}</Badge>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteMsg} onOpenChange={() => setDeleteMsg(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete this message? This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

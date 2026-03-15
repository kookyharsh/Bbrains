"use client";

import { useState, useRef, useEffect, useMemo } from \"react\";
import Image from \"next/image\";
import { ChatImagePreview, type ChatAttachment } from \"@/components/chat-image-preview\";
import { Button } from \"@/components/ui/button\";
import { Avatar, AvatarFallback } from \"@/components/ui/avatar\";
import { Badge } from \"@/components/ui/badge\";
import { Separator } from \"@/components/ui/separator\";
import { ScrollArea } from \"@/components/ui/scroll-area\";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from \"@/components/ui/tooltip\";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from \"@/components/ui/dialog\";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from \"@/components/ui/alert-dialog\";
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
} from \"lucide-react\";
import { useChatMessages, type ChatMessageDisplay } from \"@/hooks/useChatMessages\";
import { useNotifications } from \"@/components/providers/notification-provider\";
import { ChatSidebarRight } from \"./ChatSidebarRight\";
import { useCloudinaryUpload } from \"@/hooks/use-cloudinary-upload\";
import { supabase } from \"@/integrations/supabase/client\";

// ── Helpers ──

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: \"2-digit\", minute: \"2-digit\" });
}

function getDateLabel(date: Date) {
  const today = new Date();
  const d = new Date(date);
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  const diff = today.getTime() - d.getTime();
  const days = diff / (1000 * 60 * 60 * 24);
  if (days === 0) return \"Today\";
  if (days === 1) return \"Yesterday\";
  return d.toLocaleDateString(\"en-US\", { day: \"numeric\", month: \"long\", year: \"numeric\" });
}

function groupMessagesByDate(messages: ChatMessageDisplay[]) {
  const groups: { label: string; messages: ChatMessageDisplay[] }[] = [];
  let currentLabel = \"\";
  messages.forEach((msg) => {
    const label = getDateLabel(msg.timestamp);
    if (label !== currentLabel) {
      currentLabel = label;
      groups.push({ label, messages: [msg] });
    } else {
      groups[groups.length - 1].messages.push(msg);
    }
  });
  return groups;
}

function renderContent(content: string, mentions?: string[]) {
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
        <span key={i} className=\"bg-primary/20 text-primary rounded px-1 font-medium\">
          @{match[1]}
        </span>
      );
    }
    return part;
  });
}

function extractMentions(content: string): string[] {
  const matches = content.match(/@(\w+)/g);
  return matches ? matches.map((m) => m.slice(1)) : [];
}

type ChatMessageWithAttachments = ChatMessageDisplay & {
  attachments?: { url: string; type: string; name?: string }[];
};

// ── Component ──

export default function ChatView() {
  const { messages, loading, isConnected, sendMessage, deleteMessage, editMessage, currentUserId } = useChatMessages();
  const { markAsRead } = useNotifications();
  const { uploadFile, isUploading } = useCloudinaryUpload();
  const [pendingAttachments, setPendingAttachments] = useState<{ file: File; previewUrl: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [message, setMessage] = useState(\"\");
  const [searchQuery, setSearchQuery] = useState(\"\");
  const [showMembers, setShowMembers] = useState(true);
  const [profileUser, setProfileUser] = useState<{ id: string; name: string; username: string; role: string } | null>(null);
  const [deleteMsg, setDeleteMsg] = useState<string | null>(null);
  const [hoveredMsg, setHoveredMsg] = useState<string | null>(null);
  const [editingMsg, setEditingMsg] = useState<string | null>(null);
  const [replyingMsg, setReplyingMsg] = useState<{ id: string; username: string; content: string } | null>(null);
  const [editContent, setEditContent] = useState(\"\");
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionIndex, setMentionIndex] = useState(0);
  const [membersList, setMembersList] = useState<{ id: string; name: string; username: string; role: string }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Current user's username for mention highlighting
  const currentUsername = useMemo(() => {
    const own = messages.find((m) => m.isOwn);
    return own?.username ?? null;
  }, [messages]);

  // Fetch members from Supabase
  useEffect(() => {
    const fetchMembers = async () => {
      const { data: users } = await supabase
        .from(\"user\")
        .select(\"user_id, username, type\");
      const { data: details } = await supabase
        .from(\"user_details\")
        .select(\"user_id, first_name, last_name\");

      if (users) {
        const members = users.map((u) => {
          const d = details?.find((det) => det.user_id === u.user_id);
          return {
            id: u.user_id,
            name: d ? `${d.first_name} ${d.last_name}`.trim() : u.username,
            username: u.username,
            role: u.type ?? \"student\",
          };
        });
        setMembersList(members);
      }
    };
    fetchMembers();
  }, []);

  // Group members by role for sidebar
  const membersByRole = useMemo(() => {
    const grouped: Record<string, typeof membersList> = {};
    membersList.forEach((m) => {
      if (!grouped[m.role]) grouped[m.role] = [];
      grouped[m.role].push(m);
    });
    return grouped;
  }, [membersList]);

  // Mention autocomplete
  const mentionSuggestions = mentionQuery !== null
    ? membersList
        .filter(
          (m) =>
            m.name.toLowerCase().includes(mentionQuery.toLowerCase()) ||
            m.username.toLowerCase().includes(mentionQuery.toLowerCase())
        )
        .slice(0, 3)
    : [];

  const detectMention = (value: string, cursorPos: number) => {
    const textBeforeCursor = value.slice(0, cursorPos);
    const match = textBeforeCursor.match(/@(\w*)$/);
    if (match) {
      setMentionQuery(match[1]);
      setMentionIndex(0);
    } else {
      setMentionQuery(null);
    }
  };

  const insertMention = (username: string) => {
    const input = inputRef.current;
    if (!input) return;
    const cursorPos = input.selectionStart || 0;
    const textBeforeCursor = message.slice(0, cursorPos);
    const textAfterCursor = message.slice(cursorPos);
    const beforeMention = textBeforeCursor.replace(/@(\w*)$/, \"\");
    const newMessage = `${beforeMention}@${username} ${textAfterCursor}`;
    setMessage(newMessage);
    setMentionQuery(null);
    setTimeout(() => {
      const newPos = beforeMention.length + username.length + 2;
      input.focus();
      input.setSelectionRange(newPos, newPos);
    }, 0);
  };

  // Filtered messages
  const filteredMessages = searchQuery
    ? messages.filter(
        (msg) =>
          msg.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          msg.displayName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages;
  const grouped = groupMessagesByDate(filteredMessages);

  // Auto-scroll on new messages or when sending
  useEffect(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: \"smooth\" });
    }, 100);
    // Mark as read when messages change while on this page
    if (messages.length > 0) {
      markAsRead();
    }
  }, [messages.length, markAsRead]);

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
    const mentions = extractMentions(content);
    await sendMessage(content, uploadedAttachments, mentions, replyingMsg?.id || undefined);
    
    setMessage(\"\");
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
    const mentions = extractMentions(editContent.trim());
    await editMessage(editingMsg, editContent.trim(), mentions);
    setEditingMsg(null);
    setEditContent(\"\");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (mentionQuery !== null && mentionSuggestions.length > 0) {
      if (e.key === \"ArrowDown\") {
        e.preventDefault();
        setMentionIndex((i) => Math.min(i + 1, mentionSuggestions.length - 1));
        return;
      }
      if (e.key === \"ArrowUp\") {
        e.preventDefault();
        setMentionIndex((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === \"Enter\" || e.key === \"Tab\") {
        e.preventDefault();
        insertMention(mentionSuggestions[mentionIndex].username);
        return;
      }
      if (e.key === \"Escape\") {
        e.preventDefault();
        setMentionQuery(null);
        return;
      }
    }
    if (e.key === \"Enter\" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className=\"flex flex-col h-full\">
      {/* Channel Header */}
      <div className=\"flex items-center justify-between px-4 py-3 border-b border-border bg-card rounded-t-lg\">
          <div className=\"flex items-center gap-2\">
          <Hash className=\"w-5 h-5 text-muted-foreground\" />
          <h2 className=\"font-semibold text-foreground\">Global Chat</h2>
            <Badge variant=\"secondary\" className=\"text-xs\">{messages.length} messages</Badge>
            <span className={`h-2 w-2 rounded-full ml-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} title={isConnected ? 'Connected' : 'Disconnected'} />
        </div>
        <div className=\"flex items-center gap-2\">
          <div className=\"relative\">
            <Search className=\"absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground\" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder=\"Search messages...\"
              className=\"bg-background border border-input rounded-md pl-7 pr-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-ring w-40 placeholder:text-muted-foreground\"
            />
          </div>
          <Button
            variant=\"ghost\"
            size=\"sm\"
            onClick={() => setShowMembers(!showMembers)}
            className=\"hidden md:flex\"
          >
            <Users className=\"w-4 h-4 mr-1\" />
            Members
          </Button>
        </div>
      </div>

      <div className=\"flex flex-1 min-h-0\">
        {/* Chat Area */}
        <div className=\"flex-1 flex flex-col min-w-0\">
          <ScrollArea className=\"flex-1 p-4\">
            <div className=\"space-y-1\">
              {loading ? (
                <div className=\"flex items-center justify-center py-12\">
                  <Loader2 className=\"w-6 h-6 animate-spin text-muted-foreground\" />
                  <span className=\"ml-2 text-muted-foreground text-sm\">Loading messages...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className=\"flex flex-col items-center justify-center py-12 text-muted-foreground\">
                  <Hash className=\"w-10 h-10 mb-2\" />
                  <p className=\"text-sm font-medium\">No messages yet</p>
                  <p className=\"text-xs\">Be the first to say something!</p>
                </div>
              ) : (
                grouped.map((group) => (
                  <div key={group.label}>
                    <div className=\"flex items-center gap-3 my-4\">
                      <Separator className=\"flex-1\" />
                      <span className=\"text-xs font-medium text-muted-foreground whitespace-nowrap\">{group.label}</span>
                      <Separator className=\"flex-1\" />
                    </div>
                    {group.messages.map((msg) => {
                      const isMentioned = currentUsername ? msg.mentions?.includes(currentUsername) : false;
                      const isReplyToMe = msg.replyToId && messages.find(m => m.id === msg.replyToId)?.userId === currentUserId;
                      const isEditing = editingMsg === msg.id;
                      return (
                        <div
                          key={msg.id}
                          className={`group flex items-start gap-3 px-3 py-1.5 rounded-md transition-colors relative animate-in fade-in slide-in-from-bottom-4 duration-300 ${
                            isMentioned ? \"bg-primary/5 border-l-2 border-primary\" : 
                            isReplyToMe ? \"bg-accent/5 border-l-2 border-accent\" :
                            \"hover:bg-muted/50\"
                          }`}
                          onMouseEnter={() => setHoveredMsg(msg.id)}
                          onMouseLeave={() => setHoveredMsg(null)}
                        >
                          <button onClick={() => setProfileUser({ id: msg.userId, name: msg.displayName, username: msg.username, role: \"student\" })}>
                            <Avatar className=\"w-9 h-9 shrink-0 mt-0.5\">
                              <AvatarFallback className=\"bg-primary/10 text-primary text-xs\">{msg.avatar}</AvatarFallback>
                            </Avatar>
                          </button>
                              <div className=\"min-w-0 flex-1\">
                            <div className=\"flex items-baseline gap-2\">
                              <button
                                onClick={() => setProfileUser({ id: msg.userId, name: msg.displayName, username: msg.username, role: \"student\" })}
                                className=\"font-semibold text-sm text-foreground hover:underline\"
                              >
                                {msg.displayName}
                              </button>
                              <span className=\"text-xs text-muted-foreground\">{formatTime(msg.timestamp)}</span>
                            </div>
                            {isEditing ? (
                              <div className=\"flex items-center gap-2 mt-1\">
                                <input
                                  value={editContent}
                                  onChange={(e) => setEditContent(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === \"Enter\") handleEditSave();
                                    if (e.key === \"Escape\") { setEditingMsg(null); setEditContent(\"\"); }
                                  }}
                                  className=\"flex-1 bg-background border border-input rounded-md px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-ring\"
                                  autoFocus
                                />
                                <Button size=\"sm\" variant=\"ghost\" onClick={() => { setEditingMsg(null); setEditContent(\"\"); }}>Cancel</Button>
                                <Button size=\"sm\" onClick={handleEditSave}>Save</Button>
                              </div>
                            ) : (
                              <>
                                {msg.replyToId && (() => {
                                  const repliedMsg = messages.find(m => m.id === msg.replyToId);
                                  return repliedMsg ? (
                                    <p className=\"mb-1 text-xs text-muted-foreground border-l-2 border-primary pl-2 italic\">
                                      Replying to @{repliedMsg.username}: {repliedMsg.content.slice(0, 30)}{repliedMsg.content.length > 30 ? '...' : ''}
                                    </p>
                                  ) : null;
                                })()}
                                <p className=\"text-sm text-foreground/90 wrap-break-word\">{renderContent(msg.content, msg.mentions)}</p>
                              </>
                            )}
                            {(() => {
                              const attachments = Array.isArray(msg.attachments) 
                                ? msg.attachments 
                                : typeof msg.attachments === 'string'
                                  ? JSON.parse(msg.attachments || '[]')
                                  : [];
                              
                              return attachments.length > 0 && (
                                <div className=\"mt-2 flex flex-wrap gap-2\">
                                  {attachments.map((att: any, idx: number) => (
                                    <ChatImagePreview
                                      key={`${msg.id}-att-${idx}`}
                                      attachment={att}
                                      className=\"max-w-[200px]\"
                                    />
                                  ))}
                                </div>
                              );
                            })()}
                          </div>

                          {/* Message Actions */}
                          {hoveredMsg === msg.id && !isEditing && (
                            <div className=\"absolute right-2 -top-3 flex items-center bg-card border border-border rounded-md shadow-sm\">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant=\"ghost\" size=\"icon\" className=\"h-7 w-7\" onClick={() => setReplyingMsg({ id: msg.id, username: msg.username, content: msg.content })}>
                                    <Reply className=\"w-3.5 h-3.5\" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Reply</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant=\"ghost\" size=\"icon\" className=\"h-7 w-7\" onClick={() => navigator.clipboard.writeText(msg.content)}>
                                    <Copy className=\"w-3.5 h-3.5\" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Copy</TooltipContent>
                              </Tooltip>
                              {msg.isOwn && (
                                <>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant=\"ghost\" size=\"icon\" className=\"h-7 w-7\" onClick={() => { setEditingMsg(msg.id); setEditContent(msg.content); }}>
                                        <Pencil className=\"w-3.5 h-3.5\" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Edit</TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant=\"ghost\" size=\"icon\" className=\"h-7 w-7 text-destructive\" onClick={() => setDeleteMsg(msg.id)}>
                                        <Trash2 className=\"w-3.5 h-3.5\" />
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
                ))
              )}
            </div>
            <div ref={messagesEndRef} className=\"h-px w-full\" />
          </ScrollArea>

          {/* Message Input */}
          <div className=\"px-3 py-2 border-t border-border bg-card mt-auto pb-9 \">
            {replyingMsg && (
              <div className=\"flex items-center justify-between mb-2 px-2 py-1.5 bg-muted/50 rounded-md text-xs\">
                <span className=\"text-muted-foreground\">
                  Replying to <span className=\"font-medium text-foreground\">@{replyingMsg.username}</span>: {replyingMsg.content.slice(0, 50)}{replyingMsg.content.length > 50 ? '...' : ''}
                </span>
                <Button variant=\"ghost\" size=\"icon\" className=\"h-5 w-5\" onClick={() => setReplyingMsg(null)}>
                  <X className=\"w-3 h-3\" />
                </Button>
              </div>
            )}
            <div className=\"flex items-center gap-1.5\">
              <Button variant=\"ghost\" size=\"icon\" className=\"shrink-0 h-8 w-8\" onClick={() => fileInputRef.current?.click()}>
                <ImagePlus className=\"w-4 h-4\" />
              </Button>
              <input 
                ref={fileInputRef} 
                type=\"file\" 
                multiple
                accept=\"image/*,video/*\" 
                className=\"hidden\" 
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  const newPending = files.map(f => ({
                    file: f,
                    previewUrl: URL.createObjectURL(f)
                  }));
                  setPendingAttachments(prev => [...prev, ...newPending]);
                  e.target.value = '';
                }} 
              />
              <div className=\"flex-1 flex flex-col gap-2 relative\">
                {pendingAttachments.length > 0 && (
                  <div className=\"flex flex-wrap gap-2 p-2 bg-muted/30 rounded-lg animate-in fade-in slide-in-from-bottom-2 duration-300\">
                    {pendingAttachments.map((att, idx) => (
                      <div key={idx} className=\"relative group\">
                        {att.file.type.startsWith('image/') ? (
                          <img
                            src={att.previewUrl}
                            alt=\"preview\"
                            className=\"h-16 w-16 object-cover rounded-md border border-border\"
                          />
                        ) : (
                          <div className=\"h-16 w-16 flex items-center justify-center bg-muted rounded-md border border-border\">
                            <Hash className=\"w-6 h-6 text-muted-foreground\" />
                          </div>
                        )}
                        <button
                          onClick={() => {
                            const newPending = [...pendingAttachments];
                            URL.revokeObjectURL(newPending[idx].previewUrl);
                            newPending.splice(idx, 1);
                            setPendingAttachments(newPending);
                          }}
                          className=\"absolute -top-1.5 -right-1.5 bg-background border border-border rounded-full p-0.5 shadow-sm hover:bg-muted transition-colors\"
                        >
                          <X className=\"w-3 h-3\" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className=\"flex-1 relative flex items-center bg-background border border-input rounded-full transition-all duration-300 focus-within:ring-1 focus-within:ring-ring\">
                {mentionQuery !== null && mentionSuggestions.length > 0 && (
                  <div className=\"absolute bottom-full left-0 mb-1 w-64 bg-popover border border-border rounded-md shadow-md overflow-hidden z-50\">
                    {mentionSuggestions.map((member, i) => (
                      <button
                        key={member.id}
                        className={`flex items-center gap-2 w-full px-3 py-2 text-sm transition-colors ${
                          i === mentionIndex ? \"bg-accent text-accent-foreground\" : \"hover:bg-muted/50 text-foreground\"
                        }`}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          insertMention(member.username);
                        }}
                        onMouseEnter={() => setMentionIndex(i)}
                      >
                        <Avatar className=\"w-6 h-6\">
                          <AvatarFallback className=\"bg-primary/10 text-primary text-[10px]\">
                            {member.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className=\"font-medium\">{member.name}</span>
                        <span className=\"text-muted-foreground\">@{member.username}</span>
                      </button>
                    ))}
                  </div>
                )}
                <input
                  ref={inputRef}
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    detectMention(e.target.value, e.target.selectionStart || 0);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder=\"Message #Global Chat\"
                  className={`flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground ${message.trim() ? 'w-[calc(100%-40px)]' : 'w-full'}`}
                />
                <button className=\"px-2 text-muted-foreground hover:text-foreground transition-colors\">
                  <Smile className=\"w-4 h-4\" />
                </button>
              </div>
            </div>
              {(message.trim() || pendingAttachments.length > 0) && (
                <Button 
                  size=\"icon\" 
                  onClick={handleSend} 
                  disabled={isUploading}
                  className=\"shrink-0 h-8 w-8 animate-in fade-in slide-in-from-right-4 duration-300\"
                >
                  {isUploading ? <Loader2 className=\"w-4 h-4 animate-spin\" /> : <Send className=\"w-4 h-4\" />}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Members List */}
        {showMembers && (
          <ChatSidebarRight 
            members={membersList} 
            currentUserId={currentUserId} 
            onSelectUser={setProfileUser} 
          />
        )}
      </div>

      {/* User Profile Dialog */}
      <Dialog open={!!profileUser} onOpenChange={() => setProfileUser(null)}>
        <DialogContent className=\"sm:max-w-sm\">
          <div className=\"bg-primary/10 h-20 -mx-6 -mt-6 rounded-t-lg\" />
          <div className=\"-mt-12 flex flex-col items-center\">
            <Avatar className=\"w-16 h-16 border-4 border-background\">
              <AvatarFallback className=\"bg-primary text-primary-foreground text-xl\">
                {profileUser?.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <DialogHeader>
              <DialogTitle className=\"font-bold text-center text-foreground mt-2\">{profileUser?.name}</DialogTitle>
            </DialogHeader>
            <p className=\"text-sm text-muted-foreground\">@{profileUser?.username}</p>
            <Badge variant=\"secondary\" className=\"mt-2 capitalize\">{profileUser?.role}</Badge>
          </div>
          <Separator />
          <div className=\"space-y-2 text-sm\">
            <div>
              <p className=\"font-semibold text-foreground text-xs uppercase tracking-wider\">Member Since</p>
              <p className=\"text-muted-foreground\">January 2026</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteMsg} onOpenChange={() => setDeleteMsg(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete this message? This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className=\"bg-destructive text-destructive-foreground hover:bg-destructive/90\">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

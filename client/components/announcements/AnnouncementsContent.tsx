"use client";

import { useState } from "react";
import { 
  Bell, 
  Search, 
  MessageSquare, 
  Trash2,
  ThumbsUp,
  Share2,
  Paperclip,
  Send
} from "lucide-react";
import { announcementApi, Announcement, User as ProfileUser } from "@/lib/api-services";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface AnnouncementsContentProps {
  initialAnnouncements: Announcement[];
  currentUser: ProfileUser | null;
}

export function AnnouncementsContent({ initialAnnouncements, currentUser }: AnnouncementsContentProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [searchQuery, setSearchQuery] = useState("");
  const [newAnnouncement, setNewAnnouncement] = useState("");
  const [posting, setPosting] = useState(false);

  const filteredAnnouncements = announcements.filter(
    (a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePost = async () => {
    if (!newAnnouncement.trim()) return;
    
    setPosting(true);
    try {
      // Extract first line as title, max 60 chars.
      const lines = newAnnouncement.trim().split('\n');
      let title = lines[0];
      if (title.length > 60) {
        title = title.substring(0, 60) + "...";
      }

      const response = await announcementApi.createAnnouncement({
        title,
        description: newAnnouncement.trim(),
        category: "general"
      });
      
      if (response.success && response.data) {
        setAnnouncements([response.data, ...announcements]);
        setNewAnnouncement("");
        toast.success("Announcement posted successfully");
      } else {
        toast.error(response.message || "Failed to post announcement");
      }
    } catch (err) {
      toast.error("Failed to post announcement");
    } finally {
      setPosting(false);
    }
  };

  const isStaff = currentUser?.type === "admin" || currentUser?.type === "teacher";

  return (
    <div className="relative min-h-[calc(100vh-8rem)] flex flex-col">
      <div className="max-w-4xl mx-auto w-full pb-32">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">Announcements</h2>
            <p className="text-muted-foreground mt-1">Stay updated with the latest news from your faculty.</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-card border border-border shadow-sm rounded-xl text-sm font-medium hover:bg-muted/50 transition-colors">
              Filter
            </button>
            <button className="px-4 py-2 bg-card border border-border shadow-sm rounded-xl text-sm font-medium hover:bg-muted/50 transition-colors">
              Mark all read
            </button>
          </div>
        </div>

        <div className="relative mb-8 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <input
            placeholder="Search announcements..."
            className="w-full bg-card border border-border shadow-sm rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="space-y-6">
          {filteredAnnouncements.length > 0 ? (
            filteredAnnouncements.map((announcement, index) => (
              <article key={announcement.id} className="bg-card border border-border shadow-sm rounded-xl overflow-hidden transition-all hover:shadow-md">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 border-2 border-primary/20">
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          {(announcement.user?.userDetails?.firstName?.[0]) || 'S'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-bold text-foreground">
                          {announcement.user?.userDetails?.firstName || 'System'} {announcement.user?.userDetails?.lastName || ''}
                        </h4>
                        <p className="text-xs text-muted-foreground capitalize">
                          {formatDistanceToNow(new Date(announcement.createdAt), { addSuffix: true })} • {announcement.category}
                        </p>
                      </div>
                    </div>
                    {index === 0 && (
                      <span className="px-2.5 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider rounded-full">
                        New
                      </span>
                    )}
                  </div>
                  <div className="mt-4">
                    {announcement.title && announcement.title !== newAnnouncement.trim().split('\n')[0].substring(0, 60) + (newAnnouncement.trim().split('\n')[0].length > 60 ? "..." : "") && (
                       <h3 className="text-xl font-bold text-foreground">{announcement.title}</h3>
                    )}
                    <div className="mt-3 text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {announcement.description}
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4 bg-muted/30 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors">
                      <ThumbsUp className="h-4 w-4" />
                      Acknowledge
                    </button>
                    <button className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors">
                      <MessageSquare className="h-4 w-4" />
                      Discuss
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {isStaff && (
                      <button className="text-muted-foreground hover:text-destructive transition-colors mr-2">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                    <button className="text-muted-foreground hover:text-foreground transition-colors">
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="py-12 text-center rounded-xl border-2 border-dashed border-border">
              <div className="inline-flex items-center justify-center p-4 rounded-full bg-muted mb-4">
                <Bell className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground">No announcements found</h3>
              <p className="text-muted-foreground mt-1">
                {searchQuery ? "Try a different search term" : "Check back later for updates"}
              </p>
            </div>
          )}

          {filteredAnnouncements.length > 0 && (
            <div className="flex justify-center py-6">
              <button className="flex items-center gap-2 text-sm font-bold text-primary hover:bg-primary/5 px-6 py-3 rounded-xl transition-colors">
                Load Previous Announcements
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Floating Chat Bar for Teachers/Admins */}
      {isStaff && (
        <div className="sticky bottom-6 left-0 right-0 max-w-4xl mx-auto w-full z-10 px-4 md:px-0 pointer-events-none">
          <div className="bg-card/95 backdrop-blur-md border border-border rounded-2xl shadow-xl flex items-end gap-3 p-2 pointer-events-auto">
            <button className="p-3 text-muted-foreground hover:text-primary transition-colors flex items-center justify-center shrink-0">
              <Paperclip className="h-5 w-5" />
            </button>
            <textarea
              className="flex-1 bg-transparent border-none py-3 px-2 text-sm text-foreground focus:outline-none focus:ring-0 resize-none min-h-[44px] max-h-[150px] placeholder:text-muted-foreground"
              placeholder="Send a new announcement..."
              value={newAnnouncement}
              onChange={(e) => {
                setNewAnnouncement(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handlePost();
                }
              }}
            />
            <button
              onClick={handlePost}
              disabled={!newAnnouncement.trim() || posting}
              className="h-11 w-11 shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

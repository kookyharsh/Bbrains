"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Megaphone, Search, Plus, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { announcementApi, Announcement } from "@/lib/api-services";

function getDateLabel(dateString: string) {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  const diff = today.getTime() - date.getTime();
  const days = diff / (1000 * 60 * 60 * 24);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return date.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
}

function renderMarkdown(text?: string) {
  if (!text) return <p className="text-foreground/90">No content</p>;
  const lines = text.split("\n");
  return lines.map((line, i) => {
    if (line.startsWith("### ")) {
      return <h3 key={i} className="font-bold text-foreground mt-2 mb-1">{line.slice(4)}</h3>;
    }
    if (line.startsWith("- ")) {
      return <li key={i} className="ml-4 text-foreground/90">{renderInline(line.slice(2))}</li>;
    }
    if (line.match(/^\d+\. /)) {
      return <li key={i} className="ml-4 list-decimal text-foreground/90">{renderInline(line.replace(/^\d+\. /, ""))}</li>;
    }
    if (line === "") return <br key={i} />;
    return <p key={i} className="text-foreground/90">{renderInline(line)}</p>;
  });
}

function renderInline(text?: string) {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+\*\*)/);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    category: "General",
  });

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await announcementApi.getAnnouncements();
        if (response.success && response.data) {
          setAnnouncements(response.data);
        } else {
          setError(response.message || "Failed to load announcements");
        }
      } catch (err) {
        setError("Failed to load announcements");
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  const handleCreateAnnouncement = async () => {
    if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    setCreating(true);
    try {
      const response = await announcementApi.createAnnouncement({
        title: newAnnouncement.title,
        content: newAnnouncement.content,
        category: newAnnouncement.category,
      });

      if (response.success && response.data) {
        setAnnouncements((prev) => [response.data!, ...prev]);
        setShowCreateDialog(false);
        setNewAnnouncement({ title: "", content: "", category: "General" });
        toast.success("Announcement created successfully");
      } else {
        toast.error(response.message || "Failed to create announcement");
      }
    } catch (err) {
      toast.error("Failed to create announcement");
    } finally {
      setCreating(false);
    }
  };

  const filteredAnnouncements = searchQuery
    ? announcements.filter(ann =>
        ann.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ann.content && ann.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (ann.author && ann.author.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : announcements;

  let lastDate = "";

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card rounded-t-lg">
        <div className="flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-muted-foreground" />
          <h2 className="font-semibold text-foreground">Announcements</h2>
          <Badge variant="secondary" className="text-xs">{filteredAnnouncements.length} posts</Badge>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search announcements..."
              className="bg-background border border-input rounded-md pl-7 pr-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-ring w-44 placeholder:text-muted-foreground"
            />
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-1" />
            New
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="max-w-3xl mx-auto space-y-1">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-3 px-3 py-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
              <p className="text-red-500">{error}</p>
              <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          ) : filteredAnnouncements.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Megaphone className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No announcements yet</p>
              <Button variant="outline" className="mt-4" onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-1" />
                Create First Announcement
              </Button>
            </div>
          ) : (
            filteredAnnouncements.map((ann) => {
              const dateLabel = getDateLabel(ann.createdAt);
              const showDate = dateLabel !== lastDate;
              lastDate = dateLabel;

              return (
                <div key={ann.id}>
                  {showDate && (
                    <div className="flex items-center gap-3 my-4">
                      <Separator className="flex-1" />
                      <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">{dateLabel}</span>
                      <Separator className="flex-1" />
                    </div>
                  )}
                  <div className="flex items-start gap-3 px-3 py-3 hover:bg-muted/50 rounded-md transition-colors">
                    <Avatar className="w-10 h-10 shrink-0 mt-0.5">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {ann.author ? ann.author.charAt(0).toUpperCase() : "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-foreground">{ann.author || "Unknown"}</span>
                        {ann.category && (
                          <Badge variant="outline" className="text-[10px] py-0">{ann.category}</Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {new Date(ann.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <h3 className="font-bold text-foreground mt-1 mb-1">{ann.title}</h3>
                      <div className="text-sm space-y-0.5">{renderMarkdown(ann.content)}</div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Create Announcement Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Announcement</DialogTitle>
            <DialogDescription>Share important information with everyone</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                placeholder="Announcement title"
                value={newAnnouncement.title}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
              />
            </div>
            <div>
              <Label>Category</Label>
              <Input
                placeholder="e.g., Academic, Event, General"
                value={newAnnouncement.category}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, category: e.target.value })}
              />
            </div>
            <div>
              <Label>Content</Label>
              <textarea
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Write your announcement here..."
                value={newAnnouncement.content}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateAnnouncement} disabled={creating}>
              {creating ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


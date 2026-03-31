"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, ExternalLink, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { announcementApi, Announcement } from "@/services/api/client";
import Link from "next/link";

interface AnnouncementsCardProps {
  initialAnnouncements?: Announcement[];
}

export function AnnouncementsCard({ initialAnnouncements }: AnnouncementsCardProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements || []);
  const [loading, setLoading] = useState(!initialAnnouncements);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialAnnouncements) {
      setLoading(false);
      return;
    }

    const fetchAnnouncements = async () => {
      try {
        const response = await announcementApi.getAnnouncements();
        if (response.success && response.data) {
          setAnnouncements(response.data.slice(0, 5));
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
  }, [initialAnnouncements]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Bell className="h-5 w-5 text-muted-foreground" />
          Announcements
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3 p-3">
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 p-3 text-sm text-red-500">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        ) : announcements.length === 0 ? (
          <div className="p-3 text-sm text-muted-foreground">
            No announcements yet
          </div>
        ) : (
          <div className="space-y-3">
            {announcements.map((announcement) => (
              <Link
                key={announcement.id}
                href={`/announcements`}
                className="flex items-start justify-between gap-2 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <div className="space-y-1">
                  <p className="font-medium text-sm">{announcement.title}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatDate(announcement.createdAt)}</span>
                    {announcement.category && (
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {announcement.category}
                      </span>
                    )}
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

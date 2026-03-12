"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Medal, Crown, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { leaderboardApi, LeaderboardEntry } from "@/lib/api-services";
import Link from "next/link";

interface LeaderboardCardProps {
  initialLeaderboard?: LeaderboardEntry[];
}

export function LeaderboardCard({ initialLeaderboard }: LeaderboardCardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(initialLeaderboard || []);
  const [loading, setLoading] = useState(!initialLeaderboard);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialLeaderboard) {
      setLoading(false);
      return;
    }

    const fetchLeaderboard = async () => {
      try {
        const response = await leaderboardApi.getLeaderboard();
        if (response.success && response.data) {
          // Transform server response to match client interface
          // Server returns: { id, rank, score, user: { username, userDetails: { firstName, lastName, avatar } } }
          // Client expects: { id, rank, xp, username, firstName, lastName, avatar }
          const transformedData = (response.data as any[]).map((entry) => ({
            id: entry.userId || entry.id || "",
            rank: entry.rank,
            xp: entry.score ?? entry.xp ?? 0,
            username: entry.user?.username || entry.username || 'Unknown',
            firstName: entry.user?.userDetails?.firstName || entry.firstName || "",
            lastName: entry.user?.userDetails?.lastName || entry.lastName || "",
            avatar: entry.user?.userDetails?.avatar || entry.avatar || "",
          })) as LeaderboardEntry[];
          setLeaderboard(transformedData.slice(0, 4));
        } else {
          setError(response.message || "Failed to load leaderboard");
        }
      } catch (err) {
        setError("Failed to load leaderboard");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [initialLeaderboard]);

  const getInitials = (firstName?: string, lastName?: string, username?: string) => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    if (firstName) return firstName.charAt(0).toUpperCase();
    if (username) return username.slice(0, 2).toUpperCase();
    return "?";
  };

  const getRankSuffix = (rank: number) => {
    if (rank >= 11 && rank <= 13) return "th";
    switch (rank % 10) {
      case 1: return "st";
      case 2: return "nd";
      case 3: return "rd";
      default: return "th";
    }
  };

  const formatRank = (rank: number) => `${rank}${getRankSuffix(rank)}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between p-2">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 p-3 text-sm text-red-500">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="p-3 text-sm text-muted-foreground">
            No leaderboard data yet
          </div>
        ) : (
          <div className="relative">
            <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-card to-transparent z-10 pointer-events-none" />
            <div className="space-y-3 max-h-[280px] overflow-hidden">
              {leaderboard.map((user) => (
              <div
                key={user.id}
                className={`flex items-center justify-between p-2 rounded-lg ${
                  user.rank <= 3 ? "bg-muted/50" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-medium w-6 ${
                    user.rank === 1 ? "text-amber-500" : 
                    user.rank === 2 ? "text-gray-400" : 
                    user.rank === 3 ? "text-amber-700" : ""
                  }`}>{formatRank(user.rank)}</span>
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                    {getInitials(user.firstName, user.lastName, user.username)}
                  </div>
                  <span className="text-sm font-medium">{user.username}</span>
                </div>
                <div className="flex items-center gap-2">
                  {user.rank === 1 && <Crown className="h-4 w-4 text-amber-500" />}
                  {user.rank === 2 && <Medal className="h-4 w-4 text-gray-400" />}
                  {user.rank === 3 && <Medal className="h-4 w-4 text-amber-700" />}
                  <span className="text-sm font-medium">{user.xp?.toLocaleString() ?? 0} XP</span>
                </div>
              </div>
            ))}
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-card to-transparent z-10 pointer-events-none" />
            <div className="relative z-20 pt-2">
              <Link
                href="/leaderboard"
                className="text-sm text-primary hover:underline flex items-center justify-center"
              >
                Show more
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

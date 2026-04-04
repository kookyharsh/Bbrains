"use client";

import { useEffect, useState, memo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Medal, Crown, AlertCircle, TrendingUp, Coins, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { leaderboardApi, LeaderboardEntry } from "@/services/api/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { transformLeaderboard } from "../utils";
import { LeaderboardLikeEntry } from "../types";

interface LeaderboardCardProps {
  initialLeaderboard?: LeaderboardEntry[];
}

export const LeaderboardCard = memo(function LeaderboardCard({ initialLeaderboard }: LeaderboardCardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(initialLeaderboard || []);
  const [myPosition, setMyPosition] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(!initialLeaderboard);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'xp' | 'points'>('xp');

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const [lbResponse, meResponse] = await Promise.all([
        leaderboardApi.getLeaderboard(sortBy),
        leaderboardApi.getMyPosition(sortBy)
      ]);

      if (lbResponse.success && lbResponse.data) {
        setLeaderboard(transformLeaderboard(lbResponse.data as LeaderboardLikeEntry[]).slice(0, 5));
      } else {
        setError(lbResponse.message || "Failed to load leaderboard");
      }

      if (meResponse.success && meResponse.data) {
        const transformed = transformLeaderboard([meResponse.data as LeaderboardLikeEntry]);
        setMyPosition(transformed[0]);
      }
    } catch (err) {
      setError("Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  }, [sortBy]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

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

  const isUserInTop = myPosition && leaderboard.some(user => user.id === myPosition.id);

  const RankItem = ({ user, isMe = false }: { user: LeaderboardEntry; isMe?: boolean }) => (
    <div
      className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
        isMe ? "bg-primary/10 border border-primary/20" : user.rank <= 3 ? "bg-muted/30" : "hover:bg-muted/20"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 flex justify-center">
          {user.rank === 1 ? <Crown className="h-5 w-5 text-amber-500" /> :
           user.rank === 2 ? <Medal className="h-5 w-5 text-slate-400" /> :
           user.rank === 3 ? <Medal className="h-5 w-5 text-amber-700" /> :
           <span className="text-sm font-semibold text-muted-foreground">{user.rank}</span>}
        </div>
        <Avatar className="h-8 w-8 border">
          <AvatarImage src={user.avatar} />
          <AvatarFallback name={user.username} className="text-[10px] bg-primary/5 text-primary">
            {getInitials(user.firstName, user.lastName, user.username)}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-sm font-medium leading-none">
            {user.username} {isMe && <span className="text-[10px] text-primary ml-1">(You)</span>}
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
              <TrendingUp className="h-2.5 w-2.5" /> {user.xp.toLocaleString()} XP
            </span>
            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
              <Coins className="h-2.5 w-2.5" /> {user.points?.toLocaleString() ?? 0} Pts
            </span>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <span className="text-xs font-bold text-foreground">
          {sortBy === 'xp' ? user.xp.toLocaleString() : (user.points?.toLocaleString() ?? 0)}
        </span>
        <span className="text-[10px] text-muted-foreground uppercase">{sortBy}</span>
      </div>
    </div>
  );

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-500/10 rounded-lg">
            <Trophy className="h-5 w-5 text-amber-600" />
          </div>
          <CardTitle className="text-lg font-bold">Leaderboard</CardTitle>
        </div>
        <div className="flex items-center bg-muted rounded-md p-1">
          <Button 
            variant={sortBy === 'xp' ? "secondary" : "ghost"} 
            size="sm" 
            className={`h-7 px-3 text-xs ${sortBy === 'xp' ? "bg-background shadow-sm" : ""}`}
            onClick={() => setSortBy('xp')}
          >
            XP
          </Button>
          <Button 
            variant={sortBy === 'points' ? "secondary" : "ghost"} 
            size="sm" 
            className={`h-7 px-3 text-xs ${sortBy === 'points' ? "bg-background shadow-sm" : ""}`}
            onClick={() => setSortBy('points')}
          >
            Points
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col p-4 pt-0">
        {loading && leaderboard.length === 0 ? (
          <div className="space-y-3 flex-grow">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-2">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-2 w-16" />
                  </div>
                </div>
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex-grow flex flex-col items-center justify-center p-6 text-center space-y-2">
            <AlertCircle className="h-8 w-8 text-red-500/50" />
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" size="sm" onClick={() => fetchLeaderboard()}>Retry</Button>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center p-6 text-center space-y-2">
            <Trophy className="h-8 w-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No leaderboard data yet</p>
          </div>
        ) : (
          <div className="flex-grow flex flex-col">
            <div className="space-y-2 mb-4">
              {leaderboard.map((user) => (
                <RankItem key={user.id} user={user} isMe={myPosition?.id === user.id} />
              ))}
            </div>

            {myPosition && !isUserInTop && (
              <>
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-dashed" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-card px-2 text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Your Position</span>
                  </div>
                </div>
                <div className="mb-4">
                  <RankItem user={myPosition} isMe={true} />
                </div>
              </>
            )}

            <div className="mt-auto pt-2">
              <Link href="/leaderboard" className="w-full">
                <Button variant="outline" className="w-full text-xs h-9 gap-2">
                  View Full Leaderboard
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
)

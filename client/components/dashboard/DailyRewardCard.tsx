"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, Star, AlertCircle, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { dashboardApi, streakApi, StreakData } from "@/lib/api-services";

interface DailyRewardCardProps {
  initialStreak?: StreakData | null;
}

export function DailyRewardCard({ initialStreak }: DailyRewardCardProps) {
  const [streak, setStreak] = useState<StreakData | null>(initialStreak || null);
  const [loading, setLoading] = useState(!initialStreak);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [claimedToday, setClaimedToday] = useState(false);

  useEffect(() => {
    if (initialStreak) {
      const today = new Date().toDateString();
      const lastActive = initialStreak.lastActiveDate
        ? new Date(initialStreak.lastActiveDate).toDateString()
        : null;
      setClaimedToday(lastActive === today);
      setLoading(false);
      return;
    }

    const fetchStreak = async () => {
      try {
        const response = await streakApi.getStreak();
        if (response.success && response.data) {
          setStreak(response.data);
          const today = new Date().toDateString();
          const lastActive = response.data.lastActiveDate
            ? new Date(response.data.lastActiveDate).toDateString()
            : null;
          setClaimedToday(lastActive === today);
        } else {
          setError(response.message || "Failed to load streak data");
        }
      } catch (err) {
        setError("Failed to load streak data");
      } finally {
        setLoading(false);
      }
    };

    fetchStreak();
  }, [initialStreak]);

  const handleClaim = async () => {
    setClaiming(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await dashboardApi.claimDaily();
      if (response.success && response.data) {
        setSuccess(`+${response.data.xp} XP earned!`);
        setClaimedToday(true);
        setStreak((prev) =>
          prev
            ? {
                ...prev,
                current: response.data?.streak ?? prev.current + 1,
                lastActiveDate: new Date().toISOString(),
              }
            : null
        );
      } else {
        setError(response.message || "Failed to claim reward");
      }
    } catch (err) {
      setError("Failed to claim reward");
    } finally {
      setClaiming(false);
    }
  };

  const day = streak?.current ?? 0;
  const xpReward = Math.min(50 + day * 10, 100);

  return (
    <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white border-0">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Daily Rewards
          </CardTitle>
          <span className="text-amber-200 text-xs font-medium">
            Day {Math.min(day + 1, 7)}/7
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-2 w-full mt-4" />
          </div>
        ) : error && !claimedToday ? (
          <div className="flex items-center gap-2 text-sm text-red-200">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-amber-100 text-sm">
                  {claimedToday ? "Reward claimed!" : "Claim your daily reward!"}
                </p>
                <p className="text-2xl font-bold">+{xpReward} XP</p>
                {success && (
                  <p className="text-sm text-green-200 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    {success}
                  </p>
                )}
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="bg-white text-orange-600 hover:bg-amber-100"
                onClick={handleClaim}
                disabled={claiming || claimedToday}
              >
                {claiming
                  ? "Claiming..."
                  : claimedToday
                  ? "Claimed"
                  : "Claim"}
              </Button>
            </div>
            <div className="flex gap-1 mt-4">
              {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                <div
                  key={d}
                  className={`h-2 flex-1 rounded-full ${
                    d <= day + 1 ? "bg-white" : "bg-white/30"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

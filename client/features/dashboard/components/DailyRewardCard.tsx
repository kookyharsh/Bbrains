"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, AlertCircle, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { dashboardApi, streakApi, StreakData } from "@/services/api/client";
import { useRouter } from "next/navigation";
import { TOTAL_DAYS, XP_REWARDS } from "@/features/dashboard/config/rewards";

interface DailyRewardCardProps {
  initialStreak?: StreakData | null;
}

export function DailyRewardCard({ initialStreak }: DailyRewardCardProps) {
  const router = useRouter();
  const [streak, setStreak] = useState<StreakData | null>(initialStreak || null);
  const [loading, setLoading] = useState(!initialStreak);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [claimedToday, setClaimedToday] = useState(false);

  const syncClaimState = (streakData: StreakData | null) => {
    if (!streakData) {
      setClaimedToday(false);
      return;
    }

    if (typeof streakData.canClaim === "boolean") {
      setClaimedToday(!streakData.canClaim);
      return;
    }

    const lastClaimed = streakData.lastClaimedAt
      ? new Date(streakData.lastClaimedAt).toDateString()
      : null;
    setClaimedToday(lastClaimed === new Date().toDateString());
  };

  useEffect(() => {
    if (initialStreak) {
      setStreak(initialStreak);
      syncClaimState(initialStreak);
      setLoading(false);
      return;
    }

    const fetchStreak = async () => {
      try {
        const response = await streakApi.getStreak();
        if (response.success && response.data) {
          setStreak(response.data);
          syncClaimState(response.data);
        } else {
          setError(response.message || "Failed to load streak data");
        }
      } catch {
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
        if (response.data.streak) {
          setStreak(response.data.streak);
          syncClaimState(response.data.streak);
        } else {
          setClaimedToday(true);
        }
        router.refresh();
      } else {
        setError(response.message || "Failed to claim reward");
      }
    } catch {
      setError("Failed to claim reward");
    } finally {
      setClaiming(false);
    }
  };

  const streakCount = Math.max(0, Number(streak?.currentStreak ?? 0));
  const cycleProgress = streakCount % TOTAL_DAYS;
  const currentRewardIndex = claimedToday
    ? (streakCount + TOTAL_DAYS - 1) % TOTAL_DAYS
    : cycleProgress;
  const displayDay = currentRewardIndex + 1;
  const xpReward = XP_REWARDS[currentRewardIndex] ?? XP_REWARDS[0];
  const completedBars = claimedToday
    ? cycleProgress === 0 && streakCount > 0
      ? TOTAL_DAYS
      : cycleProgress
    : cycleProgress;

  return (
    <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white border-0">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Daily Rewards
          </CardTitle>
          <span className="text-amber-200 text-xs font-medium">
            Day {displayDay}/{TOTAL_DAYS}
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
              {Array.from({ length: TOTAL_DAYS }, (_, index) => index + 1).map((d) => (
                <div
                  key={d}
                  className={`h-2 flex-1 rounded-full ${
                    d <= completedBars ? "bg-white" : "bg-white/30"
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

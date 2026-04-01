import { useState, useEffect } from "react";
import { TOTAL_DAYS, XP_REWARDS } from "../../config/rewards";
import { streakApi, StreakData } from "@/services/api/client";

// No longer needed, logic moved to component and server

export default function DailyReward() {
  const [data, setData] = useState<StreakData | null>(null);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    fetchStreak();
  }, []);

  const fetchStreak = async () => {
    const response = await streakApi.getStreak();
    if (response.success && response.data) {
      setData(response.data);
    }
  };

  const handleClaim = async () => {
    if (!data || !data.canClaim || animating) return;

    setAnimating(true);
    const response = await streakApi.claimStreak();
    if (response.success && response.data) {
      setData(response.data);
    }
    setTimeout(() => setAnimating(false), 600);
  };

  // Extremely defensive value extraction
  const _TOTAL_DAYS = TOTAL_DAYS || 7;
  const _XP_REWARDS = XP_REWARDS || [50, 50, 75, 75, 100, 100, 200];
  
  // Try multiple common property names just in case of casing issues or API unwrapping quirks
  let currentStreak = Number(data?.currentStreak ?? (data as any)?.current_streak ?? (data as any)?.streak ?? 0);
  if (isNaN(currentStreak)) currentStreak = 0;
  
  const canClaim = !!(data?.canClaim ?? (data as any)?.can_claim);

  // Logic to map streak to cycle
  let currentDay = 1;
  let claimedDaysCount = 0;
  let isClaimed = !canClaim;

  if (data) {
    if (canClaim) {
      // Haven't claimed today: 
      // currentDay is the NEXT one to claim (1-7)
      // claimedDaysCount is how many are currently filled from previous days
      currentDay = (currentStreak % _TOTAL_DAYS) + 1;
      claimedDaysCount = currentStreak % _TOTAL_DAYS;
    } else {
      // Already claimed today:
      // currentDay is the one we JUST claimed
      // claimedDaysCount should include the one we just claimed
      const cyclePos = currentStreak % _TOTAL_DAYS;
      currentDay = cyclePos === 0 ? _TOTAL_DAYS : cyclePos;
      claimedDaysCount = cyclePos === 0 ? _TOTAL_DAYS : cyclePos;
    }
  }

  // Ensure currentDay is a valid index for XP_REWARDS
  const safeIndex = Math.max(0, Math.min(_XP_REWARDS.length - 1, currentDay - 1));
  const xp = _XP_REWARDS[safeIndex] ?? 50;

  if (!data) {
    return (
      <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl p-5 w-80 h-[190px] flex items-center justify-center shadow-2xl shadow-orange-500/40">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          <p className="text-white/80 font-medium text-sm">Checking streak...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl p-5 w-80 shadow-2xl shadow-orange-500/40 select-none">
      {/* Decorative blobs */}
      <div className="absolute -top-7 -right-5 w-28 h-28 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-5 -left-5 w-20 h-20 bg-yellow-300/20 rounded-full blur-xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <span className="text-white font-bold text-lg tracking-tight">Daily Rewards</span>
        </div>
        <span className="text-yellow-300 font-bold text-sm">
          Day {currentDay}/{_TOTAL_DAYS}
        </span>
      </div>

      {/* Body */}
      <div className="relative z-10 flex justify-between items-center mb-5">
        <div>
          <p className="text-white/80 text-sm font-medium mb-1">
            {isClaimed ? (
              data.hoursUntilNextClaim > 0 
                ? `Next in ${Math.ceil(data.hoursUntilNextClaim)}h`
                : "Come back tomorrow!"
            ) : "Claim your daily reward!"}
          </p>
          <p className="text-white font-extrabold text-4xl tracking-tighter leading-none">
            +{xp}{" "}
            <span className="text-lg font-semibold opacity-80">XP</span>
          </p>
        </div>

        <button
          onClick={handleClaim}
          disabled={isClaimed || animating}
          className={`rounded-full px-6 py-2.5 font-bold text-base transition-all duration-200 shadow-md flex-shrink-0
            ${isClaimed
              ? "bg-white/30 text-white cursor-default"
              : "bg-white text-orange-500 hover:scale-105 active:scale-95 cursor-pointer"
            }`}
        >
          {isClaimed ? "✓ Claimed" : "Claim"}
        </button>
      </div>

      {/* Progress bars */}
      <div className="relative z-10 flex gap-1.5">
        {Array.from({ length: _TOTAL_DAYS }).map((_, i) => (
          <div key={i} className="flex-1 h-1.5 bg-white/25 rounded-full overflow-hidden">
            <div
              className={`h-full bg-white rounded-full transition-all duration-500 ease-out ${
                i < claimedDaysCount ? "w-full" : "w-0"
              }`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
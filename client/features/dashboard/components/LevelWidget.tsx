"use client"

import React, { useEffect, useState } from "react"
import { Trophy } from "lucide-react"
import { dashboardApi } from "@/services/api/client"

interface LevelWidgetProps {
  level: number;
  xp: number;
  nextLevelXp?: number | null;
  currentLevelXp?: number | null;
}

export function LevelWidget({ level: initialLevel, xp: initialXp, nextLevelXp, currentLevelXp }: LevelWidgetProps) {
  const [realtimeLevel, setRealtimeLevel] = useState<number | null>(null);
  const [realtimeXp, setRealtimeXp] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchRealtimeData = async () => {
      try {
        const response = await dashboardApi.getUser();
        if (mounted && response.success && response.data?.xp) {
          setRealtimeLevel(response.data.xp.level || 1);
          setRealtimeXp(response.data.xp.xp || 0);
        }
      } catch (error) {
        console.error("Failed to fetch realtime level data", error);
      }
    };

    fetchRealtimeData();
    const intervalId = setInterval(fetchRealtimeData, 15000); // Poll every 15 seconds
    
    // Refresh on focus to update XP if earned in another tab or after returning
    const handleFocus = () => fetchRealtimeData();
    window.addEventListener("focus", handleFocus);

    return () => {
      mounted = false;
      clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const safeLevel = realtimeLevel !== null ? realtimeLevel : (Number.isFinite(initialLevel) && initialLevel > 0 ? initialLevel : 1);
  const safeXp = realtimeXp !== null ? realtimeXp : (Number.isFinite(initialXp) && initialXp > 0 ? initialXp : 0);
  
  const fallbackCurrentLevelXp = Math.max(0, (safeLevel - 1) * 1000);
  const fallbackNextLevelXp = safeLevel * 1000;
  
  // Only use server-provided XP bounds if the level hasn't changed on the client
  const isLevelMatching = safeLevel === initialLevel;

  const resolvedCurrentLevelXp =
    isLevelMatching && typeof currentLevelXp === "number" && Number.isFinite(currentLevelXp)
      ? currentLevelXp
      : fallbackCurrentLevelXp;
  const resolvedNextLevelXp =
    isLevelMatching && typeof nextLevelXp === "number" && Number.isFinite(nextLevelXp)
      ? nextLevelXp
      : fallbackNextLevelXp;

  const hasNextLevel = resolvedNextLevelXp > resolvedCurrentLevelXp;

  // Some responses can have xp lower than currentLevelXp (stale/mismatched level thresholds).
  // In that case, treat progress start as 0 so the bar still reflects remaining XP.
  const progressStartXp = safeXp >= resolvedCurrentLevelXp ? resolvedCurrentLevelXp : 0;
  const xpNeeded = hasNextLevel ? Math.max(resolvedNextLevelXp - progressStartXp, 0) : 0;
  const xpInLevel = Math.max(safeXp - progressStartXp, 0);
  const xpRemaining = hasNextLevel ? Math.max(resolvedNextLevelXp - safeXp, 0) : 0;
  const progress = hasNextLevel && xpNeeded > 0
    ? Math.min(100, Math.max(0, Math.round((xpInLevel / xpNeeded) * 100)))
    : 100;

  return (
    <div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm">Level Progress</h3>
        <div className="w-8 h-8 rounded-lg bg-brand-orange/10 flex items-center justify-center text-brand-orange">
          <Trophy className="w-4 h-4" />
        </div>
      </div>
      
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-end">
          <span className="text-2xl font-bold">Lvl {safeLevel}</span>
          <span className="text-sm text-muted-foreground">
            {hasNextLevel ? `${xpRemaining} XP left` : "MAX XP"}
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div 
            className="bg-brand-orange h-full rounded-full transition-all duration-500 ease-out" 
            style={{ width: `${progress}%` }} 
          />
        </div>
        {hasNextLevel && (
          <p className="text-xs text-muted-foreground mt-1 text-center">
            {xpRemaining} XP to Level {safeLevel + 1}
          </p>
        )}
      </div>
    </div>
  )
}

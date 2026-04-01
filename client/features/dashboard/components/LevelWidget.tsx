"use client"

import React from "react"
import { Trophy } from "lucide-react"

interface LevelWidgetProps {
  level: number;
  xp: number;
  nextLevelXp?: number | null;
  currentLevelXp?: number | null;
}

export function LevelWidget({ level, xp, nextLevelXp, currentLevelXp }: LevelWidgetProps) {
  const safeLevel = Number.isFinite(level) && level > 0 ? level : 1;
  const safeXp = Number.isFinite(xp) && xp > 0 ? xp : 0;
  const fallbackCurrentLevelXp = Math.max(0, (safeLevel - 1) * 1000);
  const fallbackNextLevelXp = safeLevel * 1000;
  const resolvedCurrentLevelXp =
    typeof currentLevelXp === "number" && Number.isFinite(currentLevelXp)
      ? currentLevelXp
      : fallbackCurrentLevelXp;
  const resolvedNextLevelXp =
    typeof nextLevelXp === "number" && Number.isFinite(nextLevelXp)
      ? nextLevelXp
      : fallbackNextLevelXp;
  const hasNextLevel = resolvedNextLevelXp > resolvedCurrentLevelXp;

  const xpNeeded = hasNextLevel ? Math.max(resolvedNextLevelXp - resolvedCurrentLevelXp, 0) : 0;
  const xpInLevel = Math.max(safeXp - resolvedCurrentLevelXp, 0);
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

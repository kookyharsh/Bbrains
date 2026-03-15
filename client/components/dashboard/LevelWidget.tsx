"use client"

import React from "react"
import { Trophy } from "lucide-react"

interface LevelWidgetProps {
  level: number;
  xp: number;
  nextLevelXp?: number | null;
}

export function LevelWidget({ level, xp, nextLevelXp }: LevelWidgetProps) {
  const progress = nextLevelXp ? Math.min(100, Math.max(0, Math.round((xp / nextLevelXp) * 100))) : 100;

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
          <span className="text-2xl font-bold">Lvl {level}</span>
          <span className="text-sm text-muted-foreground">{xp} / {nextLevelXp || "MAX"} XP</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div 
            className="bg-brand-orange h-full rounded-full transition-all duration-500 ease-out" 
            style={{ width: `${progress}%` }} 
          />
        </div>
        {nextLevelXp && (
          <p className="text-xs text-muted-foreground mt-1 text-center">
            {nextLevelXp - xp} XP to Level {level + 1}
          </p>
        )}
      </div>
    </div>
  )
}

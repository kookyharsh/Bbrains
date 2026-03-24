"use client"

import React from "react"
import { Trophy, Lock, CheckCircle2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

interface AchievementCardProps {
    achievement: {
        id: string | number
        name: string
        description?: string
        icon?: string
        unlockedAt?: string
        requiredXp?: number | string
    }
    isUnlocked: boolean
}

export function AchievementCard({ achievement, isUnlocked }: AchievementCardProps) {
    return (
        <Card className={cn(
            "overflow-hidden transition-all duration-300",
            isUnlocked ? "border-brand-orange/30 bg-brand-orange/5 shadow-md" : "opacity-60 grayscale bg-muted/30"
        )}>
            <CardContent className="p-4 flex items-center gap-4">
                <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm border",
                    isUnlocked ? "bg-brand-orange text-white border-brand-orange" : "bg-muted text-muted-foreground border-border"
                )}>
                    {isUnlocked ? <Trophy className="h-6 w-6" /> : <Lock className="h-5 w-5" />}
                </div>
                
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm truncate">{achievement.name}</h4>
                        {isUnlocked && <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">{achievement.description}</p>
                    
                    {!isUnlocked && achievement.requiredXp && (
                        <p className="text-[10px] font-bold text-brand-orange mt-1 uppercase tracking-wider">
                            Requires {achievement.requiredXp} XP
                        </p>
                    )}
                    
                    {isUnlocked && achievement.unlockedAt && (
                        <p className="text-[10px] text-muted-foreground mt-1">
                            Unlocked on {format(new Date(achievement.unlockedAt), "PPP")}
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

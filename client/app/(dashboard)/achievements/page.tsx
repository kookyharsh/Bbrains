"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { Calendar, Sparkles, Trophy } from "lucide-react"

import { useUser } from "@/hooks/use-user"
import { achievementApi } from "@/services/api/client"
import type { UserAchievement } from "@/services/api/client"

export default function AchievementsPage() {
  const { user, loading: userLoading } = useUser()
  const [achievements, setAchievements] = useState<UserAchievement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const fetchAchievements = async () => {
      if (userLoading) return

      if (!user) {
        if (isMounted) {
          setAchievements([])
          setLoading(false)
        }
        return
      }

      setLoading(true)

      try {
        const response = await achievementApi.getMyAchievements()

        if (response.success && Array.isArray(response.data) && isMounted) {
          setAchievements(response.data)
        }
      } catch (error) {
        console.error("Failed to fetch achievements:", error)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchAchievements()

    return () => {
      isMounted = false
    }
  }, [user, userLoading])

  if (loading || userLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="text-muted-foreground">Loading achievements...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex h-full flex-col items-center justify-center space-y-4 p-8 text-center">
        <Trophy className="h-16 w-16 text-muted-foreground/30" />
        <h2 className="text-xl font-semibold">Sign in to view achievements</h2>
        <p className="text-muted-foreground">
          Your unlocked milestones will appear here once you are signed in.
        </p>
      </div>
    )
  }

  if (achievements.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center space-y-4 p-8 text-center">
        <Trophy className="h-16 w-16 text-muted-foreground/30" />
        <h2 className="text-xl font-semibold">No Achievements Yet</h2>
        <p className="text-muted-foreground">
          Keep exploring the platform to unlock your first achievement.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl p-4 md:p-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold tracking-tight">
          My Achievements
        </h1>
        <p className="text-muted-foreground">
          View the milestones you&apos;ve unlocked on your learning journey.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {achievements.map((item) => (
          <div
            key={item.achievement.id}
            className="relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md"
          >
            <div className="absolute top-0 right-0 -mr-8 -mt-8 h-16 w-16 rounded-full bg-primary/10" />

            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                {item.achievement.icon ? (
                  <img
                    src={item.achievement.icon}
                    alt={item.achievement.name}
                    className="h-8 w-8 object-contain"
                  />
                ) : (
                  <Trophy className="h-8 w-8" />
                )}
              </div>

              <h3 className="mb-1 text-lg font-semibold">
                {item.achievement.name}
              </h3>

              {item.achievement.description && (
                <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                  {item.achievement.description}
                </p>
              )}

              <div className="mt-auto flex items-center space-x-4">
                <span className="inline-flex items-center text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <Sparkles className="mr-1 h-3 w-3" />
                  +{item.achievement.rewardXP} XP
                </span>
                <span className="inline-flex items-center text-xs font-medium text-amber-600 dark:text-amber-400">
                  +{item.achievement.rewardCoins} Coins
                </span>
              </div>

              <div className="mt-4 flex w-full items-center justify-center border-t pt-4 text-xs text-muted-foreground">
                <Calendar className="mr-1.5 h-3 w-3" />
                Unlocked on {format(new Date(item.unlockedAt), "MMM d, yyyy")}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

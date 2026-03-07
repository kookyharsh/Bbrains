import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ItemMedia, ItemTitle, ItemDescription } from "@/components/ui/item"
import { Sparkles, Wallet } from "lucide-react"
import { DashboardData } from "../data"
import { formatCurrency } from "../utils"

type Stats = DashboardData["stats"]

interface StatsCardsProps {
  stats: Stats
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
      <Card className="overflow-hidden shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center py-6 px-4">
          <ItemMedia variant="icon" className="size-10 rounded-2xl bg-primary/10 text-primary">
            <Sparkles className="size-5 shrink-0" />
          </ItemMedia>
          <div className="flex flex-1 flex-col overflow-hidden px-4">
            <ItemTitle className="text-base font-bold text-foreground">Daily Points</ItemTitle>
            <ItemDescription className="text-xs font-semibold text-muted-foreground">
              {stats.streak > 0
                ? `🔥 ${stats.streak}-day streak! Keep it up!`
                : "Start your streak today!"}
            </ItemDescription>
          </div>
          <Button
            size="lg"
            className="rounded-full bg-primary px-5 font-bold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all shrink-0"
          >
            Claim
          </Button>
        </div>
      </Card>

      <Card className="overflow-hidden shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center py-6 px-4">
          <ItemMedia variant="icon" className="size-10 rounded-2xl bg-primary/10 text-primary">
            <Wallet className="size-5 shrink-0" />
          </ItemMedia>
          <div className="flex flex-1 flex-col overflow-hidden px-4">
            <ItemTitle className="text-base font-bold text-foreground">Wallet Balance</ItemTitle>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {formatCurrency(Number(stats.walletBalance))}
              </span>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">XP & Level</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">Level {stats.level}</div>
          <p className="text-xs text-muted-foreground">
            {Number(stats.xp).toLocaleString()} XP earned
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Courses Enrolled</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{stats.totalCourses}</div>
          <p className="text-xs text-muted-foreground">
            {stats.leaderboardRank
              ? `Rank #${stats.leaderboardRank} on leaderboard`
              : "Not ranked yet"}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Item, ItemDescription, ItemTitle, ItemMedia } from "@/components/ui/item"
import { BookOpen } from "lucide-react"
import { DashboardData } from "@/lib/types/api"

type RecentGrade = NonNullable<DashboardData["recentGrades"]>[number]

interface RecentGradesProps {
  recentGrades: RecentGrade[]
}

export function RecentGrades({ recentGrades }: RecentGradesProps) {
  return (
    <Card className="col-span-4 min-h-87.5 shadow-sm transition-all hover:shadow-md border-border">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border/50">
        <div className="flex flex-col ">
          <CardTitle className="text-xl font-bold text-foreground">Recent Grades</CardTitle>
          <p className="text-xs font-medium text-muted-foreground">
            {recentGrades.length > 0
              ? `Your last ${recentGrades.length} graded assignment${
                  recentGrades.length > 1 ? "s" : ""
                }`
              : "No grades yet"}
          </p>
        </div>
        <Button variant="ghost" size="sm" className="text-primary font-bold hover:bg-primary/10">
          View All
        </Button>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        {recentGrades.length > 0 ? (
          recentGrades.map((g, i) => (
            <Item
              key={i}
              className="border border-border bg-card hover:border-primary/30 hover:shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] transition-all"
            >
              <ItemMedia variant="icon" className="size-10 rounded-xl bg-primary/10 text-primary">
                <BookOpen className="size-5" />
              </ItemMedia>
              <div className="flex flex-1 flex-col overflow-hidden px-1">
                <ItemTitle className="text-sm font-bold text-foreground line-clamp-1 truncate">
                  {g.assignment.title}
                </ItemTitle>
                <ItemDescription className="text-xs font-medium text-muted-foreground line-clamp-1 truncate">
                  Grade: {g.grade}
                </ItemDescription>
              </div>
            </Item>
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">No grades to show yet</p>
        )}
      </CardContent>
    </Card>
  )
}


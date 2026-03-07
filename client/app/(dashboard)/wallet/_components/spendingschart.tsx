"use client"

import {
    ChartContainer, ChartLegend, ChartLegendContent,
    ChartTooltip, ChartTooltipContent,
} from "@/components/ui/chart"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingDown, TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { chartConfig } from "../data"
import { formatCurrency } from "../utils"

interface ChartDataPoint {
    day: string
    spent: number
    received: number
}

interface SpendingChartProps {
    chartData: ChartDataPoint[]
    chartRange: "week" | "month" | "3months"
    onRangeChange: (range: "week" | "month" | "3months") => void
}

const RANGE_OPTIONS = [
    { key: "week", label: "This Week" },
    { key: "month", label: "This Month" },
    { key: "3months", label: "Last 3 Months" },
] as const

export function SpendingChart({ chartData, chartRange, onRangeChange }: SpendingChartProps) {
    const totalSpent = chartData.reduce((s, d) => s + d.spent, 0)
    const totalReceived = chartData.reduce((s, d) => s + d.received, 0)

    return (
        <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-lg font-bold text-foreground">Spending Overview</CardTitle>
                    <CardDescription>Your money flow at a glance</CardDescription>
                </div>
                <CardAction>
                    <div className="flex gap-1 bg-muted/50 rounded-full p-0.5">
                        {RANGE_OPTIONS.map(opt => (
                            <button
                                key={opt.key}
                                onClick={() => onRangeChange(opt.key)}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${chartRange === opt.key
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </CardAction>
            </CardHeader>

            <CardContent>
                <ChartContainer config={chartConfig} className="aspect-auto h-64 w-full">
                    <BarChart data={chartData} barGap={4}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
                        <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} width={50} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Bar dataKey="spent" fill="var(--color-spent)" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="received" fill="var(--color-received)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                </ChartContainer>

                {/* Summary stats */}
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-border/50">
                    <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-red-50 dark:bg-red-950/20">
                        <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                            <TrendingDown className="size-4 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-medium">Total Spent</p>
                            <p className="text-base font-bold text-red-600 dark:text-red-400">
                                {formatCurrency(totalSpent)}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-green-50 dark:bg-green-950/20">
                        <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                            <TrendingUp className="size-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-medium">Total Received</p>
                            <p className="text-base font-bold text-green-600 dark:text-green-400">
                                {formatCurrency(totalReceived)}
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
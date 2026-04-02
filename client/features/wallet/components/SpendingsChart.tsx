"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";

const chartData = [
  { month: "Jan", sent: 450, received: 800 },
  { month: "Feb", sent: 320, received: 600 },
  { month: "Mar", sent: 180, received: 350 },
];

export function SpendingsChart() {
  const [chartFilter, setChartFilter] = useState("this-month");

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Spending Overview</CardTitle>
        <Tabs value={chartFilter} onValueChange={setChartFilter}>
          <TabsList className="h-8">
            <TabsTrigger value="this-week" className="text-xs px-2">This Week</TabsTrigger>
            <TabsTrigger value="this-month" className="text-xs px-2">This Month</TabsTrigger>
            <TabsTrigger value="3-months" className="text-xs px-2">3 Months</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
              <XAxis dataKey="month" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <RechartsTooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))", 
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--foreground))"
                }}
              />
              <Bar dataKey="sent" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} name="Sent" />
              <Bar dataKey="received" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} name="Received" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

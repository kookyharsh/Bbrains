"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { ChartDataItem } from "../_types";

interface GenderDistributionChartProps {
  data: ChartDataItem[];
}

export function GenderDistributionChart({ data }: GenderDistributionChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Gender Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-4 mt-2">
          {data.map((g) => (
            <div key={g.name} className="flex items-center gap-1.5 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: g.color }}
              />
              <span className="text-muted-foreground">
                {g.name}: {g.value}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

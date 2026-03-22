"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  GraduationCap,
  BookOpen,
  UserCheck,
} from "lucide-react";
import type { StatItem } from "../_types";

interface StatsCardsProps {
  stats: StatItem[];
}

const iconMap: Record<string, typeof Users> = {
  totalStudents: Users,
  totalTeachers: GraduationCap,
  activeCourses: BookOpen,
  avgAttendance: UserCheck,
};

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => {
        const Icon = iconMap[stat.label.toLowerCase().replace(/\s+/g, "")] || Users;
        return (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Icon className="w-5 h-5 text-muted-foreground" />
                <Badge variant="secondary" className="text-xs text-green-600">
                  {stat.change}
                </Badge>
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

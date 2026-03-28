"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";
import type { ApiUser } from "@/lib/types/api";
import { hasManagerRole } from "../_types";

interface StatsCardsProps {
  users: ApiUser[];
}

export function StatsCards({ users }: StatsCardsProps) {
  const stats = [
    { label: "Total Users", value: users.length, icon: Users },
    { label: "Managers", value: users.filter((u) => hasManagerRole(u)).length },
    { label: "Students", value: users.filter(u => u.type === "student").length },
    { label: "Teachers", value: users.filter(u => u.type === "teacher").length },
    { label: "Admins", value: users.filter(u => u.type === "admin").length },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {stats.map((s, i) => (
        <Card key={i}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

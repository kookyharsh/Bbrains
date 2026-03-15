"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  GraduationCap,
  BookOpen,
  TrendingUp,
  UserCheck,
  UserX,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

const stats = [
  { label: "Total Students", value: 1248, icon: Users, change: "+12%" },
  { label: "Total Teachers", value: 56, icon: GraduationCap, change: "+3%" },
  { label: "Active Courses", value: 34, icon: BookOpen, change: "+5%" },
  { label: "Avg Attendance", value: "86%", icon: UserCheck, change: "+2%" },
];

const genderData = [
  { name: "Male", value: 680, color: "var(--chart-1)" },
  { name: "Female", value: 548, color: "var(--chart-2)" },
  { name: "Other", value: 20, color: "var(--chart-3)" },
];

const enrollmentData = [
  { month: "Sep", students: 200 },
  { month: "Oct", students: 350 },
  { month: "Nov", students: 480 },
  { month: "Dec", students: 520 },
  { month: "Jan", students: 680 },
  { month: "Feb", students: 850 },
  { month: "Mar", students: 1248 },
];

const courseData = [
  { name: "CS", students: 320 },
  { name: "Math", students: 280 },
  { name: "Physics", students: 210 },
  { name: "English", students: 180 },
  { name: "History", students: 150 },
  { name: "Art", students: 108 },
];

export default function StatisticsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Statistics</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Icon className="w-5 h-5 text-muted-foreground" />
                  <Badge variant="secondary" className="text-xs text-green-600">{stat.change}</Badge>
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrollment Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Enrollment Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={enrollmentData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="students" stroke="var(--chart-1)" strokeWidth={2} dot={{ fill: "var(--chart-1)" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Gender Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Gender Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderData}
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {genderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-2">
              {genderData.map((g) => (
                <div key={g.name} className="flex items-center gap-1.5 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: g.color }} />
                  <span className="text-muted-foreground">{g.name}: {g.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Students by Course */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Students by Course</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={courseData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="students" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

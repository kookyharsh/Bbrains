"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin } from "lucide-react";
import { DashboardContent } from "@/components/dashboard-content"

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const schedule = [
  { day: "Monday", classes: [
    { time: "8:30 - 10:00", subject: "Advanced Math", room: "Room 201", teacher: "Dr. Smith" },
    { time: "10:30 - 12:00", subject: "Physics 101", room: "Lab 3", teacher: "Prof. Johnson" },
    { time: "14:00 - 15:30", subject: "English Literature", room: "Room 105", teacher: "Ms. Davis" },
  ]},
  { day: "Tuesday", classes: [
    { time: "9:00 - 10:30", subject: "Computer Science", room: "Lab 1", teacher: "Dr. Lee" },
    { time: "11:00 - 12:30", subject: "World History", room: "Room 302", teacher: "Prof. Brown" },
  ]},
  { day: "Wednesday", classes: [
    { time: "8:30 - 10:00", subject: "Advanced Math", room: "Room 201", teacher: "Dr. Smith" },
    { time: "10:30 - 12:00", subject: "Art & Design", room: "Studio 2", teacher: "Ms. Taylor" },
    { time: "14:00 - 15:30", subject: "Physics 101", room: "Lab 3", teacher: "Prof. Johnson" },
  ]},
  { day: "Thursday", classes: [
    { time: "9:00 - 10:30", subject: "Computer Science", room: "Lab 1", teacher: "Dr. Lee" },
    { time: "11:00 - 12:30", subject: "English Literature", room: "Room 105", teacher: "Ms. Davis" },
  ]},
  { day: "Friday", classes: [
    { time: "8:30 - 10:00", subject: "World History", room: "Room 302", teacher: "Prof. Brown" },
    { time: "10:30 - 12:00", subject: "Art & Design", room: "Studio 2", teacher: "Ms. Taylor" },
  ]},
];

const colors = ["bg-primary/10 border-primary/30", "bg-green-500/10 border-green-500/30", "bg-yellow-500/10 border-yellow-500/30", "bg-purple-500/10 border-purple-500/30", "bg-pink-500/10 border-pink-500/30"];

export default function SchedulePage() {
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });

  return (
    <DashboardContent>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Schedule</h1>
            <p className="text-muted-foreground">Your weekly class schedule</p>
          </div>
          <Badge variant="outline" className="gap-1">
            <Calendar className="w-3 h-3" /> {today}
          </Badge>
        </div>

        <div className="grid gap-4">
          {schedule.map((day, di) => (
            <Card key={day.day} className={day.day === today ? "ring-2 ring-primary/50" : ""}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  {day.day}
                  {day.day === today && <Badge className="text-xs">Today</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {day.classes.map((cls, ci) => (
                    <div key={ci} className={`flex items-center gap-4 p-3 rounded-lg border ${colors[ci % colors.length]}`}>
                      <div className="shrink-0 text-center min-w-[80px]">
                        <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {cls.time}
                        </p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm">{cls.subject}</p>
                        <p className="text-xs text-muted-foreground">{cls.teacher}</p>
                      </div>
                      <Badge variant="outline" className="shrink-0 text-xs gap-1">
                        <MapPin className="w-3 h-3" /> {cls.room}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardContent>
  );
}

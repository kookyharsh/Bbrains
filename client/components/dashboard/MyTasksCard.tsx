"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Circle, Clock, AlertCircle } from "lucide-react";

export function MyTasksCard() {
  const tasks = [
    { id: 1, title: "Complete Math Assignment", dueDate: "Today", priority: "high", completed: false },
    { id: 2, title: "Read Chapter 5", dueDate: "Tomorrow", priority: "medium", completed: false },
    { id: 3, title: "Submit Lab Report", dueDate: "In 3 days", priority: "low", completed: true },
    { id: 4, title: "Review Notes", dueDate: "In 5 days", priority: "low", completed: false },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-500";
      case "medium":
        return "text-amber-500";
      default:
        return "text-blue-500";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
          My Tasks
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-start gap-3 p-3 rounded-lg ${
                task.completed ? "bg-muted/30" : "hover:bg-muted/50"
              } cursor-pointer transition-colors`}
            >
              {task.completed ? (
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground mt-0.5" />
              )}
              <div className="flex-1 space-y-1">
                <p className={`text-sm ${task.completed ? "line-through text-muted-foreground" : "font-medium"}`}>
                  {task.title}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {task.dueDate}
                  </span>
                  <AlertCircle className={`h-3 w-3 ${getPriorityColor(task.priority)}`} />
                  <span className="capitalize">{task.priority}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}


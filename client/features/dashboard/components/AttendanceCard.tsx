"use client";

import { useEffect, useState, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, CheckCircle, Clock, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { attendanceApi, AttendanceRecord, AttendanceData } from "@/services/api/client";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

interface AttendanceCardProps {
  initialAttendance?: AttendanceData | null;
}

export const AttendanceCard = memo(function AttendanceCard({ initialAttendance }: AttendanceCardProps) {
  const [attendance, setAttendance] = useState<AttendanceData | null>(initialAttendance || null);
  const [loading, setLoading] = useState(!initialAttendance);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        const response = await attendanceApi.getAttendance();
        if (response.success && response.data) {
          // Calculate summary from records if not provided
          const records = response.data as AttendanceRecord[];
          const present = records.filter(r => r.status === 'present').length;
          const total = records.length;
          const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
          
          setAttendance({
            present,
            total,
            absent: records.filter(r => r.status === 'absent').length,
            percentage,
            records
          });
        } else {
          setError(response.message || "Failed to load attendance");
        }
      } catch (err) {
        setError("Failed to load attendance");
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [initialAttendance]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-5 w-5 text-brand-orange" />
            Attendance
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        {loading ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-16 w-16 rounded-full" />
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 p-3 text-sm text-red-500">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        ) : !attendance ? (
          <div className="p-3 text-sm text-muted-foreground">
            No attendance data
          </div>
        ) : (
          <div className="space-y-4 h-full flex flex-col">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-3xl font-bold">{attendance.percentage}%</p>
                <p className="text-xs text-muted-foreground">Overall Presence</p>
              </div>
              <div className={cn(
                  "h-16 w-16 rounded-full border-4 flex items-center justify-center",
                  attendance.percentage >= 75 ? "border-green-500 text-green-500" : "border-red-500 text-red-500"
              )}>
                <span className="text-lg font-bold">{attendance.present}/{attendance.total}</span>
              </div>
            </div>
            
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="font-medium">{attendance.present} Present</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-red-500" />
                <span className="font-medium">{attendance.absent} Absent</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
)

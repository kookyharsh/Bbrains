"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { attendanceApi, AttendanceData } from "@/lib/api-services";

export function AttendanceCard() {
  const [attendance, setAttendance] = useState<AttendanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await attendanceApi.getAttendance();
        if (response.success && response.data) {
          setAttendance(response.data);
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
  }, []);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            Attendance
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-16 w-16 rounded-full" />
            </div>
            <div className="flex gap-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
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
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-2xl font-bold">{attendance.percentage}%</p>
                <p className="text-xs text-muted-foreground">This month</p>
              </div>
              <div className="h-16 w-16 rounded-full border-4 border-green-500 flex items-center justify-center">
                <span className="text-lg font-bold">{attendance.present}/{attendance.total}</span>
              </div>
            </div>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>{attendance.present} Present</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-red-500" />
                <span>{attendance.absent} Absent</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

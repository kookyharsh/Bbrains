"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { StudentsClient } from "@/app/(dashboard)/admin/students/StudentsClient";
import { fetchStudents } from "@/app/(dashboard)/admin/students/data";
import type { ApiUser } from "@/app/(dashboard)/admin/students/_types";

export default function StudentsPage() {
  const [students, setStudents] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const data = await fetchStudents();
        if (mounted) setStudents(data);
      } catch (error) {
        console.error("Failed to fetch students:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="size-6 animate-spin text-muted-foreground/50" />
      </div>
    );
  }

  return <StudentsClient initialStudents={students} />;
}

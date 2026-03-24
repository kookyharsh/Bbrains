"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { TeachersClient } from "@/app/(dashboard)/admin/teachers/TeachersClient";
import { fetchTeachers } from "@/app/(dashboard)/admin/teachers/data";
import type { ApiUser } from "@/app/(dashboard)/admin/teachers/_types";

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const data = await fetchTeachers();
        if (mounted) setTeachers(data);
      } catch (error) {
        console.error("Failed to fetch teachers:", error);
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

  return <TeachersClient initialTeachers={teachers} />;
}

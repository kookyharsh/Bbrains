"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { OverviewClient } from "@/app/(dashboard)/admin/overview/OverviewClient";
import { fetchOverviewStats } from "@/app/(dashboard)/admin/overview/data";
import { emptyStats, type OverviewStats } from "@/app/(dashboard)/admin/overview/_types";

export default function OverviewPage() {
  const [stats, setStats] = useState<OverviewStats>(emptyStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const data = await fetchOverviewStats();
        if (mounted) setStats(data);
      } catch (error) {
        console.error("Failed to fetch overview stats:", error);
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

  return <OverviewClient stats={stats} />;
}

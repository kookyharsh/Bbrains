"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { ConfigClient } from "@/app/(dashboard)/admin/config/ConfigClient";
import { fetchConfigs } from "@/app/(dashboard)/admin/config/data";
import type { SystemConfig } from "@/services/api/client";

export default function ConfigPage() {
  const [configs, setConfigs] = useState<SystemConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const data = await fetchConfigs();
        if (mounted) setConfigs(data);
      } catch (error) {
        console.error("Failed to fetch configs:", error);
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

  return <ConfigClient initialConfigs={configs} />;
}

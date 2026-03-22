"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { AuditLogClient } from "@/app/(dashboard)/admin/audit-log/AuditLogClient";
import { fetchAuditLogs } from "@/app/(dashboard)/admin/audit-log/data";
import type { ApiAuditLog } from "@/app/(dashboard)/admin/audit-log/_types";

export default function AuditLogPage() {
  const [logs, setLogs] = useState<ApiAuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const data = await fetchAuditLogs();
        if (mounted) setLogs(data);
      } catch (error) {
        console.error("Failed to fetch audit logs:", error);
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

  return <AuditLogClient initialLogs={logs} />;
}

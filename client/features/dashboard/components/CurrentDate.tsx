"use client";

import { useEffect, useState } from "react";

export function CurrentDate() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-7 w-48 animate-pulse bg-muted rounded-lg" />;
  }

  return (
    <div className="text-xs text-muted-foreground bg-card border border-border px-3 py-1.5 rounded-lg self-start">
      {new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })}
    </div>
  );
}

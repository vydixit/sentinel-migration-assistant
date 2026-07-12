"use client";

import { useMigrationStore } from "@/lib/store";

export function TopProgressBar() {
  const progress = useMigrationStore((s) => s.overallProgress());
  return (
    <div className="sticky top-0 z-30 h-1 w-full bg-secondary">
      <div
        className="h-full bg-gradient-to-r from-primary to-[hsl(var(--success))] transition-all duration-500"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

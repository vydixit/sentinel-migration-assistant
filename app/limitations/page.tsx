"use client";

import { AlertTriangle, Ban, CircleAlert } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LIMITATIONS } from "@/lib/data/limitations";

export default function LimitationsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        icon={AlertTriangle}
        title="Known Limitations"
        description="What cannot be migrated tenant-to-tenant, why, and the recommended workaround. Plan for these before cutover."
      />

      <div className="grid gap-4">
        {LIMITATIONS.map((l) => (
          <Card key={l.title} className={l.severity === "hard" ? "border-[hsl(var(--danger))]/40" : "border-[hsl(var(--warning))]/40"}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between gap-2 text-base">
                <span className="flex items-center gap-2">
                  {l.severity === "hard" ? (
                    <Ban className="h-4 w-4 text-[hsl(var(--danger))]" />
                  ) : (
                    <CircleAlert className="h-4 w-4 text-[hsl(var(--warning))]" />
                  )}
                  {l.title}
                </span>
                <Badge variant={l.severity === "hard" ? "danger" : "warning"}>
                  {l.severity === "hard" ? "Cannot migrate" : "Partial / rebuild"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="text-muted-foreground">{l.detail}</p>
              <p><b className="text-foreground">Workaround:</b> <span className="text-muted-foreground">{l.workaround}</span></p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

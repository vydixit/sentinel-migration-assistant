"use client";

import Link from "next/link";
import { MousePointerClick, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { COMPONENTS } from "@/lib/data/components";
import { iconFor } from "@/lib/icons";
import { useMigrationStore } from "@/lib/store";

export default function ManualIndexPage() {
  const components = useMigrationStore((s) => s.components);
  const progressOf = useMigrationStore((s) => s.componentProgress);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        icon={MousePointerClick}
        title="Manual Migration"
        description='Beginner-friendly, click-by-click walkthroughs for every Sentinel component. Each step has a checkbox, required permission chip, and a Microsoft reference link.'
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {COMPONENTS.map((c) => {
          const Icon = iconFor(c.icon);
          const status = components[c.id]?.status ?? "not_started";
          const pct = progressOf(c.id);
          return (
            <Link key={c.id} href={`/manual/${c.id}`}>
              <Card className="h-full transition-colors hover:border-primary/60">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-md bg-primary/10 p-2">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{c.name}</CardTitle>
                        <Badge variant="secondary" className="mt-1">{c.category}</Badge>
                      </div>
                    </div>
                    <StatusBadge status={status} />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{c.whatIsIt}</p>
                  <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                    <span>{pct}% complete</span>
                    <span className="inline-flex items-center gap-1 text-primary">Open <ArrowRight className="h-3 w-3" /></span>
                  </div>
                  <Progress value={pct} />
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

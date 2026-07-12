"use client";

import { ClipboardCheck, AlertTriangle, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ASSESSMENT } from "@/lib/data/assessment";
import { useMigrationStore } from "@/lib/store";

export default function AssessmentPage() {
  const assessment = useMigrationStore((s) => s.assessment);
  const toggle = useMigrationStore((s) => s.toggleAssessment);

  const all = ASSESSMENT.flatMap((g) => g.items);
  const done = all.filter((i) => assessment[i.id]).length;
  const pct = Math.round((done / all.length) * 100);
  const ready = pct === 100;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        icon={ClipboardCheck}
        title="Readiness Assessment"
        description="Confirm your environment, identity posture, and governance are ready before you migrate."
      />

      <Card>
        <CardContent className="flex items-center gap-4 pt-5">
          <div className="flex-1">
            <div className="mb-1 flex justify-between text-sm">
              <span className="font-medium">Overall readiness</span>
              <span>{done}/{all.length} complete</span>
            </div>
            <Progress value={pct} />
          </div>
          <span className="text-2xl font-bold">{pct}%</span>
        </CardContent>
      </Card>

      {!ready && (
        <div className="flex items-start gap-3 rounded-lg border border-[hsl(var(--warning))]/40 bg-[hsl(var(--warning))]/5 p-4 text-sm">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[hsl(var(--warning))]" />
          Complete all items before starting the migration to avoid detection gaps and rework.
        </div>
      )}
      {ready && (
        <div className="flex items-start gap-3 rounded-lg border border-[hsl(var(--success))]/40 bg-[hsl(var(--success))]/5 p-4 text-sm">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[hsl(var(--success))]" />
          You're ready. Head to Manual or CLI migration.
        </div>
      )}

      {ASSESSMENT.map((group) => (
        <Card key={group.title}>
          <CardHeader><CardTitle className="text-base">{group.title}</CardTitle></CardHeader>
          <CardContent className="space-y-1">
            {group.items.map((item) => (
              <label key={item.id} className="flex cursor-pointer items-start gap-3 rounded-md p-2 hover:bg-accent">
                <input
                  type="checkbox"
                  checked={!!assessment[item.id]}
                  onChange={() => toggle(item.id)}
                  className="mt-1 h-4 w-4 accent-[hsl(var(--primary))]"
                />
                <span className="text-sm">
                  {item.label}
                  {item.hint && <span className="block text-xs text-muted-foreground">{item.hint}</span>}
                </span>
              </label>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

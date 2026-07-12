"use client";

import { LayoutDashboard, Download, Ban } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatusBadge, STATUS_OPTIONS } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { COMPONENTS } from "@/lib/data/components";
import { PHASES, PHASE_LABELS, ComponentStatus } from "@/lib/schema";
import { useMigrationStore } from "@/lib/store";
import { exportJson, exportExecutivePdf } from "@/lib/report/generate";

export default function TrackerPage() {
  const store = useMigrationStore();
  const overall = store.overallProgress();

  const counts = COMPONENTS.reduce(
    (acc, c) => {
      const st = store.components[c.id]?.status ?? "not_started";
      acc[st] = (acc[st] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const blockers = COMPONENTS
    .map((c) => ({ c, b: store.components[c.id]?.blocker }))
    .filter((x) => x.b && x.b.trim().length > 0);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        icon={LayoutDashboard}
        title="Migration Tracker"
        description="Live dashboard of overall progress, per-component status, phases, and blockers."
      />

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="sm:col-span-1">
          <CardContent className="flex flex-col items-center justify-center py-6">
            <div className="text-4xl font-bold text-primary">{overall}%</div>
            <div className="text-xs text-muted-foreground">Overall complete</div>
          </CardContent>
        </Card>
        <Card className="sm:col-span-3">
          <CardContent className="grid grid-cols-2 gap-3 py-6 sm:grid-cols-5">
            {STATUS_OPTIONS.map((s) => (
              <div key={s} className="text-center">
                <div className="text-2xl font-bold">{counts[s] ?? 0}</div>
                <div className="text-xs capitalize text-muted-foreground">{s.replace("_", " ")}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={() => exportJson(store)}><Download className="h-4 w-4" /> Download log (JSON)</Button>
        <Button variant="outline" onClick={() => exportExecutivePdf(store)}><Download className="h-4 w-4" /> Download log (PDF)</Button>
      </div>

      {/* Phases */}
      <Card>
        <CardHeader><CardTitle className="text-base">Phase status</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {PHASES.map((p) => (
            <div key={p} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border p-3">
              <span className="font-medium">{PHASE_LABELS[p]}</span>
              <div className="flex items-center gap-2">
                <StatusBadge status={store.phases[p].status} />
                <select
                  value={store.phases[p].status}
                  onChange={(e) => store.setPhaseStatus(p, e.target.value as ComponentStatus)}
                  className="rounded-md border border-input bg-background px-2 py-1 text-xs"
                >
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                </select>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Blockers */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Ban className="h-4 w-4 text-[hsl(var(--danger))]" /> Blockers</CardTitle></CardHeader>
        <CardContent>
          {blockers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No blockers recorded.</p>
          ) : (
            <ul className="space-y-2">
              {blockers.map(({ c, b }) => (
                <li key={c.id} className="rounded-md border border-[hsl(var(--danger))]/30 bg-[hsl(var(--danger))]/5 p-3 text-sm">
                  <b>{c.name}:</b> {b}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Per-component */}
      <Card>
        <CardHeader><CardTitle className="text-base">Per-component status</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {COMPONENTS.map((c) => {
            const pct = store.componentProgress(c.id);
            const st = store.components[c.id]?.status ?? "not_started";
            return (
              <div key={c.id} className="flex items-center gap-4 rounded-md border border-border p-3">
                <div className="w-48 shrink-0 font-medium">{c.name}</div>
                <div className="flex-1"><Progress value={pct} /></div>
                <div className="w-10 text-right text-xs text-muted-foreground">{pct}%</div>
                <StatusBadge status={st} />
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Info, Target, KeyRound, Download, Upload, CheckCircle2,
  RotateCcw, BookOpen, AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StepItem } from "@/components/step-item";
import { ZeroTrustPanel } from "@/components/zero-trust-panel";
import { StatusBadge, STATUS_OPTIONS } from "@/components/status-badge";
import { PermissionChip, RefLink } from "@/components/chips";
import { Badge } from "@/components/ui/badge";
import { getComponent, Step } from "@/lib/data/components";
import { iconFor } from "@/lib/icons";
import { useMigrationStore } from "@/lib/store";
import { ComponentStatus } from "@/lib/schema";

export default function ComponentDetailPage() {
  const params = useParams();
  const id = String(params.component);
  const comp = getComponent(id);

  const state = useMigrationStore((s) => s.components[id]);
  const toggleStep = useMigrationStore((s) => s.toggleStep);
  const setStatus = useMigrationStore((s) => s.setComponentStatus);
  const setBlocker = useMigrationStore((s) => s.setBlocker);
  const pct = useMigrationStore((s) => s.componentProgress(id));

  if (!comp) return notFound();
  const Icon = iconFor(comp.icon);
  const isDone = (stepId: string) => !!state?.steps[stepId]?.done;

  let counter = 0;
  const renderSteps = (steps: Step[]) =>
    steps.map((step) => {
      counter += 1;
      return (
        <StepItem
          key={step.id}
          step={step}
          index={counter}
          done={isDone(step.id)}
          onToggle={() => toggleStep(id, step.id)}
        />
      );
    });

  return (
    <div className="mx-auto max-w-6xl">
      <Link href="/manual" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to components
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main */}
        <div className="space-y-6">
          {/* Header */}
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="rounded-md bg-primary/10 p-2.5"><Icon className="h-6 w-6 text-primary" /></div>
                <div>
                  <h1 className="text-xl font-bold">{comp.name}</h1>
                  <Badge variant="secondary" className="mt-1">{comp.category}</Badge>
                </div>
              </div>
              <StatusBadge status={state?.status ?? "not_started"} />
            </div>
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                <span>Progress</span><span>{pct}%</span>
              </div>
              <Progress value={pct} />
            </div>
            {/* status control */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">Set status:</span>
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(id, s as ComponentStatus)}
                  className="rounded-full border border-border px-2.5 py-0.5 text-xs hover:bg-accent"
                >
                  {s.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          {/* What / Why */}
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoCard icon={Info} title="What is it">{comp.whatIsIt}</InfoCard>
            <InfoCard icon={Target} title="Why migrate it">{comp.whyMigrate}</InfoCard>
          </div>

          {/* Permissions */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><KeyRound className="h-4 w-4" /> Permissions required</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {comp.permissions.map((p) => <PermissionChip key={p} role={p} />)}
            </CardContent>
          </Card>

          {comp.cliReconfig && (
            <div className="flex items-start gap-3 rounded-lg border border-[hsl(var(--warning))]/40 bg-[hsl(var(--warning))]/5 p-4 text-sm">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[hsl(var(--warning))]" />
              <div><b>Reconfiguration required: </b>{comp.cliReconfig}</div>
            </div>
          )}

          {/* Export steps */}
          <StepSection icon={Download} title="Export Steps (from Tenant B — Source)">{renderSteps(comp.exportSteps)}</StepSection>
          {/* Import steps */}
          <StepSection icon={Upload} title="Import Steps (into Tenant A — Destination)">{renderSteps(comp.importSteps)}</StepSection>
          {/* Validation */}
          <StepSection icon={CheckCircle2} title="Validation Steps">{renderSteps(comp.validationSteps)}</StepSection>

          {/* Rollback */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><RotateCcw className="h-4 w-4" /> Rollback Guidance</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">{comp.rollback}</CardContent>
          </Card>

          {/* References */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><BookOpen className="h-4 w-4" /> Microsoft Reference Links</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-2">
              {comp.references.map((r) => <RefLink key={r.url} label={r.label} url={r.url} />)}
            </CardContent>
          </Card>

          {/* Blocker */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Blocker notes (optional)</CardTitle></CardHeader>
            <CardContent>
              <textarea
                value={state?.blocker ?? ""}
                onChange={(e) => setBlocker(id, e.target.value)}
                placeholder="Document any blocker for this component (do NOT paste secrets or tenant IDs)"
                className="min-h-20 w-full rounded-md border border-input bg-background p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </CardContent>
          </Card>
        </div>

        {/* Zero Trust rail */}
        <ZeroTrustPanel checks={comp.zeroTrust} />
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><Icon className="h-4 w-4 text-primary" /> {title}</CardTitle></CardHeader>
      <CardContent className="text-sm text-muted-foreground">{children}</CardContent>
    </Card>
  );
}

function StepSection({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><Icon className="h-4 w-4 text-primary" /> {title}</CardTitle></CardHeader>
      <CardContent className="space-y-2">{children}</CardContent>
    </Card>
  );
}

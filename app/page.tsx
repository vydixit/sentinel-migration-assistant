"use client";

import Link from "next/link";
import {
  Shield, Users, CheckCircle2, XCircle, ArrowRight, ListChecks, Terminal,
  ClipboardCheck, ShieldCheck, Rocket,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mermaid } from "@/components/mermaid";
import { PREREQUISITES } from "@/lib/data/assessment";
import { PHASE_LABELS, PHASES } from "@/lib/schema";
import { useMigrationStore } from "@/lib/store";

const CAN_MIGRATE = [
  "Analytics Rules (Scheduled / NRT / Fusion / ML)",
  "Automation Rules",
  "Playbooks (Logic Apps)",
  "Workbooks",
  "Watchlists",
  "Hunting Queries",
  "Data Connectors (reconfigured)",
  "UEBA (re-enabled)",
  "Content Hub Solutions",
  "Incident Settings",
  "Custom KQL Functions / Parsers",
];

const CANNOT_MIGRATE = [
  "Historical logs / raw data",
  "Incident history & investigations",
  "Connector authentication tokens",
  "Managed identities",
  "Workspace GUIDs / resource IDs",
  "UEBA baseline learning",
];

const ARCH = `flowchart LR
  subgraph B["Tenant B — Source"]
    S1[Sentinel Workspace]
  end
  S1 --> E[Export<br/>ARM / JSON / CSV]
  E --> P[Package<br/>sentinel-migration/]
  P --> I[Import<br/>ARM / Bicep / Portal]
  subgraph A["Tenant A — Destination"]
    S2[Sentinel Workspace]
  end
  I --> S2`;

export default function ReadmePage() {
  const prereqs = useMigrationStore((s) => s.prerequisites);
  const toggle = useMigrationStore((s) => s.togglePrerequisite);
  const done = PREREQUISITES.filter((p) => prereqs[p.id]).length;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Hero */}
      <div className="rounded-xl border border-border bg-gradient-to-br from-primary/10 to-transparent p-8">
        <div className="mb-3 flex items-center gap-3">
          <Shield className="h-9 w-9 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Sentinel Migration Assistant</h1>
        </div>
        <p className="max-w-3xl text-muted-foreground">
          A guided, production-grade assistant for migrating Microsoft Sentinel from{" "}
          <b className="text-foreground">Tenant B (Source)</b> to{" "}
          <b className="text-foreground">Tenant A (Destination)</b>. Choose a manual guided
          walkthrough or a CLI-driven semi-automated migration — with Zero Trust principles
          enforced at every step and Microsoft references linked throughout.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/manual">
            <Button className="bg-primary"><MousePointer /> Start Manual Migration <ArrowRight className="h-4 w-4" /></Button>
          </Link>
          <Link href="/cli">
            <Button variant="success"><Terminal className="h-4 w-4" /> Start CLI Migration <ArrowRight className="h-4 w-4" /></Button>
          </Link>
          <Link href="/assessment">
            <Button variant="warning"><ClipboardCheck className="h-4 w-4" /> Run Readiness Assessment <ArrowRight className="h-4 w-4" /></Button>
          </Link>
        </div>
      </div>

      {/* Zero Trust banner */}
      <div className="flex items-start gap-3 rounded-lg border border-[hsl(var(--warning))]/40 bg-[hsl(var(--warning))]/5 p-4">
        <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-[hsl(var(--warning))]" />
        <div>
          <div className="font-semibold">Zero Trust commitment</div>
          <p className="text-sm text-muted-foreground">
            Every step enforces MFA, PIM just-in-time elevation, least-privilege roles, compliant
            devices, network restrictions, and full audit logging. Global Administrator is never
            required — or allowed — for this migration. This tool stores no tenant IDs, tokens, or secrets.
          </p>
        </div>
      </div>

      {/* Who is it for */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> Who is this for?</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2 text-sm">
          {["SOC Leads", "Cloud Solution Architects (CSA/CE)", "MSSPs", "Security Administrators", "Incident Response Teams"].map((r) => (
            <span key={r} className="rounded-full border border-border bg-secondary px-3 py-1">{r}</span>
          ))}
        </CardContent>
      </Card>

      {/* Can / Cannot */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[hsl(var(--success))]">
              <CheckCircle2 className="h-5 w-5" /> What it can migrate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {CAN_MIGRATE.map((c) => (
                <li key={c} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--success))]" />{c}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[hsl(var(--danger))]">
              <XCircle className="h-5 w-5" /> What it cannot migrate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {CANNOT_MIGRATE.map((c) => (
                <li key={c} className="flex gap-2"><XCircle className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--danger))]" />{c}</li>
              ))}
            </ul>
            <Link href="/limitations" className="mt-3 inline-flex items-center gap-1 text-xs text-primary hover:underline">
              See full known-limitations page <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Architecture */}
      <Card>
        <CardHeader><CardTitle>High-level architecture</CardTitle></CardHeader>
        <CardContent><Mermaid chart={ARCH} /></CardContent>
      </Card>

      {/* Phases */}
      <Card>
        <CardHeader><CardTitle>Migration phases</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2">
            {PHASES.map((p, i) => (
              <div key={p} className="flex items-center gap-2">
                <span className="rounded-md border border-border bg-secondary px-3 py-1.5 text-sm font-medium">
                  {i + 1}. {PHASE_LABELS[p]}
                </span>
                {i < PHASES.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Prerequisites */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2"><ListChecks className="h-5 w-5 text-primary" /> Prerequisites checklist</span>
            <span className="text-sm font-normal text-muted-foreground">{done}/{PREREQUISITES.length} ready</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {PREREQUISITES.map((p) => (
              <li key={p.id}>
                <label className="flex cursor-pointer items-start gap-3 rounded-md p-2 hover:bg-accent">
                  <input
                    type="checkbox"
                    checked={!!prereqs[p.id]}
                    onChange={() => toggle(p.id)}
                    className="mt-1 h-4 w-4 accent-[hsl(var(--primary))]"
                  />
                  <span className="text-sm">
                    {p.label}
                    {p.hint && <span className="block text-xs text-muted-foreground">{p.hint}</span>}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Choose CTA */}
      <div className="flex items-center justify-between rounded-lg border border-border bg-card p-5">
        <div className="flex items-center gap-3">
          <Rocket className="h-6 w-6 text-primary" />
          <div>
            <div className="font-semibold">Ready to begin?</div>
            <div className="text-sm text-muted-foreground">Choose how you want to migrate.</div>
          </div>
        </div>
        <Link href="/choose"><Button>Choose migration method <ArrowRight className="h-4 w-4" /></Button></Link>
      </div>
    </div>
  );
}

function MousePointer() {
  return <ListChecks className="h-4 w-4" />;
}

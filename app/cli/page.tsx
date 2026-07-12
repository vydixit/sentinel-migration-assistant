"use client";

import { useState } from "react";
import { Terminal, Download, CheckCircle2, XCircle, KeyRound, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/tabs";
import { CommandBlock } from "@/components/command-block";
import { RefLink } from "@/components/chips";
import { CLI_STEPS, CliTrack } from "@/lib/data/cli";
import { downloadScriptBundle } from "@/lib/bundle";

const TRACKS: { id: CliTrack; label: string }[] = [
  { id: "azcli", label: "Azure CLI" },
  { id: "powershell", label: "PowerShell (Az.SecurityInsights)" },
  { id: "rest", label: "REST API" },
];

const LANG: Record<CliTrack, string> = { azcli: "bash", powershell: "powershell", rest: "http" };

export default function CliPage() {
  const [track, setTrack] = useState<CliTrack>("azcli");

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        icon={Terminal}
        title="CLI-Based Migration"
        description="Semi-automated, repeatable migration using dual-tenant login. Every command shows expected output, common errors, required RBAC, and a Zero Trust note."
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs tabs={TRACKS} active={track} onChange={(t) => setTrack(t as CliTrack)} />
        <Button variant="success" onClick={() => downloadScriptBundle()}>
          <Download className="h-4 w-4" /> Download script bundle (.zip)
        </Button>
      </div>

      <div className="flex items-start gap-3 rounded-lg border border-[hsl(var(--warning))]/40 bg-[hsl(var(--warning))]/5 p-4 text-sm">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[hsl(var(--warning))]" />
        All examples use placeholders (&lt;TenantB-ID&gt;, &lt;Workspace-A&gt;). Never paste real tenant
        IDs or secrets. Use PIM-elevated, MFA'd accounts — never Global Administrator.
      </div>

      {CLI_STEPS.map((step) => (
        <Card key={step.id}>
          <CardHeader>
            <CardTitle className="text-base">{step.title}</CardTitle>
            {step.intro && <p className="text-sm text-muted-foreground">{step.intro}</p>}
          </CardHeader>
          <CardContent className="space-y-4">
            <CommandBlock code={step.code[track]} language={LANG[track]} />

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-md border border-[hsl(var(--success))]/30 bg-[hsl(var(--success))]/5 p-3 text-sm">
                <div className="mb-1 flex items-center gap-1.5 font-medium text-[hsl(var(--success))]">
                  <CheckCircle2 className="h-4 w-4" /> Expected output
                </div>
                <p className="text-muted-foreground">{step.expected}</p>
              </div>
              <div className="rounded-md border border-[hsl(var(--danger))]/30 bg-[hsl(var(--danger))]/5 p-3 text-sm">
                <div className="mb-1 flex items-center gap-1.5 font-medium text-[hsl(var(--danger))]">
                  <XCircle className="h-4 w-4" /> Common errors &amp; fixes
                </div>
                <ul className="space-y-1 text-muted-foreground">
                  {step.errors.map((e) => (
                    <li key={e.error}><b className="text-foreground">{e.error}:</b> {e.fix}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 border-t border-border pt-3 text-sm">
              <span className="inline-flex items-center gap-1.5"><KeyRound className="h-4 w-4 text-primary" /><b>RBAC:</b> {step.rbac}</span>
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-[hsl(var(--warning))]" /><b>Zero Trust:</b> {step.zeroTrust}</span>
              <RefLink label={step.ref.label} url={step.ref.url} />
            </div>
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader><CardTitle className="text-base">What's in the script bundle?</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <ul className="list-inside list-disc space-y-1">
            <li><code>01-export-source.ps1</code> — export from Tenant B</li>
            <li><code>02-validate.ps1</code> — compare Source vs Destination parity</li>
            <li><code>03-import-destination.ps1</code> — deploy to Tenant A via Bicep</li>
            <li><code>parameters.sample.json</code> — placeholder parameters (no secrets)</li>
            <li><code>bicep/analytics-rule.bicep</code> — parameterized rule template</li>
            <li><code>README.md</code> — usage + Zero Trust guidance</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

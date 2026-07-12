"use client";

import { FileDown, FileText, Shield, Braces, Code2, Building2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMigrationStore } from "@/lib/store";
import {
  exportExecutivePdf, exportTechnicalDoc, exportSecurityPdf, exportJson, exportAllHtml,
} from "@/lib/report/generate";

export default function ReportPage() {
  const store = useMigrationStore();

  const reports = [
    {
      icon: Building2,
      title: "Executive Summary (PDF)",
      audience: "For leadership",
      desc: "One-page status, component completion, and key risks.",
      action: () => exportExecutivePdf(store),
    },
    {
      icon: FileText,
      title: "Technical Migration Plan (DOCX/PDF)",
      audience: "For engineers",
      desc: "Full component detail, phase and component status, rollback guidance. Opens in Word or a browser.",
      action: () => exportTechnicalDoc(store),
    },
    {
      icon: Shield,
      title: "Security & Zero Trust Report (PDF)",
      audience: "For CISO / audit",
      desc: "Zero Trust controls applied and data-handling limitations. GUIDs redacted.",
      action: () => exportSecurityPdf(store),
    },
    {
      icon: Braces,
      title: "Migration Log (JSON)",
      audience: "Machine-readable",
      desc: "Complete migration state conforming to the SMA JSON schema.",
      action: () => exportJson(store),
    },
    {
      icon: Code2,
      title: "Snapshot (HTML)",
      audience: "Shareable",
      desc: "Self-contained HTML snapshot of current progress.",
      action: () => exportAllHtml(store),
    },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        icon={FileDown}
        title="Export Report"
        description="Generate leadership, engineering, and audit reports. No tenant IDs or secrets are stored — reports use labels and redact GUIDs."
      />

      <Card>
        <CardHeader><CardTitle className="text-base">Migration labels</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Source label (no tenant ID)</label>
            <Input
              value={store.tenants.sourceLabel}
              onChange={(e) => store.setTenantLabel("sourceLabel", e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Destination label (no tenant ID)</label>
            <Input
              value={store.tenants.destinationLabel}
              onChange={(e) => store.setTenantLabel("destinationLabel", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {reports.map((r) => {
          const Icon = r.icon;
          return (
            <Card key={r.title}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon className="h-5 w-5 text-primary" /> {r.title}
                </CardTitle>
                <p className="text-xs text-muted-foreground">{r.audience}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{r.desc}</p>
                <Button onClick={r.action} className="w-full">
                  <FileDown className="h-4 w-4" /> Generate &amp; download
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

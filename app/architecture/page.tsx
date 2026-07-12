"use client";

import { Building2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mermaid } from "@/components/mermaid";

const DIAGRAMS: { title: string; description: string; chart: string }[] = [
  {
    title: "Single-tenant → Single-tenant",
    description: "The baseline: export content from one Source workspace and import into one Destination workspace.",
    chart: `flowchart LR
  subgraph B[Tenant B]
    WB[Sentinel WS B]
  end
  WB -->|Export ARM/JSON| PKG[Migration Package]
  PKG -->|Import Bicep/ARM| WA[Sentinel WS A]
  subgraph A[Tenant A]
    WA
  end`,
  },
  {
    title: "Multi-workspace consolidation (SOC merger)",
    description: "Merge several Source workspaces into one consolidated Destination workspace after an acquisition.",
    chart: `flowchart LR
  W1[WS B-1] --> M[Consolidation<br/>Package]
  W2[WS B-2] --> M
  W3[WS B-3] --> M
  M --> WA[Consolidated Sentinel WS A]
  note[Deduplicate rules &<br/>reconcile watchlists] -.-> M`,
  },
  {
    title: "MSSP model via Azure Lighthouse",
    description: "An MSSP manages the customer's Destination tenant at scale using delegated, least-privilege Lighthouse roles.",
    chart: `flowchart LR
  subgraph Cust[Customer Tenant A]
    WA[Sentinel WS A]
  end
  subgraph MSSP[MSSP Tenant]
    OPS[SOC Analysts]
  end
  OPS -->|Azure Lighthouse<br/>delegated RBAC| WA
  PIM[PIM for Lighthouse] -.-> OPS`,
  },
  {
    title: "Hybrid partial migration",
    description: "Bulk content via CLI/Bicep; connectors and playbooks reconfigured manually because auth is tenant-bound.",
    chart: `flowchart TB
  subgraph CLI[CLI / Bicep track]
    R[Analytics Rules]
    F[Functions/Parsers]
    WL[Watchlists]
  end
  subgraph MAN[Manual track]
    DC[Data Connectors]
    PB[Playbooks]
  end
  CLI --> DST[Destination WS A]
  MAN --> DST`,
  },
  {
    title: "Data connector re-onboarding flow",
    description: "Connectors are never copied — they are freshly onboarded and forwarders repointed to the new workspace.",
    chart: `flowchart LR
  SRC[Source systems<br/>Entra/Defender/CEF] --> NEWAPP[New app registration<br/>/ managed identity in A]
  NEWAPP --> DCR[New Data Collection Rule]
  DCR --> WA[Sentinel WS A]
  OLD[Old Source connectors] -. keep running until cutover .-> WA`,
  },
];

export default function ArchitecturePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        icon={Building2}
        title="Reference Architecture"
        description="Common tenant-to-tenant migration topologies. Pick the pattern that matches your scenario."
      />
      {DIAGRAMS.map((d) => (
        <Card key={d.title}>
          <CardHeader>
            <CardTitle className="text-base">{d.title}</CardTitle>
            <p className="text-sm text-muted-foreground">{d.description}</p>
          </CardHeader>
          <CardContent><Mermaid chart={d.chart} /></CardContent>
        </Card>
      ))}
    </div>
  );
}

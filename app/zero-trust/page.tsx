"use client";

import { ShieldCheck, XCircle, CheckCircle2, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefLink } from "@/components/chips";

const CHECKS = [
  {
    id: "mfa",
    label: "MFA enforced for all migration admins",
    detail: "Every account used to export or import must satisfy multi-factor authentication via Conditional Access.",
    ref: { label: "Require MFA for admins", url: "https://learn.microsoft.com/entra/identity/conditional-access/howto-conditional-access-policy-admin-mfa" },
  },
  {
    id: "pim",
    label: "PIM used — no permanent privileged roles",
    detail: "Sentinel Reader/Contributor should be eligible and activated just-in-time, then expire automatically.",
    ref: { label: "Configure PIM", url: "https://learn.microsoft.com/entra/id-governance/privileged-identity-management/pim-configure" },
  },
  {
    id: "ca",
    label: "Conditional Access baseline in place",
    detail: "Require compliant/hybrid-joined device and trusted named location (admin workstation IP) for privileged access.",
    ref: { label: "Conditional Access", url: "https://learn.microsoft.com/entra/identity/conditional-access/overview" },
  },
  {
    id: "leastpriv",
    label: "Least-privilege role selected per task",
    detail: "Use the RBAC matrix — Reader to export, Contributor to import, connector-specific roles for ingestion.",
    ref: { label: "Sentinel roles", url: "https://learn.microsoft.com/azure/sentinel/roles" },
  },
  {
    id: "audit",
    label: "Audit & diagnostic logging enabled",
    detail: "Azure Activity logs + Sentinel diagnostic settings capture every export/import action in both tenants.",
    ref: { label: "Diagnostic settings", url: "https://learn.microsoft.com/azure/azure-monitor/essentials/diagnostic-settings" },
  },
  {
    id: "identity",
    label: "Playbooks use managed identity, not secrets",
    detail: "Automated response runs under a user-assigned managed identity with least-privilege role assignments.",
    ref: { label: "Authenticate playbooks", url: "https://learn.microsoft.com/azure/sentinel/authenticate-playbooks-to-sentinel" },
  },
];

export default function ZeroTrustPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        icon={ShieldCheck}
        title="Zero Trust Validation"
        description="Verify migration identity and access posture against Zero Trust principles before and during the migration."
      />

      {/* Never-allowed banner */}
      <div className="flex items-start gap-3 rounded-lg border border-[hsl(var(--danger))]/40 bg-[hsl(var(--danger))]/5 p-4">
        <XCircle className="mt-0.5 h-6 w-6 shrink-0 text-[hsl(var(--danger))]" />
        <div>
          <div className="font-semibold text-[hsl(var(--danger))]">Global Administrator is never allowed</div>
          <p className="text-sm text-muted-foreground">
            Sentinel migration never requires Global Admin. Using it violates least privilege and
            expands blast radius. Use scoped Sentinel roles activated via PIM instead.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {CHECKS.map((c) => (
          <Card key={c.id}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <CheckCircle2 className="h-4 w-4 text-[hsl(var(--success))]" /> {c.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{c.detail}</p>
              <RefLink label={c.ref.label} url={c.ref.url} />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-4 w-4 text-[hsl(var(--warning))]" /> Recommended least-privilege roles
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <ul className="list-inside list-disc space-y-1">
            <li>Export content → <b className="text-foreground">Microsoft Sentinel Reader</b></li>
            <li>Import / create content → <b className="text-foreground">Microsoft Sentinel Contributor</b></li>
            <li>Deploy playbooks → <b className="text-foreground">Logic App Contributor + Playbook Operator</b></li>
            <li>Configure connectors → <b className="text-foreground">connector-specific role</b> (avoid Global Admin)</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import Link from "next/link";
import { MousePointerClick, Terminal, Layers, ArrowRight, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { useMigrationStore } from "@/lib/store";

const CARDS = [
  {
    id: "manual" as const,
    icon: MousePointerClick,
    title: "Manual Migration",
    best: "First-time migrators, audit-heavy environments",
    points: [
      'Step-by-step: "Go here → Login here → Click this button"',
      "Exact portal paths and menu names",
      "Checkboxes to track every step",
    ],
    href: "/manual",
    variant: "primary",
  },
  {
    id: "cli" as const,
    icon: Terminal,
    title: "CLI-Based Migration",
    best: "Experienced admins, repeatable migrations",
    points: [
      "Azure CLI / PowerShell / REST API / Bicep",
      "Dual-tenant login (export B → import A)",
      "Commands + expected output + error handling",
    ],
    href: "/cli",
    variant: "success",
  },
  {
    id: "hybrid" as const,
    icon: Layers,
    title: "Hybrid (Manual + CLI)",
    best: "Recommended for real customers",
    points: [
      "Mix approaches by component type",
      "CLI for bulk rules, manual for connectors",
      "Best balance of speed and control",
    ],
    href: "/manual",
    variant: "warning",
  },
];

export default function ChoosePage() {
  const mode = useMigrationStore((s) => s.mode);
  const setMode = useMigrationStore((s) => s.setMode);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="How do you want to migrate?"
        description="Pick the approach that fits your team. You can switch anytime — your progress is saved."
      />
      <div className="grid gap-5 md:grid-cols-3">
        {CARDS.map((c) => {
          const Icon = c.icon;
          const selected = mode === c.id;
          return (
            <Card
              key={c.id}
              className={selected ? "border-primary ring-2 ring-primary/40" : "hover:border-primary/50"}
            >
              <CardHeader>
                <Icon className="h-8 w-8 text-primary" />
                <CardTitle className="mt-2">{c.title}</CardTitle>
                <p className="text-xs text-muted-foreground">Best for: {c.best}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  {c.points.map((p) => (
                    <li key={p} className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--success))]" />
                      {p}
                    </li>
                  ))}
                </ul>
                <Link
                  href={c.href}
                  onClick={() => setMode(c.id)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
                >
                  {selected ? "Continue" : "Select"} <ArrowRight className="h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

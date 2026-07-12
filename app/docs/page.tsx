"use client";

import { useMemo, useState } from "react";
import { BookOpen, ExternalLink, Search } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Input } from "@/components/ui/input";
import { DOC_LINKS } from "@/lib/data/docs";

export default function DocsPage() {
  const [q, setQ] = useState("");

  const grouped = useMemo(() => {
    const s = q.toLowerCase();
    const filtered = DOC_LINKS.filter(
      (d) => s === "" || d.label.toLowerCase().includes(s) || d.category.toLowerCase().includes(s)
    );
    const map: Record<string, typeof DOC_LINKS> = {};
    filtered.forEach((d) => {
      (map[d.category] ??= []).push(d);
    });
    return map;
  }, [q]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        icon={BookOpen}
        title="Microsoft Documentation Hub"
        description="Every Microsoft Learn reference used across this tool, grouped and searchable."
      />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search documentation..." className="pl-9" />
      </div>

      {Object.keys(grouped).length === 0 && (
        <p className="text-sm text-muted-foreground">No documentation matches your search.</p>
      )}

      <div className="space-y-6">
        {Object.entries(grouped).map(([category, links]) => (
          <div key={category}>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">{category}</h2>
            <ul className="divide-y divide-border rounded-lg border border-border">
              {links.map((l) => (
                <li key={l.url}>
                  <a
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-2 p-3 text-sm hover:bg-accent"
                  >
                    {l.label}
                    <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

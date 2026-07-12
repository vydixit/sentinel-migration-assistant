"use client";

import { useMemo, useState } from "react";
import { KeyRound, ExternalLink, Search } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Input } from "@/components/ui/input";
import { RBAC_MATRIX } from "@/lib/data/rbac";

export default function RbacPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(RBAC_MATRIX.map((r) => r.category)))],
    []
  );

  const rows = useMemo(() => {
    const s = q.toLowerCase();
    return RBAC_MATRIX.filter(
      (r) =>
        (cat === "All" || r.category === cat) &&
        (s === "" ||
          r.activity.toLowerCase().includes(s) ||
          r.role.toLowerCase().includes(s) ||
          r.zeroTrust.toLowerCase().includes(s))
    );
  }, [q, cat]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        icon={KeyRound}
        title="Permissions & RBAC Matrix"
        description="Minimum least-privilege role for every migration activity, with scope, Zero Trust guidance, and Microsoft reference."
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-56">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search activity, role, or Zero Trust note..."
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`rounded-full border px-3 py-1 text-xs ${
                cat === c ? "border-primary bg-primary/15 text-primary" : "border-border hover:bg-accent"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-left">
            <tr>
              <th className="p-3 font-semibold">Activity</th>
              <th className="p-3 font-semibold">Minimum Role</th>
              <th className="p-3 font-semibold">Scope</th>
              <th className="p-3 font-semibold">Zero Trust Note</th>
              <th className="p-3 font-semibold">Ref</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-border hover:bg-accent/50">
                <td className="p-3 font-medium">{r.activity}</td>
                <td className="p-3">{r.role}</td>
                <td className="p-3 text-muted-foreground">{r.scope}</td>
                <td className="p-3 text-muted-foreground">{r.zeroTrust}</td>
                <td className="p-3">
                  <a href={r.ref} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No activities match your filter.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

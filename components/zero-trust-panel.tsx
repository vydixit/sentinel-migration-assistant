import { ShieldCheck, UserCheck, KeyRound, Clock, Laptop, Globe, ScrollText } from "lucide-react";
import { ZeroTrustCheck } from "@/lib/data/components";

const ICONS = [UserCheck, KeyRound, Clock, Laptop, Globe, ScrollText];

export function ZeroTrustPanel({
  checks,
  sticky = true,
}: {
  checks: ZeroTrustCheck[];
  sticky?: boolean;
}) {
  return (
    <div className={sticky ? "lg:sticky lg:top-4" : ""}>
      <div className="rounded-lg border border-[hsl(var(--warning))]/40 bg-[hsl(var(--warning))]/5 p-4">
        <div className="mb-3 flex items-center gap-2 font-semibold">
          <ShieldCheck className="h-5 w-5 text-[hsl(var(--warning))]" />
          Zero Trust for this step
        </div>
        <ul className="space-y-3">
          {checks.map((c, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <li key={c.label} className="flex gap-2.5 text-sm">
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--warning))]" />
                <div>
                  <div className="font-medium">{c.label}</div>
                  <div className="text-xs text-muted-foreground">{c.detail}</div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

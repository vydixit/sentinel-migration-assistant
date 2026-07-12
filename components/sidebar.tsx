"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Home, ClipboardCheck, MousePointerClick, Terminal, KeyRound, ShieldCheck,
  LayoutDashboard, Building2, BookOpen, AlertTriangle, FileDown, ChevronLeft,
  ChevronRight, Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMigrationStore } from "@/lib/store";
import { Progress } from "./ui/progress";

const NAV = [
  { href: "/", label: "Home / README", icon: Home },
  { href: "/assessment", label: "Readiness Assessment", icon: ClipboardCheck },
  { href: "/manual", label: "Manual Migration", icon: MousePointerClick },
  { href: "/cli", label: "CLI Migration", icon: Terminal },
  { href: "/rbac", label: "Permissions & RBAC", icon: KeyRound },
  { href: "/zero-trust", label: "Zero Trust Validation", icon: ShieldCheck },
  { href: "/tracker", label: "Migration Tracker", icon: LayoutDashboard },
  { href: "/architecture", label: "Reference Architecture", icon: Building2 },
  { href: "/docs", label: "Microsoft Documentation", icon: BookOpen },
  { href: "/limitations", label: "Known Limitations", icon: AlertTriangle },
  { href: "/report", label: "Export Report", icon: FileDown },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const progress = useMigrationStore((s) => s.overallProgress());

  return (
    <aside
      className={cn(
        "sticky top-0 flex h-screen flex-col border-r border-border bg-card transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center gap-2 border-b border-border px-4 py-4">
        <Shield className="h-6 w-6 shrink-0 text-primary" />
        {!collapsed && (
          <div className="leading-tight">
            <div className="text-sm font-bold">Sentinel</div>
            <div className="text-xs text-muted-foreground">Migration Assistant</div>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-2">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-primary/15 font-medium text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        {!collapsed && (
          <div className="mb-2">
            <div className="mb-1 flex justify-between text-xs text-muted-foreground">
              <span>Overall migration</span>
              <span className="font-semibold text-foreground">{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="flex w-full items-center justify-center gap-2 rounded-md py-2 text-xs text-muted-foreground hover:bg-accent"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : (<><ChevronLeft className="h-4 w-4" /> Collapse</>)}
        </button>
      </div>
    </aside>
  );
}

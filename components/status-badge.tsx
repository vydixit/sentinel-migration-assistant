import { Badge } from "./ui/badge";
import { ComponentStatus } from "@/lib/schema";
import { CheckCircle2, Circle, CircleDashed, Ban, SkipForward } from "lucide-react";

const MAP: Record<ComponentStatus, { label: string; variant: any; icon: any }> = {
  not_started: { label: "Not Started", variant: "secondary", icon: Circle },
  in_progress: { label: "In Progress", variant: "default", icon: CircleDashed },
  blocked: { label: "Blocked", variant: "danger", icon: Ban },
  completed: { label: "Completed", variant: "success", icon: CheckCircle2 },
  skipped: { label: "Skipped", variant: "warning", icon: SkipForward },
};

export function StatusBadge({ status }: { status: ComponentStatus }) {
  const s = MAP[status];
  const Icon = s.icon;
  return (
    <Badge variant={s.variant}>
      <Icon className="h-3 w-3" />
      {s.label}
    </Badge>
  );
}

export const STATUS_OPTIONS: ComponentStatus[] = [
  "not_started",
  "in_progress",
  "blocked",
  "completed",
  "skipped",
];

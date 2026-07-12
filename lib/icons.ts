import {
  ShieldAlert, Workflow, PlayCircle, ListChecks, LayoutDashboard, Search,
  PlugZap, UserSearch, Package, Settings2, FunctionSquare, Circle,
} from "lucide-react";

const MAP: Record<string, any> = {
  ShieldAlert, Workflow, PlayCircle, ListChecks, LayoutDashboard, Search,
  PlugZap, UserSearch, Package, Settings2, FunctionSquare,
};

export function iconFor(name: string) {
  return MAP[name] ?? Circle;
}

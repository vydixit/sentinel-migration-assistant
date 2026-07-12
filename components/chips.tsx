import { ExternalLink, ShieldHalf } from "lucide-react";
import { Badge } from "./ui/badge";

export function PermissionChip({ role }: { role: string }) {
  return (
    <Badge variant="default" className="whitespace-nowrap">
      <ShieldHalf className="h-3 w-3" />
      {role}
    </Badge>
  );
}

export function RefLink({ label, url }: { label: string; url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
    >
      <ExternalLink className="h-3 w-3" />
      {label}
    </a>
  );
}

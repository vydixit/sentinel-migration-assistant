export interface CheckItem {
  id: string;
  label: string;
  hint?: string;
}

export interface CheckGroup {
  title: string;
  items: CheckItem[];
}

// Readiness Assessment groups
export const ASSESSMENT: CheckGroup[] = [
  {
    title: "Identity & Access",
    items: [
      { id: "a-mfa", label: "MFA is enforced for all admin accounts used in the migration" },
      { id: "a-pim", label: "PIM is configured for eligible (not permanent) privileged roles" },
      { id: "a-noga", label: "Migration will NOT use a Global Administrator account", hint: "Global Admin is never required for Sentinel migration" },
      { id: "a-ca", label: "Conditional Access baseline (compliant device + trusted IP) is in place" },
      { id: "a-both", label: "You have appropriate roles in BOTH Source and Destination tenants" },
    ],
  },
  {
    title: "Environment Inventory",
    items: [
      { id: "a-inv-rules", label: "Analytics + hunting rules inventoried (count recorded)" },
      { id: "a-inv-pb", label: "Playbooks and their API connections documented" },
      { id: "a-inv-conn", label: "Data connectors and auth methods documented" },
      { id: "a-inv-wl", label: "Watchlists, functions/parsers, and workbooks inventoried" },
      { id: "a-inv-sol", label: "Content Hub solutions and versions listed" },
    ],
  },
  {
    title: "Destination Readiness",
    items: [
      { id: "a-dst-ws", label: "Destination Log Analytics workspace created and Sentinel onboarded" },
      { id: "a-dst-rg", label: "Target resource groups and naming convention agreed" },
      { id: "a-dst-quota", label: "Ingestion pricing tier / commitment tier selected" },
      { id: "a-dst-net", label: "Network path for forwarders/agents to Destination validated" },
    ],
  },
  {
    title: "Governance & Rollback",
    items: [
      { id: "a-gov-audit", label: "Diagnostic + Activity logging enabled in both tenants" },
      { id: "a-gov-window", label: "Cutover window and rollback plan approved" },
      { id: "a-gov-gap", label: "Plan to avoid a detection gap during cutover (dual-run period)" },
      { id: "a-gov-comms", label: "SOC + stakeholders notified of the migration schedule" },
    ],
  },
];

// Prerequisites checklist shown on the README
export const PREREQUISITES: CheckItem[] = [
  { id: "p-roles", label: "Sentinel Reader on Source and Sentinel Contributor on Destination (via PIM)" },
  { id: "p-mfa", label: "MFA-capable admin accounts in both tenants" },
  { id: "p-tools", label: "Azure CLI, PowerShell (Az + Az.SecurityInsights) installed (for CLI track)" },
  { id: "p-ws", label: "Destination workspace created with Sentinel enabled" },
  { id: "p-folder", label: "Local working folder created: sentinel-migration/" },
  { id: "p-pim", label: "PIM eligible roles set up — no permanent privileged assignments" },
];

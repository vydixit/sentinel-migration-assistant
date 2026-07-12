export interface Limitation {
  title: string;
  detail: string;
  workaround: string;
  severity: "hard" | "partial";
}

export const LIMITATIONS: Limitation[] = [
  {
    title: "Incident history",
    detail: "Existing incidents, their investigation timelines, comments, and status cannot be moved between tenants.",
    workaround: "Export incidents to CSV/JSON for the record, or keep the Source read-only for historical reference during a retention window.",
    severity: "hard",
  },
  {
    title: "Historical logs (raw data)",
    detail: "Ingested log data in Log Analytics tables is workspace-bound and cannot be copied to another tenant's workspace.",
    workaround: "Re-ingest from source systems where possible, or export to Azure Storage / ADX for archival and cross-query.",
    severity: "hard",
  },
  {
    title: "Managed identities",
    detail: "System- and user-assigned managed identities are tied to the Source tenant's Entra ID and cannot be transferred.",
    workaround: "Recreate managed identities in the Destination and re-grant their RBAC role assignments.",
    severity: "hard",
  },
  {
    title: "Connector authentication tokens",
    detail: "OAuth tokens, API keys, and app-registration consents are tenant-scoped and never migrate.",
    workaround: "Re-onboard every connector and re-authorize each connection in the Destination tenant.",
    severity: "hard",
  },
  {
    title: "Workspace GUIDs & resource IDs",
    detail: "The workspace ID, resource IDs, and any content that hard-codes them will not resolve in the Destination.",
    workaround: "Parameterize templates; find-and-replace subscription/RG/workspace IDs before import.",
    severity: "partial",
  },
  {
    title: "UEBA baseline learning",
    detail: "Behavioral baselines are machine-learned per workspace and cannot be exported.",
    workaround: "Enable UEBA in the Destination and allow 7-14 days of re-training; expect anomaly noise while it warms up.",
    severity: "partial",
  },
  {
    title: "Custom detections tied to workspace-specific tables",
    detail: "Rules referencing custom tables (_CL), specific watchlists, or functions break until those dependencies exist in the Destination.",
    workaround: "Migrate parsers, functions, watchlists, and custom tables FIRST, then the rules that depend on them.",
    severity: "partial",
  },
  {
    title: "Threat Intelligence indicators",
    detail: "TI indicators ingested via connectors are not portable as a bulk copy across tenants.",
    workaround: "Re-connect the TI feed/TAXII source in the Destination, or bulk re-upload indicators via the API.",
    severity: "partial",
  },
];

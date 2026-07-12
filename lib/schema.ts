// Migration state data model + JSON Schema for the Sentinel Migration Assistant.
// NOTE: This app NEVER stores tenant IDs, secrets, tokens, or credentials.
// Only human-friendly *labels* are persisted so the user can tell Source/Destination apart.

export type ComponentStatus =
  | "not_started"
  | "in_progress"
  | "blocked"
  | "completed"
  | "skipped";

export type MigrationMode = "manual" | "cli" | "hybrid";

export type Phase =
  | "readiness"
  | "export"
  | "validation"
  | "import"
  | "testing"
  | "cutover"
  | "post_migration";

export const PHASES: Phase[] = [
  "readiness",
  "export",
  "validation",
  "import",
  "testing",
  "cutover",
  "post_migration",
];

export const PHASE_LABELS: Record<Phase, string> = {
  readiness: "Readiness",
  export: "Export",
  validation: "Validation",
  import: "Import",
  testing: "Testing",
  cutover: "Cutover",
  post_migration: "Post-Migration",
};

export interface ComponentProgress {
  status: ComponentStatus;
  steps: Record<string, { done: boolean; at?: string }>;
  blocker?: string;
}

export interface PhaseProgress {
  status: ComponentStatus;
  startedAt?: string;
  completedAt?: string;
}

export interface MigrationState {
  version: 1;
  tenants: {
    // Labels only — never IDs/secrets.
    sourceLabel: string;
    destinationLabel: string;
  };
  mode?: MigrationMode;
  components: Record<string, ComponentProgress>;
  phases: Record<Phase, PhaseProgress>;
  assessment: Record<string, boolean>;
  prerequisites: Record<string, boolean>;
  updatedAt: string;
}

// Lightweight JSON Schema (draft-07) describing the exported migration log.
export const MIGRATION_JSON_SCHEMA = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "SentinelMigrationState",
  type: "object",
  required: ["version", "tenants", "components", "phases"],
  properties: {
    version: { const: 1 },
    tenants: {
      type: "object",
      required: ["sourceLabel", "destinationLabel"],
      properties: {
        sourceLabel: { type: "string", description: "Friendly label only — NO tenant IDs" },
        destinationLabel: { type: "string", description: "Friendly label only — NO tenant IDs" },
      },
    },
    mode: { enum: ["manual", "cli", "hybrid"] },
    components: {
      type: "object",
      additionalProperties: {
        type: "object",
        properties: {
          status: {
            enum: ["not_started", "in_progress", "blocked", "completed", "skipped"],
          },
          steps: { type: "object" },
          blocker: { type: "string" },
        },
      },
    },
    phases: { type: "object" },
    updatedAt: { type: "string", format: "date-time" },
  },
} as const;

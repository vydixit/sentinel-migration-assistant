// Structured guided content for every migratable Microsoft Sentinel component.
// Language is intentionally beginner-friendly ("click here" style).

export interface Step {
  id: string;
  text: string;
  permission?: string;
  ref?: { label: string; url: string };
}

export interface Reference {
  label: string;
  url: string;
}

export interface ZeroTrustCheck {
  label: string;
  detail: string;
}

export interface SentinelComponent {
  id: string;
  name: string;
  icon: string; // lucide-react icon name
  category: string;
  phase: string;
  whatIsIt: string;
  whyMigrate: string;
  permissions: string[];
  cliReconfig?: string; // set when the component REQUIRES manual reconfiguration
  zeroTrust: ZeroTrustCheck[];
  exportSteps: Step[];
  importSteps: Step[];
  validationSteps: Step[];
  rollback: string;
  references: Reference[];
}

const ML = "https://learn.microsoft.com";

export const COMPONENTS: SentinelComponent[] = [
  {
    id: "analytics-rules",
    name: "Analytics Rules",
    icon: "ShieldAlert",
    category: "Detections",
    phase: "export",
    whatIsIt:
      "Analytics rules are the detection logic of Sentinel. They run KQL queries on your workspace data to raise alerts and create incidents (Scheduled, NRT, Microsoft Security, Fusion, and ML Behavior Analytics rule types).",
    whyMigrate:
      "Without your detections, the destination workspace is blind. Analytics rules are the highest-value asset to move so the new tenant keeps the same detection coverage.",
    permissions: ["Microsoft Sentinel Reader (export)", "Microsoft Sentinel Contributor (import)"],
    zeroTrust: [
      { label: "Identity", detail: "Sign in with MFA; never use a break-glass/global admin account." },
      { label: "Least privilege", detail: "Reader is enough to export; only elevate to Contributor for import." },
      { label: "Time-bound", detail: "Activate the PIM role for a 1-hour window, then let it expire." },
      { label: "Audit", detail: "Confirm Azure Activity + Sentinel diagnostic logs are on before exporting." },
    ],
    exportSteps: [
      { id: "ar-e1", text: "Open https://portal.azure.com and sign in to Tenant B (Source).", permission: "Microsoft Sentinel Reader" },
      { id: "ar-e2", text: 'In the top search bar, type "Microsoft Sentinel" and select it.' },
      { id: "ar-e3", text: "Select your Source workspace, then click Analytics in the left menu." },
      { id: "ar-e4", text: "Select a rule (or use the checkbox to multi-select), then click Export → Export Rule (ARM Template)." , ref: { label: "Export analytics rules", url: `${ML}/azure/sentinel/import-export-analytics-rules` } },
      { id: "ar-e5", text: "Save each JSON/ARM file into a local folder named sentinel-migration/analytics-rules/." },
      { id: "ar-e6", text: "Repeat for Scheduled, NRT, Fusion, and ML rules. Note any rule that references a workspace-specific table or Watchlist." },
    ],
    importSteps: [
      { id: "ar-i1", text: "Open a new browser session and sign in to Tenant A (Destination).", permission: "Microsoft Sentinel Contributor" },
      { id: "ar-i2", text: "Go to Microsoft Sentinel → Destination workspace → Analytics." },
      { id: "ar-i3", text: "Click Import, choose the saved ARM template, and open it for review." },
      { id: "ar-i4", text: "Update the workspace name, resource group, and any hard-coded IDs to match the Destination.", permission: "Microsoft Sentinel Contributor" },
      { id: "ar-i5", text: "Re-map any Watchlist / custom function references that the rule depends on (migrate those first)." },
      { id: "ar-i6", text: "Click Review + create → Create. Verify the rule appears as Enabled." },
    ],
    validationSteps: [
      { id: "ar-v1", text: "Open the imported rule and confirm the KQL query validates without errors." },
      { id: "ar-v2", text: "Trigger a test event (or lower the threshold temporarily) and confirm an incident is generated." },
      { id: "ar-v3", text: "Compare rule count Source vs Destination to confirm none were dropped." },
    ],
    rollback:
      "Analytics rules are additive — if an imported rule misbehaves, simply disable or delete it in the Destination. The Source rules are untouched, so you can safely re-export and retry.",
    references: [
      { label: "Detect threats with analytics rules", url: `${ML}/azure/sentinel/detect-threats-built-in` },
      { label: "Export & import analytics rules", url: `${ML}/azure/sentinel/import-export-analytics-rules` },
      { label: "Manage rules as code (repositories)", url: `${ML}/azure/sentinel/ci-cd` },
    ],
  },
  {
    id: "automation-rules",
    name: "Automation Rules",
    icon: "Workflow",
    category: "SOAR",
    phase: "export",
    whatIsIt:
      "Automation rules centrally manage incident handling — assigning owners, changing severity, adding tags, closing noise, and triggering playbooks based on conditions.",
    whyMigrate:
      "They encode your SOC's incident-handling policy. Migrating them keeps triage consistent in the new tenant.",
    permissions: ["Microsoft Sentinel Reader (export)", "Microsoft Sentinel Contributor (import)", "Automation rule reference to playbooks requires Playbook Operator"],
    zeroTrust: [
      { label: "Least privilege", detail: "Use Sentinel Automation Contributor / Contributor scoped to the workspace RG only." },
      { label: "Identity", detail: "Playbook links run under a managed identity, not your user token." },
      { label: "Audit", detail: "Log every automation-rule change; review the change in the activity log." },
    ],
    exportSteps: [
      { id: "aut-e1", text: "In Tenant B → Sentinel → Automation, open each automation rule.", permission: "Microsoft Sentinel Reader" },
      { id: "aut-e2", text: "Record the trigger, conditions, order, and actions. Automation rules have no one-click export, so capture them via ARM export of the workspace or document them." , ref: { label: "Automation rules", url: `${ML}/azure/sentinel/automate-incident-handling-with-automation-rules` } },
      { id: "aut-e3", text: "Export the resource group ARM template (Portal → Resource group → Export template) to capture rule definitions as code." },
      { id: "aut-e4", text: "Save the templates to sentinel-migration/automation-rules/." },
    ],
    importSteps: [
      { id: "aut-i1", text: "Migrate the referenced playbooks FIRST (see Playbooks component).", permission: "Logic App Contributor" },
      { id: "aut-i2", text: "In Tenant A → Sentinel → Automation → Create → Automation rule." , permission: "Microsoft Sentinel Contributor" },
      { id: "aut-i3", text: "Recreate the trigger, conditions and actions exactly as documented." },
      { id: "aut-i4", text: "Re-point any 'Run playbook' action to the newly migrated playbook in the Destination." },
      { id: "aut-i5", text: "Set the rule order to match the Source priority." },
    ],
    validationSteps: [
      { id: "aut-v1", text: "Create a test incident and confirm the automation rule fires (owner assigned / tag added)." },
      { id: "aut-v2", text: "Confirm any linked playbook is invoked and completes successfully." },
    ],
    rollback:
      "Disable the automation rule in the Destination to instantly stop it. No impact to Source.",
    references: [
      { label: "Automate incident handling", url: `${ML}/azure/sentinel/automate-incident-handling-with-automation-rules` },
      { label: "Migrate automation as ARM", url: `${ML}/azure/sentinel/ci-cd` },
    ],
  },
  {
    id: "playbooks",
    name: "Playbooks (Logic Apps)",
    icon: "PlayCircle",
    category: "SOAR",
    phase: "import",
    whatIsIt:
      "Playbooks are Azure Logic Apps that automate response actions — sending emails/Teams messages, isolating devices, enriching incidents, or creating tickets.",
    whyMigrate:
      "They deliver your automated response. Migrating them restores SOAR capability in the new tenant.",
    permissions: ["Logic App Contributor", "Microsoft Sentinel Playbook Operator", "Owner (to configure connections/managed identity)"],
    cliReconfig:
      "API connections, managed identities and OAuth authorizations do NOT transfer. You must recreate every connection and re-authorize each connector in the Destination tenant.",
    zeroTrust: [
      { label: "Identity", detail: "Use a user-assigned managed identity for the playbook — never embedded secrets." },
      { label: "Least privilege", detail: "Grant the managed identity only the RBAC it needs (e.g., Sentinel Responder)." },
      { label: "Network", detail: "Restrict Logic App triggers/connectors to approved IP ranges where possible." },
      { label: "Audit", detail: "Enable Logic App run history + diagnostic logs." },
    ],
    exportSteps: [
      { id: "pb-e1", text: "In Tenant B, open the Logic App playbook → Export template (Logic app → Export template)." , permission: "Logic App Contributor", ref: { label: "Logic Apps ARM", url: `${ML}/azure/logic-apps/logic-apps-azure-resource-manager-templates-overview` } },
      { id: "pb-e2", text: "Note every API connection the playbook uses (Office 365, Teams, Sentinel, ServiceNow, etc.)." },
      { id: "pb-e3", text: "Document the managed identity and its role assignments." },
      { id: "pb-e4", text: "Save the exported template to sentinel-migration/playbooks/." },
    ],
    importSteps: [
      { id: "pb-i1", text: "In Tenant A, deploy the Logic App ARM template (Portal → Deploy a custom template).", permission: "Logic App Contributor" },
      { id: "pb-i2", text: "Create NEW API connections in the Destination — old connection auth cannot be reused." },
      { id: "pb-i3", text: "Re-authorize each connector (OAuth consent) using a Destination-tenant service account.", permission: "Owner" },
      { id: "pb-i4", text: "Create/assign a user-assigned managed identity and grant it least-privilege roles." },
      { id: "pb-i5", text: "In Sentinel → Settings → Playbook permissions, grant Sentinel access to the playbook's resource group." },
    ],
    validationSteps: [
      { id: "pb-v1", text: "Run the playbook manually (Logic App → Run Trigger) and confirm a green success run." },
      { id: "pb-v2", text: "Trigger it from a test incident and confirm the response action executes." },
    ],
    rollback:
      "Disable the Logic App in the Destination. Because Source Logic Apps are unchanged, you can re-deploy. Never delete Source connections until Destination is verified.",
    references: [
      { label: "Sentinel playbooks", url: `${ML}/azure/sentinel/automate-responses-with-playbooks` },
      { label: "Authenticate playbooks with managed identity", url: `${ML}/azure/sentinel/authenticate-playbooks-to-sentinel` },
    ],
  },
  {
    id: "watchlists",
    name: "Watchlists",
    icon: "ListChecks",
    category: "Content",
    phase: "export",
    whatIsIt:
      "Watchlists are curated lookup tables (VIP users, terminated employees, allow/deny IPs) you correlate against events in analytics and hunting queries.",
    whyMigrate:
      "Many detections join against watchlists. Without them, those rules break in the new tenant.",
    permissions: ["Microsoft Sentinel Reader (export)", "Microsoft Sentinel Contributor (import)"],
    zeroTrust: [
      { label: "Data minimization", detail: "Review watchlist contents for sensitive PII before moving; redact what isn't needed." },
      { label: "Least privilege", detail: "Contributor scoped to the workspace is sufficient." },
    ],
    exportSteps: [
      { id: "wl-e1", text: "In Tenant B → Sentinel → Watchlists, open each watchlist.", permission: "Microsoft Sentinel Reader" },
      { id: "wl-e2", text: "Click Export items to download the source CSV." , ref: { label: "Watchlists", url: `${ML}/azure/sentinel/watchlists` } },
      { id: "wl-e3", text: "Record the watchlist alias (SearchKey) — queries reference this exact alias." },
      { id: "wl-e4", text: "Save CSVs to sentinel-migration/watchlists/." },
    ],
    importSteps: [
      { id: "wl-i1", text: "In Tenant A → Sentinel → Watchlists → Add new.", permission: "Microsoft Sentinel Contributor" },
      { id: "wl-i2", text: "Use the SAME alias/SearchKey so dependent queries keep working." },
      { id: "wl-i3", text: "Upload the exported CSV and finish the wizard." },
    ],
    validationSteps: [
      { id: "wl-v1", text: "Run _GetWatchlist('<alias>') in Logs and confirm the row count matches the Source." },
    ],
    rollback: "Delete the watchlist in the Destination to roll back. Source is untouched.",
    references: [{ label: "Create watchlists", url: `${ML}/azure/sentinel/watchlists-create` }],
  },
  {
    id: "workbooks",
    name: "Workbooks",
    icon: "LayoutDashboard",
    category: "Visualization",
    phase: "export",
    whatIsIt:
      "Workbooks are interactive dashboards built on Azure Monitor that visualize Sentinel data for reporting and investigation.",
    whyMigrate:
      "They give analysts and leadership their reporting views. Migrating preserves dashboards and saved investigations.",
    permissions: ["Workbook Reader (export)", "Workbook Contributor (import)", "Microsoft Sentinel Contributor"],
    zeroTrust: [
      { label: "Least privilege", detail: "Workbook Contributor scoped to the RG; no subscription-wide grants." },
      { label: "Audit", detail: "Workbooks can surface sensitive data — restrict who can edit shared workbooks." },
    ],
    exportSteps: [
      { id: "wb-e1", text: "In Tenant B → Sentinel → Workbooks, open the saved workbook.", permission: "Workbook Reader" },
      { id: "wb-e2", text: "Click Edit → Advanced Editor (</>) and copy the Gallery Template JSON." , ref: { label: "Workbooks", url: `${ML}/azure/sentinel/monitor-your-data` } },
      { id: "wb-e3", text: "Save the JSON to sentinel-migration/workbooks/." },
    ],
    importSteps: [
      { id: "wb-i1", text: "In Tenant A → Sentinel → Workbooks → Add workbook → Advanced Editor.", permission: "Workbook Contributor" },
      { id: "wb-i2", text: "Paste the JSON, then Apply and Save (pin to the Destination workspace)." },
      { id: "wb-i3", text: "Fix any hard-coded subscription/workspace resource IDs in the parameters." },
    ],
    validationSteps: [
      { id: "wb-v1", text: "Open the workbook and confirm all tiles render without 'resource not found' errors." },
    ],
    rollback: "Delete the workbook in the Destination. Source unaffected.",
    references: [{ label: "Visualize data with workbooks", url: `${ML}/azure/sentinel/monitor-your-data` }],
  },
  {
    id: "hunting-queries",
    name: "Hunting Queries",
    icon: "Search",
    category: "Detections",
    phase: "export",
    whatIsIt:
      "Hunting queries are saved KQL queries analysts use to proactively search for threats that haven't triggered an alert.",
    whyMigrate: "They embody your threat-hunting playbook and analyst knowledge.",
    permissions: ["Microsoft Sentinel Reader (export)", "Microsoft Sentinel Contributor (import)"],
    zeroTrust: [
      { label: "Least privilege", detail: "Reader to export, Contributor to save into the Destination." },
    ],
    exportSteps: [
      { id: "hq-e1", text: "In Tenant B → Sentinel → Hunting, open each saved query and copy its KQL.", permission: "Microsoft Sentinel Reader", ref: { label: "Hunting", url: `${ML}/azure/sentinel/hunting` } },
      { id: "hq-e2", text: "Alternatively export via the workspace ARM template (savedSearches resource)." },
      { id: "hq-e3", text: "Save queries to sentinel-migration/hunting-queries/." },
    ],
    importSteps: [
      { id: "hq-i1", text: "In Tenant A → Sentinel → Hunting → New Query.", permission: "Microsoft Sentinel Contributor" },
      { id: "hq-i2", text: "Paste the KQL, set the name/tactics/techniques to match the Source." },
      { id: "hq-i3", text: "Re-map any watchlist/function references first." },
    ],
    validationSteps: [
      { id: "hq-v1", text: "Run each imported hunting query and confirm it validates and returns results." },
    ],
    rollback: "Delete the hunting query in the Destination. Source untouched.",
    references: [{ label: "Hunt for threats", url: `${ML}/azure/sentinel/hunting` }],
  },
  {
    id: "data-connectors",
    name: "Data Connectors",
    icon: "PlugZap",
    category: "Ingestion",
    phase: "import",
    whatIsIt:
      "Data connectors bring logs into Sentinel from Microsoft services (Entra ID, Defender, Office 365), Azure resources, and third parties (Syslog/CEF, APIs).",
    whyMigrate:
      "No data, no detections. Connectors are the foundation — but they are almost always RE-CONFIGURED, not copied.",
    permissions: ["Security Administrator (varies by connector)", "Microsoft Sentinel Contributor", "Owner on the source service for some connectors"],
    cliReconfig:
      "Connectors CANNOT be exported/imported like content. Authentication is tenant-bound. Each connector must be freshly onboarded in the Destination, and agents/forwarders (AMA/CEF) repointed to the new workspace.",
    zeroTrust: [
      { label: "Identity", detail: "Use least-privilege connector-specific roles; avoid Global Administrator." },
      { label: "Least privilege", detail: "e.g., use dedicated app registrations with only the required Graph/API permissions." },
      { label: "Network", detail: "For CEF/Syslog, restrict forwarder egress to the Destination workspace only." },
      { label: "Audit", detail: "Verify ingestion via Heartbeat/usage metrics after re-onboarding." },
    ],
    exportSteps: [
      { id: "dc-e1", text: "In Tenant B → Sentinel → Data connectors, list every Connected connector and its data types.", permission: "Microsoft Sentinel Reader", ref: { label: "Data connectors", url: `${ML}/azure/sentinel/connect-data-sources` } },
      { id: "dc-e2", text: "Document each connector's auth method (managed identity, app registration, agent)." },
      { id: "dc-e3", text: "For CEF/Syslog, note the forwarder hosts and AMA DCR configuration." },
    ],
    importSteps: [
      { id: "dc-i1", text: "In Tenant A → Sentinel → Content hub, install the matching connector solution.", permission: "Microsoft Sentinel Contributor" },
      { id: "dc-i2", text: "Freshly onboard each connector — create NEW app registrations / consent in the Destination tenant.", permission: "Security Administrator" },
      { id: "dc-i3", text: "Repoint AMA / CEF forwarders to the Destination workspace via a new Data Collection Rule." },
      { id: "dc-i4", text: "Enable required data types and, if needed, UEBA and analytics." },
    ],
    validationSteps: [
      { id: "dc-v1", text: "Confirm the connector shows Connected and 'Data received' timestamp is recent." },
      { id: "dc-v2", text: "Run a KQL query against the expected table (e.g., SigninLogs) to confirm fresh ingestion." },
    ],
    rollback:
      "Disable the connector / DCR association in the Destination. Keep the Source connectors ingesting until cutover is confirmed to avoid a detection gap.",
    references: [
      { label: "Connect data sources", url: `${ML}/azure/sentinel/connect-data-sources` },
      { label: "AMA & DCRs", url: `${ML}/azure/azure-monitor/agents/data-collection-rule-azure-monitor-agent` },
    ],
  },
  {
    id: "ueba",
    name: "UEBA",
    icon: "UserSearch",
    category: "Analytics",
    phase: "import",
    whatIsIt:
      "User & Entity Behavior Analytics builds behavioral baselines from identity and activity data to surface anomalous behavior.",
    whyMigrate:
      "You enable UEBA in the Destination — but its learned baseline does NOT transfer and must be re-trained on new data.",
    permissions: ["Microsoft Sentinel Contributor", "Global Reader / Security Reader for identity data sources"],
    cliReconfig:
      "UEBA baselines are workspace-learned and cannot be exported. After enabling UEBA in the Destination it re-learns over ~7-14 days. Expect anomaly noise during warm-up.",
    zeroTrust: [
      { label: "Identity", detail: "UEBA needs Entra ID sign-in/audit sources — connect them with least-privilege." },
      { label: "Data minimization", detail: "Only enable the entity sources required for your use cases." },
    ],
    exportSteps: [
      { id: "ueba-e1", text: "In Tenant B, document which UEBA data sources are enabled (Entra ID, Azure Activity).", permission: "Microsoft Sentinel Reader", ref: { label: "UEBA", url: `${ML}/azure/sentinel/identify-threats-with-entity-behavior-analytics` } },
    ],
    importSteps: [
      { id: "ueba-i1", text: "In Tenant A, first connect the identity data sources UEBA depends on.", permission: "Microsoft Sentinel Contributor" },
      { id: "ueba-i2", text: "Go to Sentinel → Settings → Entity behavior and turn UEBA On." },
      { id: "ueba-i3", text: "Select the same entity sources as the Source." },
    ],
    validationSteps: [
      { id: "ueba-v1", text: "Confirm BehaviorAnalytics table starts populating after data flows in." },
      { id: "ueba-v2", text: "Allow 7-14 days for baselines to mature before trusting anomaly scores." },
    ],
    rollback: "Toggle UEBA Off in the Destination. No impact to Source.",
    references: [{ label: "Entity behavior analytics", url: `${ML}/azure/sentinel/identify-threats-with-entity-behavior-analytics` }],
  },
  {
    id: "content-hub",
    name: "Content Hub Solutions",
    icon: "Package",
    category: "Content",
    phase: "import",
    whatIsIt:
      "Content Hub packages product solutions (connectors + rules + workbooks + playbooks + hunting queries) into installable bundles.",
    whyMigrate:
      "Reinstalling the same solutions in the Destination gives you the out-of-box content baseline quickly, so you only migrate your customizations on top.",
    permissions: ["Microsoft Sentinel Contributor", "Template Spec Contributor"],
    zeroTrust: [
      { label: "Least privilege", detail: "Contributor scoped to the workspace RG is sufficient to install solutions." },
      { label: "Supply chain", detail: "Install only vendor-verified solutions from Content hub." },
    ],
    exportSteps: [
      { id: "ch-e1", text: "In Tenant B → Sentinel → Content hub, list all Installed solutions and versions.", permission: "Microsoft Sentinel Reader", ref: { label: "Content hub", url: `${ML}/azure/sentinel/sentinel-solutions` } },
    ],
    importSteps: [
      { id: "ch-i1", text: "In Tenant A → Sentinel → Content hub, install the SAME solutions.", permission: "Microsoft Sentinel Contributor" },
      { id: "ch-i2", text: "Install the same versions where possible to keep content parity." },
      { id: "ch-i3", text: "Then layer your customized rules/workbooks on top (from their components)." },
    ],
    validationSteps: [
      { id: "ch-v1", text: "Confirm the installed solution list matches Source (name + version)." },
    ],
    rollback: "Uninstall the solution in the Destination. Source untouched.",
    references: [{ label: "Discover & manage solutions", url: `${ML}/azure/sentinel/sentinel-solutions-deploy` }],
  },
  {
    id: "incident-settings",
    name: "Incident Settings",
    icon: "Settings2",
    category: "Configuration",
    phase: "import",
    whatIsIt:
      "Incident settings control incident creation, alert grouping, entity mapping defaults, and Microsoft 365 Defender incident integration.",
    whyMigrate:
      "These settings shape how alerts become incidents. Re-applying them keeps triage behavior consistent.",
    permissions: ["Microsoft Sentinel Contributor"],
    zeroTrust: [
      { label: "Audit", detail: "Record configuration changes; incident settings affect what the SOC sees." },
    ],
    exportSteps: [
      { id: "is-e1", text: "In Tenant B, document Sentinel → Settings → Settings (incident creation, entity mapping, M365D connector).", permission: "Microsoft Sentinel Reader", ref: { label: "Incidents", url: `${ML}/azure/sentinel/investigate-cases` } },
    ],
    importSteps: [
      { id: "is-i1", text: "In Tenant A → Sentinel → Settings, re-apply the incident creation and grouping settings.", permission: "Microsoft Sentinel Contributor" },
      { id: "is-i2", text: "If using Microsoft 365 Defender, connect it and match incident sync settings." },
    ],
    validationSteps: [
      { id: "is-v1", text: "Generate a test alert and confirm an incident is created with the expected grouping/severity." },
    ],
    rollback: "Revert the setting in the Destination UI. Source untouched.",
    references: [{ label: "Investigate incidents", url: `${ML}/azure/sentinel/investigate-cases` }],
  },
  {
    id: "kql-functions",
    name: "Custom KQL Functions / Parsers",
    icon: "FunctionSquare",
    category: "Content",
    phase: "export",
    whatIsIt:
      "Saved functions and ASIM parsers normalize and simplify KQL. Rules and hunting queries call them by name (e.g., as saved functions/aliases).",
    whyMigrate:
      "Detections that call a custom function break if the function is missing. Migrate parsers early so dependent content works.",
    permissions: ["Microsoft Sentinel Reader (export)", "Microsoft Sentinel Contributor (import)"],
    zeroTrust: [
      { label: "Least privilege", detail: "Contributor on the workspace to save functions; nothing broader." },
    ],
    exportSteps: [
      { id: "kf-e1", text: "In Tenant B → Logs → Functions, open each custom function/parser and copy its KQL and alias.", permission: "Microsoft Sentinel Reader", ref: { label: "Functions in Logs", url: `${ML}/azure/azure-monitor/logs/functions` } },
      { id: "kf-e2", text: "Note ASIM parsers (Im/ vim/ ASim prefixes) and their exact names." },
      { id: "kf-e3", text: "Save to sentinel-migration/functions/." },
    ],
    importSteps: [
      { id: "kf-i1", text: "In Tenant A → Logs, paste each function's query, then Save → Save as function.", permission: "Microsoft Sentinel Contributor" },
      { id: "kf-i2", text: "Use the SAME function alias/name so dependent rules resolve it." },
      { id: "kf-i3", text: "Import ASIM parsers via the ASIM deployment templates if used." },
    ],
    validationSteps: [
      { id: "kf-v1", text: "Call each function by alias in Logs and confirm it resolves and returns data." },
    ],
    rollback: "Delete the saved function in the Destination. Source untouched.",
    references: [
      { label: "KQL saved functions", url: `${ML}/azure/azure-monitor/logs/functions` },
      { label: "ASIM parsers", url: `${ML}/azure/sentinel/normalization` },
    ],
  },
];

export function getComponent(id: string) {
  return COMPONENTS.find((c) => c.id === id);
}

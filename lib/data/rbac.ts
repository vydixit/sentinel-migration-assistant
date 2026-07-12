export interface RbacRow {
  activity: string;
  role: string;
  scope: string;
  zeroTrust: string;
  ref: string;
  category: string;
}

const ML = "https://learn.microsoft.com";
const ROLES = `${ML}/azure/sentinel/roles`;

export const RBAC_MATRIX: RbacRow[] = [
  { activity: "Export Analytics Rule (ARM)", role: "Microsoft Sentinel Reader", scope: "Workspace", zeroTrust: "Use PIM, 1-hour activation", ref: ROLES, category: "Detections" },
  { activity: "Import / Create Analytics Rule", role: "Microsoft Sentinel Contributor", scope: "Workspace", zeroTrust: "JIT via PIM; expire after import", ref: ROLES, category: "Detections" },
  { activity: "Create / Edit Automation Rule", role: "Microsoft Sentinel Contributor", scope: "Workspace / RG", zeroTrust: "Time-bound elevation only", ref: `${ML}/azure/sentinel/automate-incident-handling-with-automation-rules`, category: "SOAR" },
  { activity: "Deploy Playbook (Logic App)", role: "Logic App Contributor + Microsoft Sentinel Playbook Operator", scope: "Resource Group", zeroTrust: "Use user-assigned managed identity, not user creds", ref: `${ML}/azure/sentinel/authenticate-playbooks-to-sentinel`, category: "SOAR" },
  { activity: "Authorize Playbook API connection", role: "Owner (on the connection resource)", scope: "Resource Group", zeroTrust: "Consent with a dedicated service account, never Global Admin", ref: `${ML}/azure/logic-apps/logic-apps-securing-a-logic-app`, category: "SOAR" },
  { activity: "Grant Sentinel access to Playbook RG", role: "Owner / User Access Administrator", scope: "Resource Group", zeroTrust: "Scope to the single playbook RG only", ref: `${ML}/azure/sentinel/tutorial-respond-threats-playbook`, category: "SOAR" },
  { activity: "Create / Upload Watchlist", role: "Microsoft Sentinel Contributor", scope: "Workspace", zeroTrust: "Review for PII before upload", ref: `${ML}/azure/sentinel/watchlists`, category: "Content" },
  { activity: "Import Workbook", role: "Workbook Contributor", scope: "Resource Group", zeroTrust: "Scope to RG, avoid subscription-wide", ref: `${ML}/azure/azure-monitor/visualize/workbooks-overview`, category: "Visualization" },
  { activity: "Save Hunting Query", role: "Microsoft Sentinel Contributor", scope: "Workspace", zeroTrust: "PIM elevation, audit enabled", ref: `${ML}/azure/sentinel/hunting`, category: "Detections" },
  { activity: "Configure Data Connector", role: "Security Administrator (varies by connector)", scope: "Tenant / Workspace", zeroTrust: "Avoid Global Admin; use connector-specific least privilege", ref: `${ML}/azure/sentinel/connect-data-sources`, category: "Ingestion" },
  { activity: "Create App Registration for connector", role: "Application Administrator / Cloud App Admin", scope: "Tenant", zeroTrust: "Grant only required Graph/API permissions", ref: `${ML}/entra/identity-platform/howto-create-service-principal-portal`, category: "Ingestion" },
  { activity: "Repoint AMA / Create DCR", role: "Monitoring Contributor", scope: "Resource Group", zeroTrust: "Scope DCR association to target machines only", ref: `${ML}/azure/azure-monitor/agents/data-collection-rule-azure-monitor-agent`, category: "Ingestion" },
  { activity: "Enable UEBA", role: "Microsoft Sentinel Contributor", scope: "Workspace", zeroTrust: "Connect identity sources with least privilege", ref: `${ML}/azure/sentinel/enable-entity-behavior-analytics`, category: "Analytics" },
  { activity: "Install Content Hub Solution", role: "Microsoft Sentinel Contributor + Template Spec Contributor", scope: "Resource Group", zeroTrust: "Install verified solutions only", ref: `${ML}/azure/sentinel/sentinel-solutions-deploy`, category: "Content" },
  { activity: "Change Incident Settings", role: "Microsoft Sentinel Contributor", scope: "Workspace", zeroTrust: "Audit every setting change", ref: `${ML}/azure/sentinel/investigate-cases`, category: "Configuration" },
  { activity: "Save Custom KQL Function / Parser", role: "Microsoft Sentinel Contributor", scope: "Workspace", zeroTrust: "PIM elevation only", ref: `${ML}/azure/azure-monitor/logs/functions`, category: "Content" },
  { activity: "Onboard MSSP via Azure Lighthouse", role: "Owner (delegating) / defined roles (managing)", scope: "Subscription / RG", zeroTrust: "Least-privilege delegated roles, eligible (PIM for Lighthouse)", ref: `${ML}/azure/lighthouse/concepts/cross-tenant-management-experience`, category: "MSSP" },
];

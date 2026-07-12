export interface DocLink {
  label: string;
  url: string;
  category: string;
}

const ML = "https://learn.microsoft.com";

export const DOC_LINKS: DocLink[] = [
  // Sentinel Core
  { category: "Sentinel Core", label: "What is Microsoft Sentinel", url: `${ML}/azure/sentinel/overview` },
  { category: "Sentinel Core", label: "Onboard Microsoft Sentinel", url: `${ML}/azure/sentinel/quickstart-onboard` },
  { category: "Sentinel Core", label: "Best practices", url: `${ML}/azure/sentinel/best-practices` },
  { category: "Sentinel Core", label: "Sentinel in the Defender portal", url: `${ML}/azure/sentinel/microsoft-sentinel-defender-portal` },

  // Analytics Rules
  { category: "Analytics Rules", label: "Detect threats with analytics rules", url: `${ML}/azure/sentinel/detect-threats-built-in` },
  { category: "Analytics Rules", label: "Create custom analytics rules", url: `${ML}/azure/sentinel/detect-threats-custom` },
  { category: "Analytics Rules", label: "Export & import analytics rules", url: `${ML}/azure/sentinel/import-export-analytics-rules` },
  { category: "Analytics Rules", label: "Near-real-time (NRT) rules", url: `${ML}/azure/sentinel/create-nrt-rules` },

  // Automation & Playbooks
  { category: "Automation & Playbooks", label: "Automate incident handling", url: `${ML}/azure/sentinel/automate-incident-handling-with-automation-rules` },
  { category: "Automation & Playbooks", label: "Automate responses with playbooks", url: `${ML}/azure/sentinel/automate-responses-with-playbooks` },
  { category: "Automation & Playbooks", label: "Authenticate playbooks to Sentinel", url: `${ML}/azure/sentinel/authenticate-playbooks-to-sentinel` },
  { category: "Automation & Playbooks", label: "Respond to threats with playbooks (tutorial)", url: `${ML}/azure/sentinel/tutorial-respond-threats-playbook` },

  // Data Connectors
  { category: "Data Connectors", label: "Connect data sources", url: `${ML}/azure/sentinel/connect-data-sources` },
  { category: "Data Connectors", label: "CEF via AMA", url: `${ML}/azure/sentinel/connect-cef-ama` },
  { category: "Data Connectors", label: "Data collection rules (AMA)", url: `${ML}/azure/azure-monitor/agents/data-collection-rule-azure-monitor-agent` },

  // Content Hub
  { category: "Content Hub", label: "About Content hub", url: `${ML}/azure/sentinel/sentinel-solutions` },
  { category: "Content Hub", label: "Discover & deploy solutions", url: `${ML}/azure/sentinel/sentinel-solutions-deploy` },
  { category: "Content Hub", label: "CI/CD & repositories", url: `${ML}/azure/sentinel/ci-cd` },

  // RBAC
  { category: "RBAC", label: "Roles and permissions in Sentinel", url: `${ML}/azure/sentinel/roles` },
  { category: "RBAC", label: "Azure RBAC overview", url: `${ML}/azure/role-based-access-control/overview` },
  { category: "RBAC", label: "Privileged Identity Management (PIM)", url: `${ML}/entra/id-governance/privileged-identity-management/pim-configure` },

  // Zero Trust
  { category: "Zero Trust", label: "Zero Trust guidance center", url: `${ML}/security/zero-trust/` },
  { category: "Zero Trust", label: "Zero Trust for Microsoft Sentinel", url: `${ML}/security/zero-trust/integrate/sentinel-solution` },
  { category: "Zero Trust", label: "Conditional Access", url: `${ML}/entra/identity/conditional-access/overview` },
  { category: "Zero Trust", label: "Require MFA for admins (CA)", url: `${ML}/entra/identity/conditional-access/howto-conditional-access-policy-admin-mfa` },

  // Azure Lighthouse
  { category: "Azure Lighthouse", label: "Cross-tenant management", url: `${ML}/azure/lighthouse/concepts/cross-tenant-management-experience` },
  { category: "Azure Lighthouse", label: "Manage Sentinel at scale via Lighthouse", url: `${ML}/azure/sentinel/multiple-workspace-view` },
  { category: "Azure Lighthouse", label: "Onboard a customer to Lighthouse", url: `${ML}/azure/lighthouse/how-to/onboard-customer` },

  // ARM / Bicep / REST
  { category: "ARM / Bicep / REST", label: "Sentinel REST API reference", url: `${ML}/rest/api/securityinsights/` },
  { category: "ARM / Bicep / REST", label: "Bicep overview", url: `${ML}/azure/azure-resource-manager/bicep/overview` },
  { category: "ARM / Bicep / REST", label: "Deploy ARM templates", url: `${ML}/azure/azure-resource-manager/templates/deploy-portal` },
  { category: "ARM / Bicep / REST", label: "Az.SecurityInsights PowerShell", url: `${ML}/powershell/module/az.securityinsights/` },
  { category: "ARM / Bicep / REST", label: "az sentinel CLI reference", url: `${ML}/cli/azure/sentinel` },
];

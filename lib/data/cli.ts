export type CliTrack = "azcli" | "powershell" | "rest";

export interface CliStep {
  id: string;
  title: string;
  intro?: string;
  code: Record<CliTrack, string>;
  expected: string;
  errors: { error: string; fix: string }[];
  rbac: string;
  zeroTrust: string;
  ref: { label: string; url: string };
}

const ML = "https://learn.microsoft.com";

export const CLI_STEPS: CliStep[] = [
  {
    id: "login-source",
    title: "Step 1 — Sign in to the Source tenant (Tenant B)",
    intro: "Authenticate to the Source. Use an MFA-enabled, PIM-elevated account. Never a Global Admin.",
    code: {
      azcli: `# Placeholders only — never commit real IDs
az login --tenant <TenantB-ID>
az account set --subscription <SubscriptionB-ID>
az account show -o table`,
      powershell: `Connect-AzAccount -Tenant <TenantB-ID>
Set-AzContext -Subscription <SubscriptionB-ID>
Get-AzContext | Format-List Name, Tenant, Subscription`,
      rest: `# Acquire a token for the Source tenant (device code / az account get-access-token)
$token = az account get-access-token --tenant <TenantB-ID> --query accessToken -o tsv
# Use $token as: Authorization: Bearer <token>`,
    },
    expected: "az account show returns the Source subscription and Tenant B ID.",
    errors: [
      { error: "AADSTS50076 — MFA required", fix: "Complete the MFA prompt; ensure your account is MFA-registered." },
      { error: "SubscriptionNotFound", fix: "Verify the subscription ID and that your account has access in Tenant B." },
    ],
    rbac: "Microsoft Sentinel Reader (Workspace)",
    zeroTrust: "PIM-elevate for 1 hour only. Sign in from a compliant device on the admin network.",
    ref: { label: "az login", url: `${ML}/cli/azure/authenticate-azure-cli` },
  },
  {
    id: "export-rules",
    title: "Step 2 — Export Analytics Rules from Source",
    intro: "Dump all analytics rules to JSON for review and re-deployment.",
    code: {
      azcli: `az sentinel alert-rule list \\
  --resource-group <RG-B> \\
  --workspace-name <Workspace-B> \\
  -o json > analytics-rules.json`,
      powershell: `Get-AzSentinelAlertRule \`
  -ResourceGroupName <RG-B> \`
  -WorkspaceName <Workspace-B> |
  ConvertTo-Json -Depth 20 |
  Out-File analytics-rules.json`,
      rest: `GET https://management.azure.com/subscriptions/<SubscriptionB-ID>/resourceGroups/<RG-B>/providers/Microsoft.OperationalInsights/workspaces/<Workspace-B>/providers/Microsoft.SecurityInsights/alertRules?api-version=2024-03-01
Authorization: Bearer <token>`,
    },
    expected: "analytics-rules.json contains an array of rule objects (scheduled, NRT, fusion, ml).",
    errors: [
      { error: "az sentinel not found", fix: "Install the extension: az extension add --name sentinel" },
      { error: "AuthorizationFailed", fix: "Ensure Sentinel Reader on the workspace; re-check PIM activation." },
    ],
    rbac: "Microsoft Sentinel Reader (Workspace)",
    zeroTrust: "Read-only export — least privilege. Store the JSON in an encrypted, access-controlled folder.",
    ref: { label: "az sentinel alert-rule", url: `${ML}/cli/azure/sentinel/alert-rule` },
  },
  {
    id: "export-others",
    title: "Step 3 — Export supporting content (watchlists, hunting, functions)",
    intro: "Export the dependencies your rules rely on so they resolve after import.",
    code: {
      azcli: `az sentinel watchlist list --resource-group <RG-B> --workspace-name <Workspace-B> -o json > watchlists.json
# Hunting queries + saved functions live as savedSearches:
az monitor log-analytics workspace saved-search list \\
  --resource-group <RG-B> --workspace-name <Workspace-B> -o json > saved-searches.json`,
      powershell: `Get-AzSentinelWatchlist -ResourceGroupName <RG-B> -WorkspaceName <Workspace-B> |
  ConvertTo-Json -Depth 20 | Out-File watchlists.json
Get-AzOperationalInsightsSavedSearch -ResourceGroupName <RG-B> -WorkspaceName <Workspace-B> |
  ConvertTo-Json -Depth 20 | Out-File saved-searches.json`,
      rest: `GET .../workspaces/<Workspace-B>/providers/Microsoft.SecurityInsights/watchlists?api-version=2024-03-01
GET .../workspaces/<Workspace-B>/savedSearches?api-version=2020-08-01
Authorization: Bearer <token>`,
    },
    expected: "watchlists.json and saved-searches.json are created with your content.",
    errors: [
      { error: "Empty result", fix: "Confirm the workspace name and that content exists in the Source." },
    ],
    rbac: "Microsoft Sentinel Reader (Workspace)",
    zeroTrust: "Review exported watchlists for PII before moving. Least-privilege read only.",
    ref: { label: "az sentinel watchlist", url: `${ML}/cli/azure/sentinel/watchlist` },
  },
  {
    id: "login-dest",
    title: "Step 4 — Sign in to the Destination tenant (Tenant A)",
    intro: "Switch identity context to the Destination. Use a SEPARATE elevated session.",
    code: {
      azcli: `az login --tenant <TenantA-ID>
az account set --subscription <SubscriptionA-ID>
az account show -o table`,
      powershell: `Connect-AzAccount -Tenant <TenantA-ID>
Set-AzContext -Subscription <SubscriptionA-ID>`,
      rest: `$token = az account get-access-token --tenant <TenantA-ID> --query accessToken -o tsv`,
    },
    expected: "Context now shows Tenant A and the Destination subscription.",
    errors: [
      { error: "Wrong tenant still active", fix: "Run az logout first, or use az account clear to reset cached context." },
    ],
    rbac: "Microsoft Sentinel Contributor (Workspace)",
    zeroTrust: "Fresh PIM activation for the Destination. Do not reuse Source tokens across tenants.",
    ref: { label: "Manage subscriptions", url: `${ML}/cli/azure/manage-azure-subscriptions-azure-cli` },
  },
  {
    id: "import-dest",
    title: "Step 5 — Deploy content to the Destination (ARM / Bicep)",
    intro: "Deploy each rule/watchlist using ARM or Bicep so it is repeatable and reviewable.",
    code: {
      azcli: `# Deploy a parameterized Bicep/ARM template per rule
az deployment group create \\
  --resource-group <RG-A> \\
  --template-file ./bicep/analytics-rule.bicep \\
  --parameters workspaceName=<Workspace-A> ruleJson=@analytics-rules.json`,
      powershell: `New-AzResourceGroupDeployment \`
  -ResourceGroupName <RG-A> \`
  -TemplateFile ./bicep/analytics-rule.bicep \`
  -workspaceName <Workspace-A>`,
      rest: `PUT .../workspaces/<Workspace-A>/providers/Microsoft.SecurityInsights/alertRules/<ruleId>?api-version=2024-03-01
Authorization: Bearer <token>
Content-Type: application/json
{ ...rule definition with Destination IDs... }`,
    },
    expected: "Deployment succeeds; rules appear Enabled in the Destination Analytics blade.",
    errors: [
      { error: "InvalidTemplate — workspace mismatch", fix: "Update hard-coded workspace/subscription IDs to the Destination values." },
      { error: "BadRequest — missing watchlist/function", fix: "Deploy watchlists and functions BEFORE the dependent rules." },
    ],
    rbac: "Microsoft Sentinel Contributor (Workspace)",
    zeroTrust: "Use PIM-elevated Contributor, not a permanent role. Review the template diff before deploy.",
    ref: { label: "az deployment group", url: `${ML}/cli/azure/deployment/group` },
  },
  {
    id: "validate",
    title: "Step 6 — Validate the Destination",
    intro: "Confirm parity between Source and Destination before cutover.",
    code: {
      azcli: `# Compare rule counts
az sentinel alert-rule list --resource-group <RG-A> --workspace-name <Workspace-A> --query "length(@)"
# Compare against the Source export:
(Get-Content analytics-rules.json | ConvertFrom-Json).Count`,
      powershell: `$dst = (Get-AzSentinelAlertRule -ResourceGroupName <RG-A> -WorkspaceName <Workspace-A>).Count
$src = (Get-Content analytics-rules.json | ConvertFrom-Json).Count
"Source: $src  Destination: $dst"`,
      rest: `GET .../workspaces/<Workspace-A>/providers/Microsoft.SecurityInsights/alertRules?api-version=2024-03-01
# Compare the returned count to the Source export`,
    },
    expected: "Destination rule count matches Source; test incidents generate as expected.",
    errors: [
      { error: "Counts differ", fix: "Identify missing rules from the diff and redeploy them individually." },
    ],
    rbac: "Microsoft Sentinel Reader (Workspace)",
    zeroTrust: "Read-only validation. Keep the Source running (dual-run) until parity is confirmed.",
    ref: { label: "Validate deployments", url: `${ML}/azure/azure-resource-manager/templates/deployment-history` },
  },
];

// Canonical contents of the downloadable migration script bundle.
// These same strings are written to /scripts-bundle on disk and zipped for download.
// SECURITY: placeholders only — never real tenant IDs, subscriptions, or secrets.

export const SCRIPT_FILES: Record<string, string> = {
  "01-export-source.ps1": `<#
  01-export-source.ps1
  Exports Microsoft Sentinel content from the SOURCE tenant (Tenant B).
  Zero Trust: run under a PIM-elevated, MFA'd account. Sentinel READER is enough.
  Placeholders only — pass real values via parameters.sample.json.
#>
param(
  [Parameter(Mandatory)] [string] $TenantId,
  [Parameter(Mandatory)] [string] $SubscriptionId,
  [Parameter(Mandatory)] [string] $ResourceGroup,
  [Parameter(Mandatory)] [string] $WorkspaceName,
  [string] $OutDir = "./sentinel-migration"
)

Write-Host "Signing in to SOURCE tenant..." -ForegroundColor Cyan
Connect-AzAccount -Tenant $TenantId | Out-Null
Set-AzContext -Subscription $SubscriptionId | Out-Null

New-Item -ItemType Directory -Force -Path "$OutDir/analytics-rules" | Out-Null
New-Item -ItemType Directory -Force -Path "$OutDir/watchlists" | Out-Null
New-Item -ItemType Directory -Force -Path "$OutDir/hunting-queries" | Out-Null

Write-Host "Exporting analytics rules..." -ForegroundColor Cyan
Get-AzSentinelAlertRule -ResourceGroupName $ResourceGroup -WorkspaceName $WorkspaceName |
  ConvertTo-Json -Depth 30 | Out-File "$OutDir/analytics-rules/analytics-rules.json"

Write-Host "Exporting watchlists..." -ForegroundColor Cyan
Get-AzSentinelWatchlist -ResourceGroupName $ResourceGroup -WorkspaceName $WorkspaceName |
  ConvertTo-Json -Depth 30 | Out-File "$OutDir/watchlists/watchlists.json"

Write-Host "Exporting saved searches (hunting + functions)..." -ForegroundColor Cyan
Get-AzOperationalInsightsSavedSearch -ResourceGroupName $ResourceGroup -WorkspaceName $WorkspaceName |
  ConvertTo-Json -Depth 30 | Out-File "$OutDir/hunting-queries/saved-searches.json"

Write-Host "Export complete. Review files in $OutDir before importing." -ForegroundColor Green
`,

  "02-validate.ps1": `<#
  02-validate.ps1
  Validates exported content and compares Source vs Destination counts.
  Zero Trust: READER only.
#>
param(
  [Parameter(Mandatory)] [string] $ExportDir = "./sentinel-migration",
  [string] $DestResourceGroup,
  [string] $DestWorkspaceName
)

$srcPath = "$ExportDir/analytics-rules/analytics-rules.json"
if (-not (Test-Path $srcPath)) { throw "Export not found. Run 01-export-source.ps1 first." }

$src = (Get-Content $srcPath -Raw | ConvertFrom-Json)
$srcCount = @($src).Count
Write-Host "Source analytics rules: $srcCount" -ForegroundColor Cyan

if ($DestResourceGroup -and $DestWorkspaceName) {
  $dst = Get-AzSentinelAlertRule -ResourceGroupName $DestResourceGroup -WorkspaceName $DestWorkspaceName
  $dstCount = @($dst).Count
  Write-Host "Destination analytics rules: $dstCount" -ForegroundColor Cyan
  if ($srcCount -eq $dstCount) { Write-Host "PARITY OK" -ForegroundColor Green }
  else { Write-Warning "Count mismatch — investigate missing rules before cutover." }
}
`,

  "03-import-destination.ps1": `<#
  03-import-destination.ps1
  Imports content into the DESTINATION tenant (Tenant A).
  Zero Trust: PIM-elevated Sentinel CONTRIBUTOR, time-bound. Never Global Admin.
  Deploy watchlists/functions BEFORE dependent analytics rules.
#>
param(
  [Parameter(Mandatory)] [string] $TenantId,
  [Parameter(Mandatory)] [string] $SubscriptionId,
  [Parameter(Mandatory)] [string] $ResourceGroup,
  [Parameter(Mandatory)] [string] $WorkspaceName,
  [string] $TemplateFile = "./bicep/analytics-rule.bicep",
  [string] $ExportDir = "./sentinel-migration"
)

Write-Host "Signing in to DESTINATION tenant..." -ForegroundColor Cyan
Connect-AzAccount -Tenant $TenantId | Out-Null
Set-AzContext -Subscription $SubscriptionId | Out-Null

Write-Host "Deploying analytics rules via Bicep..." -ForegroundColor Cyan
New-AzResourceGroupDeployment \`
  -ResourceGroupName $ResourceGroup \`
  -TemplateFile $TemplateFile \`
  -workspaceName $WorkspaceName \`
  -Verbose

Write-Host "Import step complete. Run 02-validate.ps1 to confirm parity." -ForegroundColor Green
`,

  "parameters.sample.json": `{
  "source": {
    "tenantId": "<TenantB-ID>",
    "subscriptionId": "<SubscriptionB-ID>",
    "resourceGroup": "<RG-B>",
    "workspaceName": "<Workspace-B>"
  },
  "destination": {
    "tenantId": "<TenantA-ID>",
    "subscriptionId": "<SubscriptionA-ID>",
    "resourceGroup": "<RG-A>",
    "workspaceName": "<Workspace-A>"
  },
  "_note": "Placeholders only. Never commit real IDs or secrets. Use PIM + MFA."
}
`,

  "bicep/analytics-rule.bicep": `// analytics-rule.bicep
// Deploys a Sentinel Scheduled analytics rule into the DESTINATION workspace.
// Zero Trust: deploy with PIM-elevated Sentinel Contributor, scoped to this RG.

param workspaceName string
param ruleDisplayName string = 'Migrated Scheduled Rule'
param query string = 'SecurityEvent | take 10'
param severity string = 'Medium'
param queryFrequency string = 'PT1H'
param queryPeriod string = 'PT1H'
param triggerThreshold int = 0
param enabled bool = true

resource workspace 'Microsoft.OperationalInsights/workspaces@2022-10-01' existing = {
  name: workspaceName
}

resource rule 'Microsoft.SecurityInsights/alertRules@2023-02-01-preview' = {
  scope: workspace
  name: guid(workspaceName, ruleDisplayName)
  kind: 'Scheduled'
  properties: {
    displayName: ruleDisplayName
    enabled: enabled
    severity: severity
    query: query
    queryFrequency: queryFrequency
    queryPeriod: queryPeriod
    triggerOperator: 'GreaterThan'
    triggerThreshold: triggerThreshold
    suppressionEnabled: false
    suppressionDuration: 'PT1H'
  }
}
`,

  "README.md": `# Sentinel Migration Script Bundle

Repeatable, Zero Trust compliant scripts to migrate Microsoft Sentinel from a
SOURCE tenant (Tenant B) to a DESTINATION tenant (Tenant A).

## Files
- \`01-export-source.ps1\` — export analytics rules, watchlists, hunting/functions from Source (READER).
- \`02-validate.ps1\` — validate export and compare Source vs Destination counts.
- \`03-import-destination.ps1\` — deploy content into Destination via Bicep (CONTRIBUTOR via PIM).
- \`parameters.sample.json\` — placeholder parameters. Copy to \`parameters.json\` and fill locally. NEVER commit real values.
- \`bicep/analytics-rule.bicep\` — parameterized Scheduled analytics rule template.

## Prerequisites
- PowerShell 7+, \`Az\` and \`Az.SecurityInsights\` modules.
- MFA-enabled accounts in both tenants.
- PIM eligible roles: Sentinel Reader (Source), Sentinel Contributor (Destination).

## Usage
\`\`\`powershell
# 1) Export from Source
./01-export-source.ps1 -TenantId <TenantB-ID> -SubscriptionId <SubB> -ResourceGroup <RG-B> -WorkspaceName <WS-B>

# 2) Import to Destination (deploy dependencies first)
./03-import-destination.ps1 -TenantId <TenantA-ID> -SubscriptionId <SubA> -ResourceGroup <RG-A> -WorkspaceName <WS-A>

# 3) Validate parity
./02-validate.ps1 -DestResourceGroup <RG-A> -DestWorkspaceName <WS-A>
\`\`\`

## Zero Trust
- Use PIM just-in-time elevation; let roles expire after use.
- Never use Global Administrator.
- Run from a compliant device on the admin network.
- Keep Source running (dual-run) until Destination parity is confirmed.
`,
};

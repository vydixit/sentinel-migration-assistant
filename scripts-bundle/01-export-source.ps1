<#
  01-export-source.ps1
  Exports Microsoft Sentinel content from the SOURCE tenant (Tenant B).
  Zero Trust: run under a PIM-elevated, MFA'd account. Sentinel READER is enough.
  Placeholders only — pass real values via parameters.json (never commit real IDs).
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

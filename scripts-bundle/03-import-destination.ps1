<#
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
  [string] $TemplateFile = "./bicep/analytics-rule.bicep"
)

Write-Host "Signing in to DESTINATION tenant..." -ForegroundColor Cyan
Connect-AzAccount -Tenant $TenantId | Out-Null
Set-AzContext -Subscription $SubscriptionId | Out-Null

Write-Host "Deploying analytics rules via Bicep..." -ForegroundColor Cyan
New-AzResourceGroupDeployment `
  -ResourceGroupName $ResourceGroup `
  -TemplateFile $TemplateFile `
  -workspaceName $WorkspaceName `
  -Verbose

Write-Host "Import step complete. Run 02-validate.ps1 to confirm parity." -ForegroundColor Green

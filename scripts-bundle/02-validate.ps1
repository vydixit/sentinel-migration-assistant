<#
  02-validate.ps1
  Validates exported content and compares Source vs Destination counts.
  Zero Trust: READER only.
#>
param(
  [string] $ExportDir = "./sentinel-migration",
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

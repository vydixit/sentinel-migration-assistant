# Sentinel Migration Script Bundle

Repeatable, Zero Trust compliant scripts to migrate Microsoft Sentinel from a
SOURCE tenant (Tenant B) to a DESTINATION tenant (Tenant A).

## Files
- `01-export-source.ps1` — export analytics rules, watchlists, hunting/functions from Source (READER).
- `02-validate.ps1` — validate export and compare Source vs Destination counts.
- `03-import-destination.ps1` — deploy content into Destination via Bicep (CONTRIBUTOR via PIM).
- `parameters.sample.json` — placeholder parameters. Copy to `parameters.json` and fill locally. NEVER commit real values.
- `bicep/analytics-rule.bicep` — parameterized Scheduled analytics rule template.

## Prerequisites
- PowerShell 7+, `Az` and `Az.SecurityInsights` modules.
- MFA-enabled accounts in both tenants.
- PIM eligible roles: Sentinel Reader (Source), Sentinel Contributor (Destination).

## Usage
```powershell
# 1) Export from Source
./01-export-source.ps1 -TenantId <TenantB-ID> -SubscriptionId <SubB> -ResourceGroup <RG-B> -WorkspaceName <WS-B>

# 2) Import to Destination (deploy dependencies first)
./03-import-destination.ps1 -TenantId <TenantA-ID> -SubscriptionId <SubA> -ResourceGroup <RG-A> -WorkspaceName <WS-A>

# 3) Validate parity
./02-validate.ps1 -DestResourceGroup <RG-A> -DestWorkspaceName <WS-A>
```

## Zero Trust
- Use PIM just-in-time elevation; let roles expire after use.
- Never use Global Administrator.
- Run from a compliant device on the admin network.
- Keep Source running (dual-run) until Destination parity is confirmed.

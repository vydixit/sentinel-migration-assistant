// analytics-rule.bicep
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

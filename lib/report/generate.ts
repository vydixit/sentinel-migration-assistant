"use client";

import jsPDF from "jspdf";
import { download } from "../utils";
import { MigrationState, PHASE_LABELS, PHASES } from "../schema";
import { COMPONENTS } from "../data/components";
import { LIMITATIONS } from "../data/limitations";

function componentPct(state: MigrationState, id: string): number {
  const def = COMPONENTS.find((c) => c.id === id);
  if (!def) return 0;
  const total = def.exportSteps.length + def.importSteps.length + def.validationSteps.length;
  const comp = state.components[id];
  if (!comp || total === 0) return 0;
  const done = Object.values(comp.steps).filter((x) => x.done).length;
  return Math.round((done / total) * 100);
}

function overall(state: MigrationState): number {
  if (COMPONENTS.length === 0) return 0;
  const sum = COMPONENTS.reduce((a, c) => a + componentPct(state, c.id), 0);
  return Math.round(sum / COMPONENTS.length);
}

// Sensitive values are labels only; still redact anything that looks like a GUID.
function redact(text: string): string {
  return text.replace(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
    "<redacted-guid>"
  );
}

const ts = () => new Date().toISOString().replace(/[:.]/g, "-");

// ---------- JSON migration log ----------
export function exportJson(state: MigrationState) {
  const payload = { ...state, generatedAt: new Date().toISOString(), overallProgress: overall(state) };
  download(`sma-migration-log-${ts()}.json`, JSON.stringify(payload, null, 2), "application/json");
}

// ---------- Executive Summary (PDF) ----------
export function exportExecutivePdf(state: MigrationState) {
  const doc = new jsPDF();
  const pct = overall(state);
  let y = 18;
  doc.setFontSize(18);
  doc.text("Sentinel Migration — Executive Summary", 14, y);
  y += 8;
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, y);
  y += 10;
  doc.setTextColor(20);
  doc.setFontSize(12);
  doc.text(`Source: ${redact(state.tenants.sourceLabel)}`, 14, y); y += 6;
  doc.text(`Destination: ${redact(state.tenants.destinationLabel)}`, 14, y); y += 6;
  doc.text(`Migration mode: ${state.mode ?? "not selected"}`, 14, y); y += 6;
  doc.text(`Overall completion: ${pct}%`, 14, y); y += 10;

  doc.setFontSize(13);
  doc.text("Component status", 14, y); y += 7;
  doc.setFontSize(10);
  COMPONENTS.forEach((c) => {
    const st = state.components[c.id]?.status ?? "not_started";
    doc.text(`• ${c.name}: ${st.replace("_", " ")} (${componentPct(state, c.id)}%)`, 16, y);
    y += 5.5;
    if (y > 275) { doc.addPage(); y = 18; }
  });

  y += 4;
  if (y > 250) { doc.addPage(); y = 18; }
  doc.setFontSize(13);
  doc.text("Key risks", 14, y); y += 7;
  doc.setFontSize(9);
  ["Detection gap during cutover — run Source + Destination in parallel until parity is confirmed.",
   "Connectors, tokens and managed identities do not migrate — plan re-onboarding time.",
   "UEBA baselines re-train over 7-14 days — expect temporary anomaly noise."].forEach((r) => {
    const lines = doc.splitTextToSize(`• ${r}`, 180);
    doc.text(lines, 16, y); y += lines.length * 5;
  });

  doc.save(`sma-executive-summary-${ts()}.pdf`);
}

// ---------- Technical Migration Plan (HTML/DOCX-compatible) ----------
export function exportTechnicalDoc(state: MigrationState) {
  const rows = COMPONENTS.map((c) => {
    const comp = state.components[c.id];
    const st = comp?.status ?? "not_started";
    const blocker = comp?.blocker ? ` — Blocker: ${redact(comp.blocker)}` : "";
    return `<tr><td>${c.name}</td><td>${c.category}</td><td>${st.replace("_", " ")}</td><td>${componentPct(state, c.id)}%${blocker}</td></tr>`;
  }).join("");

  const phaseRows = PHASES.map((p) => `<tr><td>${PHASE_LABELS[p]}</td><td>${state.phases[p].status.replace("_", " ")}</td></tr>`).join("");

  const compSections = COMPONENTS.map((c) => `
    <h3>${c.name}</h3>
    <p><b>What:</b> ${c.whatIsIt}</p>
    <p><b>Why:</b> ${c.whyMigrate}</p>
    <p><b>Permissions:</b> ${c.permissions.join("; ")}</p>
    ${c.cliReconfig ? `<p style="color:#b45309"><b>Reconfiguration required:</b> ${c.cliReconfig}</p>` : ""}
    <p><b>Rollback:</b> ${c.rollback}</p>
  `).join("");

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Technical Migration Plan</title>
  <style>body{font-family:Segoe UI,Arial,sans-serif;margin:32px;color:#111}h1{color:#0b5cad}
  table{border-collapse:collapse;width:100%;margin:12px 0}td,th{border:1px solid #ccc;padding:6px;font-size:13px;text-align:left}
  th{background:#eef4fb}h3{color:#0b5cad;margin-top:20px}</style></head><body>
  <h1>Sentinel Migration — Technical Plan</h1>
  <p>Generated: ${new Date().toLocaleString()}</p>
  <p>Source: ${redact(state.tenants.sourceLabel)} &rarr; Destination: ${redact(state.tenants.destinationLabel)}</p>
  <p>Mode: ${state.mode ?? "not selected"} | Overall completion: <b>${overall(state)}%</b></p>
  <h2>Phase status</h2><table><tr><th>Phase</th><th>Status</th></tr>${phaseRows}</table>
  <h2>Component status</h2><table><tr><th>Component</th><th>Category</th><th>Status</th><th>Progress</th></tr>${rows}</table>
  <h2>Component detail</h2>${compSections}
  <p style="margin-top:24px;color:#666;font-size:12px">Zero Trust: least-privilege PIM roles, MFA, compliant device, and audit logging apply to every step. No tenant IDs or secrets are stored by this tool.</p>
  </body></html>`;

  download(`sma-technical-plan-${ts()}.doc`, html, "application/msword");
}

// ---------- Security & Zero Trust Report (PDF) ----------
export function exportSecurityPdf(state: MigrationState) {
  const doc = new jsPDF();
  let y = 18;
  doc.setFontSize(18);
  doc.text("Security & Zero Trust Report", 14, y); y += 8;
  doc.setFontSize(10); doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleString()} — for CISO / audit`, 14, y); y += 10;
  doc.setTextColor(20);

  doc.setFontSize(13); doc.text("Zero Trust controls applied", 14, y); y += 7;
  doc.setFontSize(9);
  ["Identity: MFA enforced; PIM just-in-time elevation; NO Global Administrator used.",
   "Least privilege: Sentinel Reader for export, Contributor for import, scoped to workspace/RG.",
   "Time-bound: privileged roles activated for short windows and expired after use.",
   "Device & network: compliant device + admin workstation IP restriction.",
   "Audit: Azure Activity + Sentinel diagnostic logs enabled in both tenants.",
   "Secrets: this tool stores NO tenant IDs, tokens, or credentials; reports redact GUIDs."].forEach((r) => {
    const lines = doc.splitTextToSize(`• ${r}`, 180);
    doc.text(lines, 16, y); y += lines.length * 5 + 1;
  });

  y += 4;
  doc.setFontSize(13); doc.text("Known limitations (data handling)", 14, y); y += 7;
  doc.setFontSize(9);
  LIMITATIONS.forEach((l) => {
    const lines = doc.splitTextToSize(`• ${l.title} — ${l.detail}`, 180);
    doc.text(lines, 16, y); y += lines.length * 5 + 1;
    if (y > 275) { doc.addPage(); y = 18; }
  });

  doc.save(`sma-security-zerotrust-${ts()}.pdf`);
}

export function exportAllHtml(state: MigrationState) {
  // Simple combined HTML snapshot
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>SMA Report</title></head>
  <body style="font-family:Segoe UI,Arial;margin:32px">
  <h1>Sentinel Migration Assistant — Snapshot</h1>
  <pre>${JSON.stringify({ ...state, overall: overall(state) }, null, 2)}</pre>
  </body></html>`;
  download(`sma-snapshot-${ts()}.html`, html, "text/html");
}

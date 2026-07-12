# Sentinel Migration Assistant (SMA)

A production-grade, **Zero Trust compliant** web application that guides a security admin
through migrating **Microsoft Sentinel** from **Tenant B (Source)** to **Tenant A (Destination)** —
either via a **Manual guided walkthrough** or a **CLI-driven semi-automated** migration.

> This is a **real interactive app** — routing, persisted state, forms, validation, progress
> tracking and exportable reports — not a documentation site. It stores **no tenant IDs,
> secrets, or credentials**. All CLI examples use placeholders.

## Features
| # | Feature | Route |
|---|---------|-------|
| 🏠 | README / Welcome (landing) | `/` |
| 🧭 | Migration option chooser (Manual / CLI / Hybrid) | `/choose` |
| 📋 | Readiness Assessment | `/assessment` |
| 🧑‍💻 | Manual Migration (per-component guided walkthroughs) | `/manual`, `/manual/[component]` |
| ⚙️ | CLI Migration (Azure CLI / PowerShell / REST tabs + script bundle) | `/cli` |
| 🔐 | Permissions & RBAC Matrix (search + filter) | `/rbac` |
| 🛡️ | Zero Trust Validation | `/zero-trust` |
| 📊 | Migration Tracker (dashboard + log export) | `/tracker` |
| 🏗️ | Reference Architecture (Mermaid diagrams) | `/architecture` |
| 📚 | Microsoft Documentation Hub | `/docs` |
| ⚠️ | Known Limitations | `/limitations` |
| 📤 | Exportable Reports (PDF / DOCX / HTML / JSON) | `/report` |

Every manual & CLI step shows a **Zero Trust panel** (identity, least privilege, time-bound,
device, network, audit), a **required-permission chip**, and a **Microsoft Learn** reference.

## Tech stack
- **Next.js 14** (App Router) + **TypeScript**
- **TailwindCSS** + shadcn-style UI components
- **Framer Motion** (micro-interactions) + **Lucide** icons
- **Zustand** (persisted migration state in `localStorage`)
- **Mermaid** (architecture diagrams)
- **jsPDF** + **JSZip** (report + script-bundle generation)
- Dark-first, light/dark toggle, responsive, collapsible sidebar

## Migrated components
Analytics Rules (Scheduled/NRT/Fusion/ML), Automation Rules, Playbooks (Logic Apps),
Watchlists, Workbooks, Hunting Queries, Data Connectors, UEBA, Content Hub Solutions,
Incident Settings, Custom KQL Functions/Parsers.

## Getting started
```bash
npm install
npm run dev       # http://localhost:3000
```

### Run in GitHub Codespaces (on demand)
This repo ships a dev container (`.devcontainer/devcontainer.json`).
1. On the GitHub repo page click **Code ▸ Codespaces ▸ Create codespace on main**.
2. The container runs `npm install`, then auto-starts `npm run dev`.
3. When port **3000** is forwarded, the app preview opens automatically (or open the
   forwarded URL from the **Ports** tab). Stop the codespace when done — it only runs on demand.

Build & run production:
```bash
npm run build
npm run start
```

Run in Docker:
```bash
docker build -t sma .
docker run -p 3000:3000 sma
```

## Project structure
```
sentinel-migration-assistant/
├── app/                      # Next.js App Router pages
│   ├── page.tsx              # README / landing
│   ├── choose/ assessment/ manual/ cli/ rbac/
│   ├── zero-trust/ tracker/ architecture/ docs/ limitations/ report/
├── components/               # Sidebar, shell, step-item, zero-trust-panel, command-block, mermaid, ui/
├── lib/
│   ├── schema.ts             # Migration state model + JSON schema
│   ├── store.ts              # Zustand persisted store
│   ├── data/                 # components, rbac, docs, limitations, assessment, cli, scripts
│   ├── report/generate.ts    # PDF / DOCX / HTML / JSON exporters
│   └── bundle.ts             # .zip script bundle generator
├── scripts-bundle/           # PowerShell + Bicep migration scripts (also downloadable in-app)
├── Dockerfile
├── DEPLOYMENT.md
└── README.md
```

## Security
- No tenant IDs, secrets, or tokens are ever stored — only friendly labels.
- All CLI examples use placeholders (`<TenantB-ID>`, `<Workspace-A>`).
- Reports redact anything resembling a GUID.
- Entra ID OAuth login for future authenticated features is stubbed (not wired to real creds).
- Zero Trust guidance (MFA + PIM + least privilege) is enforced throughout; Global Admin is never used.

## Data model
Persisted `MigrationState` (see `lib/schema.ts`) tracks per-component status & step completion,
per-phase status, assessment and prerequisite checklists, and friendly Source/Destination labels.
The JSON export conforms to the draft-07 schema in `MIGRATION_JSON_SCHEMA`.

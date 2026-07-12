# Deployment Guide

The Sentinel Migration Assistant is a standard Next.js 14 app. It runs fully client-side
(state is persisted in the browser `localStorage`) so it deploys anywhere Next.js runs.

## Option A — Azure Static Web Apps (recommended for a static, low-cost host)
1. Push this folder to a GitHub repo.
2. In the Azure portal, create a **Static Web App**.
3. Build settings:
   - App location: `/`
   - Output location: `.next`
   - Build command: `npm run build`
4. Add the SWA GitHub Actions workflow (auto-generated). For hybrid Next.js features, ensure
   the **Next.js** deployment configuration is selected.
5. Deploy — every push to `main` publishes automatically.

> Note: This app has no server-side data dependencies, so it also works as a pure static export
> if you add `output: 'export'` to `next.config.js` (Mermaid/PDF/ZIP all run in the browser).

## Option B — Azure App Service (Node)
1. Create an **App Service** (Linux, Node 20 LTS).
2. Configure a deployment source (GitHub Actions / Azure DevOps).
3. Startup command:
   ```
   npm install && npm run build && npm run start
   ```
4. Set `WEBSITES_PORT=3000` in Application Settings.

## Option C — Docker / Container Apps
```bash
docker build -t sma .
docker run -p 3000:3000 sma
```
Push the image to Azure Container Registry and deploy to **Azure Container Apps** or **App Service for Containers**.

## Zero Trust hardening for the hosting environment
- Front the app with **Entra ID** authentication (App Service Easy Auth / SWA auth) once the
  OAuth stub is wired to real sign-in.
- Enforce **Conditional Access** (MFA + compliant device) on the app registration.
- Restrict inbound access via **Private Endpoint** or IP allow-list to admin networks.
- Enable **diagnostic logging** and send to a monitoring workspace.
- Because the app stores no secrets, no Key Vault integration is required for the app itself.

## Environment variables
None required. The app intentionally holds no secrets or tenant configuration.

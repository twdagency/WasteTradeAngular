# WasteTrade Backend

This backend uses pnpm 10 as the standardized package manager across local development, Docker, and CI/CD.

## Package Manager Policy

- Required: `pnpm@10.0.0` via Corepack.
- Node versions supported: `18`, `20`, `22`.
- Lockfile: `pnpm-lock.yaml` (use frozen-lockfile install).

## Quick Start (Windows / PowerShell)

1. Ensure Node is installed (`20` or `22`).
2. Enable Corepack:
   - `corepack enable pnpm`
3. Install dependencies:
   - `pnpm install`
4. Run development:
   - `pnpm dev`

Notes:
- Do not chain commands with `&&`; run them on separate lines.
- Use the provided scripts in `package.json` (e.g., `pnpm build`, `pnpm migrate`).

## Common Commands

- Install deps: `pnpm install`
- Build: `pnpm build`
- Dev start: `pnpm dev`
- Migrate DB: `pnpm migrate`
- Lint: `pnpm lint`
- Format: `pnpm format`

## Salesforce Scripts

Utility scripts for managing Salesforce integration (`scripts/` directory):

```bash
pnpm sf:deploy-apex      # Deploy/redeploy Apex classes and triggers
pnpm sf:export-fields     # Export field configs to markdown + TypeScript
pnpm sf:generate-ts       # Generate TS field constants from docs (offline)
pnpm sf:setup-fields      # Create missing custom fields + verify webhooks
```

See `scripts/README.md` for detailed usage, environment variables, and troubleshooting.

## CI/CD Guidance (pnpm 10)

- Use Corepack to pin pnpm:
  - `corepack enable pnpm`
  - `corepack prepare pnpm@10.0.0 --activate`
- Install with lockfile enforcement:
  - `pnpm install --frozen-lockfile`
- Cache:
  - Cache pnpm store (`~/.pnpm-store` or `PNPM_HOME`) to speed installs.
- Build & migrate:
  - `pnpm build`
  - `node ./dist/migrate` (or `pnpm migrate:ci` in Docker Compose)

## Docker Notes

- The Dockerfile already uses Corepack to activate pnpm 10 and runs `pnpm install --frozen-lockfile`, followed by `pnpm build`.
- See `docker-compose.yml` for migration service and runtime commands.

## Test Plan (Do Not Run Tests Here)

Use this plan to validate installation and build without changing functionality:

1. Clean install on a fresh machine:
   - `corepack enable pnpm`
   - `pnpm install`
2. Compile:
   - `pnpm build` (ensures TypeScript compiles, outputs `dist/`).
3. Start dev:
   - `pnpm dev` (nodemon loads with watch on `src/`).
4. Docker build:
   - `docker build -t backend .`
   - Confirm `pnpm install --frozen-lockfile` and `pnpm build` succeed in the container.
5. Migration flow:
   - `pnpm migrate:ci` in container (via compose) or `node ./dist/migrate` locally after build.
6. Smoke endpoints:
   - Hit ping and selected docs endpoints to confirm server starts.

If issues arise, use `npx kill-port 3000` before restarting dev server.


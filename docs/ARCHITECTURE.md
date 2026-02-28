# Architecture

This doc gives you a technical overview of the monorepo: how it’s structured, what each app and lib does, how data flows, and how packages depend on each other.

---

## Monorepo layout

- **apps/api** — Express REST API for the dashboard, providers, incidents, and CRUD.
- **apps/dashboard** — Angular SPA (the dashboard app lives inside a nested dashboard project).
- **apps/worker** — Node process that runs HTTP checks and incident detection.
- **libs/db** — Prisma client singleton used for shared DB access.
- **libs/contracts** — Shared TypeScript types (e.g. dashboard row shape).
- **prisma** — Schema (MySQL), seed script, and migrations.

We use pnpm with workspaces. The root package.json wires up Vitest, Prisma, and Angular CLI.

---

## Apps

- **api** — Serves dashboard rows, provider detail, latency history, incidents, and API Management CRUD. Built with Express, Prisma (via @tower/db), and TypeScript.
- **dashboard** — SPA with the main provider table (filters, sort, expandable rows), provider detail page, incident history, and API Management. Built with Angular 17, Tailwind, and Chart.js.
- **worker** — Runs in the background: loads enabled endpoints, runs HTTP checks, saves results, and evaluates incidents per provider every 60 seconds. Uses Node, Axios, and Prisma via @tower/db.

---

## Libs

- **@tower/db** — Prisma client. The index loads DATABASE_URL from prisma/.env; client.ts is used directly by the worker and API.
- **contracts** — Shared interfaces (e.g. ProviderDashboardRow) used across the monorepo.

---

## Data flow

1. The worker loads enabled endpoints, runs an HTTP check for each, writes CheckResult, then runs incident logic per provider (open or close IncidentEvent).
2. The API reads from Prisma. The dashboard service aggregates providers, endpoints, checks, and incidents into rows; other services serve or modify incidents, providers, check results, and API Management data.
3. The dashboard calls the API and renders the data; filters and CRUD actions are sent back to the API.

---

## Package dependencies

- **api** — express, @prisma/client, @tower/db.
- **worker** — axios, @prisma/client, @tower/db.
- **dashboard** — Angular, chart.js, rxjs (it talks to the API only; no direct DB).
- **libs/db** — @prisma/client; uses the Prisma schema and DATABASE_URL.

---

## Database (Prisma / MySQL)

- **Provider** — id, slug (unique), name, logoUrl.
- **Endpoint** — providerId, url, method, region, isEnabled, description; deleting a provider cascades to its endpoints.
- **CheckResult** — endpointId, status (UP/DOWN/TIMEOUT/ERROR), httpStatus, latencyMs, responseSizeBytes, checkedAt, region; append-only.
- **IncidentEvent** — providerId, startAt, endAt (null when still open), type (DOWN/SLOW/ERROR), message.

---

## Diagrams (PlantUML)

The source files live in `docs/diagrams/`. You can generate images with any PlantUML renderer or CLI.

- **database.puml** — Entity-relationship: Provider, Endpoint, CheckResult, IncidentEvent and how they relate.
- **architecture.puml** — High-level view: Dashboard, API, Worker, MySQL, and external APIs.
- **sequence.puml** — Two scenarios: user opens the dashboard (GET /dashboard) and a worker tick (HTTP check, write CheckResult, evaluate incidents).
- **components.puml** — Monorepo packages and their dependencies.
- **api-flows.puml** — Main API routes used by the client.
- **incident-state.puml** — How incidents move from open to closed per provider.

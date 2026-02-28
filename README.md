# Tower API Monitoring

Monitor external APIs, track uptime and latency, and see incidents in one place. You get a real-time dashboard, a backend API, and a worker that runs HTTP checks and keeps everything up to date.

**Who it's for:** Teams that want a simple, self-hosted way to watch multiple API providers and react when something goes down or gets slow.

**Stack:** Angular 17 (dashboard), Express (API), Node (worker), Prisma, MySQL. Monorepo with pnpm workspaces.

---

## Screenshots (UI)

**Dashboard**

<img src="screenshots/dashboard.png" alt="Dashboard" width="100%">

**API monitored opened** (dashboard with provider row expanded)

<img src="screenshots/API Opened.png" alt="API monitored opened" width="100%">

**Provider detail**

<img src="screenshots/provider.png" alt="Provider detail" width="100%">

**Incidents**

<img src="screenshots/incidents.png" alt="Incidents" width="100%">

**API Management (list)**

<img src="screenshots/API Management.png" alt="API Management" width="100%">

**API Management (opened)**

<img src="screenshots/API Management Opened.png" alt="API Management Opened" width="100%">

---

## Flow overview (sequence)

How the dashboard loads data and how the worker runs checks and evaluates incidents:

<p align="center"><img src="docs/diagrams/sequence.png" alt="Sequence: dashboard load and worker tick" width="100%"></p>

---

## Contents

- [What it does](#what-it-does)
- [Architecture diagrams](#architecture-diagrams)
- [Installation](#installation)
- [Configuration](#configuration)
- [Launch](#launch)
- [Security](#security)
- [The three services](#the-three-services)
- [How it works (under the hood)](#how-it-works-under-the-hood)
- [Tests](#tests)
- [Project structure](#project-structure)
- [Technical choices](#technical-choices)
- [Roadmap](#roadmap-ideas-no-commitment)
- [Documentation](#documentation)
- [License](#license)

---

## What it does

Tower API Monitoring is an end-to-end health monitoring system. You define providers and their endpoints; the worker checks them on a schedule, stores the results, and opens or closes incidents when things break or recover. The API aggregates that data, and the Angular dashboard lets you filter, sort, and drill into each provider.

- **Dashboard** — Table of all providers with status, trend, uptime, latency, and incidents. Filters and sort; expandable rows with mini charts and recent incidents; a dedicated provider page with a full latency chart and incident timeline.
- **API** — REST endpoints for dashboard rows, provider detail, latency history, incidents, and full CRUD for providers and endpoints (API Management).
- **Worker** — Runs in a loop (every 60s by default): loads enabled endpoints, runs HTTP checks, writes results to the database, and evaluates incidents per provider (down or high latency).

---

## Architecture diagrams

| High-level architecture | Monorepo packages |
|-------------------------|-------------------|
| ![Architecture](docs/diagrams/high%20level%20architecture.png) | ![Packages](docs/diagrams/packages_and_dependencies.png) |

| Database schema | API flows | Incident lifecycle |
|-----------------|-----------|---------------------|
| ![Database](docs/diagrams/database.png) | ![API flow](docs/diagrams/API_flow.png) | ![Incident lifecycle](docs/diagrams/incident_lifecycle.png) |

---

## Installation

### Prerequisites

- **Node.js** 18+ (LTS recommended)
- **pnpm** 10.x (`npm install -g pnpm` or see [pnpm.io](https://pnpm.io))
- **MySQL** (server and client for the database)

### Steps

1. Clone the repository:

   ```sh
   git clone https://github.com/your-org/tower-api-monitoring.git
   cd tower-api-monitoring
   ```

2. Install dependencies (from the repo root):

   ```sh
   pnpm install
   ```

3. Configure the database (see [Configuration](#configuration) below), then generate the Prisma client and apply migrations:

   ```sh
   pnpm prisma generate
   pnpm prisma migrate dev
   ```

4. (Optional) Seed initial providers and endpoints:

   ```sh
   pnpm prisma db seed
   ```

---

## Configuration

### Environment variables

| Variable        | Where        | Description                                      |
|----------------|--------------|--------------------------------------------------|
| `DATABASE_URL` | `prisma/.env`| MySQL connection string (e.g. `mysql://user:pass@localhost:3306/tower`) |
| `PORT`         | API process  | Optional; API server port (default: 3000)        |

Create `prisma/.env` if it doesn’t exist and set at least:

```env
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/DATABASE"
```

The dashboard talks to the API at a configurable base URL (e.g. `http://localhost:3000` in dev). For production, set the API URL in the Angular app (environment or build-time).

---

## Launch

### Development

From the repo root:

- **API:** `pnpm -C apps/api dev` — serves on http://localhost:3000 (or whatever you set in `PORT`)
- **Worker:** `pnpm -C apps/worker dev` — runs the check loop every 60s
- **Dashboard:** `pnpm -C apps/dashboard/dashboard start` or `cd apps/dashboard/dashboard && pnpm start` — dev server (e.g. http://localhost:4200)

Run all three for a full local setup. The dashboard expects the API on port 3000 by default.

### Production

- **API:** `pnpm -C apps/api build` then run `node apps/api/dist/main.js`
- **Worker:** `pnpm -C apps/worker build` then run `node apps/worker/dist/index.js`
- **Dashboard:** `cd apps/dashboard/dashboard && pnpm run build` then serve the `dist/` output with nginx or any static host

Run `pnpm prisma migrate deploy` on the target database. Use a process manager (e.g. PM2) or containers to keep the API and worker running. More detail in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

---

## Security

Things to keep in mind:

- **Authentication:** The API doesn’t enforce auth yet. Anyone with network access can call CRUD and read endpoints. For production, add API keys or another mechanism and protect sensitive routes.
- **CORS:** In dev we only allow `http://localhost*`. In production, set an explicit list of allowed origins (see [docs/SECURITY.md](docs/SECURITY-AUDIT.md)).
- **Rate limiting:** There’s no rate limiting on the API yet. Consider a middleware or reverse proxy to limit abuse.
- **Dependencies:** Run `pnpm audit` and fix or explicitly accept reported issues. Prioritize high/critical and keep dependencies up to date.

Full audit and recommendations: [docs/SECURITY.md](docs/SECURITY-AUDIT.md).

---

## The three services

| Service      | Role | Port / run mode | Main endpoints / behavior |
|-------------|------|------------------|---------------------------|
| **API**     | Serves dashboard data, provider detail, latency history, incidents, and API Management CRUD. | Listens on `PORT` (default 3000). | `/dashboard`, `/providers/:slug`, `/providers/:slug/latency-history`, `/incidents`, `/incidents/:providerId`, `/api-management/providers`, `/api-management/providers/:id`, `/api-management/providers/:id/endpoints`, `/api-management/endpoints/:id`. |
| **Dashboard** | Angular SPA: main dashboard, provider page, incident history, API Management. | Dev server (e.g. 4200); in prod, static files only. | N/A (consumes API). |
| **Worker**  | Runs HTTP checks for all enabled endpoints, writes `CheckResult` to the DB, and opens/closes incidents per provider. | No HTTP server; runs in a loop. | Checks every 60s by default; writes to MySQL via Prisma. |

---

## How it works (under the hood)

1. **Worker** — Loads enabled endpoints from the database, calls each URL with Axios (7s timeout), and stores one `CheckResult` per endpoint (status, latency, size). Then, per provider, it decides whether to open a new incident (down or high latency) or close an existing one when the provider is healthy again.
2. **API** — Reads from MySQL with Prisma. The dashboard service aggregates providers, endpoints, check results, and incident events into one row per provider (status, uptime, latency, trend). Other routes serve incidents, provider detail, latency history, and CRUD for providers and endpoints.
3. **Dashboard** — Calls the API, shows the table and filters, and lets users open the API Management page to add or edit providers and endpoints. All state comes from the API; the worker keeps the data fresh in the background.

---

## Tests

- **All (Vitest):** `pnpm test`
- **API only:** `pnpm test:api`
- **Worker only:** `pnpm test:worker`
- **Dashboard (Jasmine/Karma):** `cd apps/dashboard/dashboard && pnpm test` (or `ng test`)
- **Coverage:** `pnpm test:coverage` at the root (Vitest)

More on layout and strategy: [docs/TESTING.md](docs/TESTING.md).

---

## Project structure

```
tower-api-monitoring/
├── apps/
│   ├── api/                 # Express API (routes, services, types)
│   ├── dashboard/           # Angular app (dashboard project inside)
│   └── worker/              # Check loop (lib, runtime, infra)
├── libs/
│   ├── db/                  # Prisma client (shared DB access)
│   └── contracts/           # Shared TypeScript types
├── prisma/
│   ├── schema.prisma        # MySQL schema
│   ├── migrations/          # Migration history
│   └── seed.ts              # Seed script
└── docs/                    # Architecture, flows, security, testing, etc.
```

---

## Technical choices

- **Angular** — Rich UI, strong typing, and a clear structure; works well for tables, filters, and multiple views.
- **Express** — Simple and easy to extend with middleware (CORS, error handler, future auth or rate limit).
- **Prisma** — Type-safe access to MySQL, migrations, and a single schema shared by the API and worker.
- **MySQL** — Relational store for providers, endpoints, check results, and incidents; good for aggregations and time-series-style queries.

You could swap in Nest or Fastify for Express, React or Vue for Angular, or PostgreSQL for MySQL with relatively small changes if you ever need to.

---

## Roadmap (ideas, no commitment)

Possible next steps:

- **Authentication** — API key or OAuth for the API and/or dashboard.
- **Notifications** — Alerts (email, Slack, webhook) when incidents open or close.
- **Multi-region** — Run checks from several regions and store region in results.
- **Rate limiting and hardening** — Middleware or reverse proxy; stricter CORS and security headers in production.

---

## Documentation

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — Monorepo layout, apps, libs, data flow
- [docs/diagrams/](docs/diagrams/) — Diagram images (architecture, sequence, database, API flows, incident lifecycle, packages)
- [docs/FLOWS.md](docs/FLOWS.md) — Check lifecycle, how the dashboard is computed, incidents
- [docs/SERVICES.md](docs/SERVICES.md) — Backend and frontend services
- [docs/SECURITY.md](docs/SECURITY.md) — Security summary and recommendations
- [docs/TESTING.md](docs/TESTING.md) — How to run tests and where they live
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) — Build and deployment
- [docs/MAINTENANCE.md](docs/MAINTENANCE.md) — Dependencies, migrations, logs, health checks
- [docs/CONVENTIONS.md](docs/CONVENTIONS.md) — Naming and code style

---

## License

ISC.

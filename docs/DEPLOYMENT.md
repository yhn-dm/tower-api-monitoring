# Deployment

What you need before building, how to build, and how to run in dev or production.

## Prerequisites

You’ll need Node.js (LTS, e.g. 18+), pnpm 10, and MySQL. Create a DB and user, then set DATABASE_URL. Optionally set PORT for the API (default 3000).

## Environment

- **DATABASE_URL** — MySQL connection string.
- **PORT** — API port (default 3000).
- **Dashboard** — Set the API base URL for production so the frontend talks to the right backend.

## Build

- **Prisma:** `pnpm prisma generate` then `pnpm prisma migrate deploy` for migrations.
- **API:** `cd apps/api && pnpm build` (output in dist/).
- **Worker:** `cd apps/worker && pnpm build` (output in dist/).
- **Dashboard:** `cd apps/dashboard && ng build` (or the project’s build script).

## Run (dev)

- API: `cd apps/api && pnpm dev`
- Worker: `cd apps/worker && pnpm dev`
- Dashboard: `cd apps/dashboard && ng serve`

## Production

Run the API with `node dist/main.js` and the worker with `node dist/index.js`. Serve the dashboard’s static files with nginx or any static host. A process manager like PM2 works well. If you use Docker, build an image per app, point them at the same MySQL, and run migrations there. Use HTTPS and an explicit CORS allowlist in production.

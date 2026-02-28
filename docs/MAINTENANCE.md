# Maintenance

How to handle dependency updates, Prisma migrations, log rotation, and monitoring (health checks).

---

## Dependency updates

- **See what’s outdated:** Run `pnpm outdated` at the root and in apps/libs.
- **Update:** Use `pnpm update` or bump specific packages. For major upgrades (Angular, Prisma, Express, etc.) follow their migration guides and run the test suite afterward.
- **Security:** Run `pnpm audit` regularly and fix or explicitly accept high/critical issues. Dev-only CVEs (e.g. in Angular CLI) are lower priority but still worth addressing in CI when you can.

---

## Prisma migrations

- **Create a migration (dev):** After changing `prisma/schema.prisma`, run `pnpm prisma migrate dev --name <description>` to create a new migration and apply it to your dev DB.
- **Apply in production:** Use `pnpm prisma migrate deploy` (no interactive prompt). Make sure DATABASE_URL points to the target DB and that you have a backup before applying.
- **Regenerate client:** After any schema or migration change, run `pnpm prisma generate` so the API and worker use the updated client.

---

## Log rotation

Right now application logs go to stdout/stderr (e.g. [api:error], [api-management:audit], [tick], [incident]). In production, redirect them to a logging system (systemd journal, file, or a log aggregator) and set up rotation (logrotate, journald, or your cloud’s retention). Don’t log request bodies or secrets; keep the audit log to action, resource, id, and minimal details for compliance and debugging.

---

## Health checks

- **API:** Add a simple health route (e.g. GET /health) that returns 200 and optionally checks DB connectivity (e.g. `prisma.$queryRaw('SELECT 1')`) so load balancers or orchestrators can probe liveness/readiness.
- **Worker:** It doesn’t expose HTTP; monitor the process (e.g. PM2 or container health). You can log a heartbeat or metric on each tick for external monitoring.
- **Database:** Monitor MySQL availability and disk; set up alerts for connection or migration failures.

---

## Monitoring and alerts

It’s worth adding metrics (e.g. request count, latency, error rate for the API; check duration and incident open/close for the worker) and a small dashboard. Alerts on repeated 5xx, DB errors, or worker crash/restart help catch issues early.

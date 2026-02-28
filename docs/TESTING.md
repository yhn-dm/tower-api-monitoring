# Testing

**How to run:** From the repo root, `pnpm test` runs Vitest for API and worker. Use `pnpm test:api` or `pnpm test:worker` for a single app. For the dashboard, run `ng test` (or the project’s test script) in apps/dashboard.

**Layout:** API and worker each have `tests/unit` and `tests/integration`. The dashboard keeps `.spec.ts` files next to the components they test.

**Strategy:** Unit tests focus on services (with Prisma mocked). Integration tests hit the routes. The worker tests cover httpCheck and incidentDetector. We aim to cover validation, 409/404 responses, and that 500s don’t leak stack traces.

**Coverage:** Run `pnpm test:coverage` at the root. We prioritize services, status/uptime logic, and CRUD validation.

# Main flows

This page describes how data and control move through the system: the check lifecycle, how the dashboard is computed, and how incidents are managed.

---

## 1. Check lifecycle (worker → DB)

1. **Worker startup**  
   `apps/worker/src/index.ts` calls `startWorker()` from `runtime/runner.ts`. The runner then loops forever with a fixed 60-second interval.

2. **Tick**  
   Each loop runs `runMonitoringTickOnce()` (in `runtime/tick.ts`):
   - Load all endpoints where `isEnabled: true`, with their provider.
   - For each endpoint, call `performHttpCheck(url, method)` (in `lib/httpCheck.ts`): one HTTP request with a 7s timeout; you get status (UP / TIMEOUT / ERROR), latency, and response size.
   - Save one `CheckResult` per endpoint (status, httpStatus, latencyMs, responseSizeBytes, checkedAt, region).
   - Collect the distinct `providerId`s from the endpoints you just checked; for each, call `evaluateProviderIncident(providerId)`.

3. **Incident evaluation** (in `lib/incidentDetector.ts`)  
   - Load the provider’s endpoints and their latest check.
   - If any endpoint’s last check is DOWN/TIMEOUT/ERROR, the provider is “down”; if none are down but latency is at or above the threshold (2001 ms), it’s “degraded”.
   - If there’s a problem and no open incident for this provider, create an `IncidentEvent` (type DOWN or SLOW, endAt = null).
   - If there’s no problem and an open incident exists, close it by setting `endAt = now()`.

4. **Persistence**  
   Everything is written to MySQL via Prisma (`@tower/db`). There’s no queue: each tick runs synchronously (HTTP calls one after another, then DB writes).

---

## 2. Dashboard calculation (API → Prisma → response)

1. **Request**  
   The frontend (or any client) calls `GET /dashboard` (see `apps/api/src/routes/dashboard.routes.ts`).

2. **Service**  
   `DashboardService.fetchProviderRows()` (in `apps/api/src/services/dashboard.service.ts`) does the work:
   - Load all providers with their endpoints.
   - For each provider that has at least one endpoint:
     - From the last check per endpoint: lastLatency, lastCheckAt.
     - From the last 3h of check results: avgLatency3h.
     - From the last 24h grouped by status: total24h, errors24h → errorRate24h, uptime24h.
     - Count incident events in the last 24h → incidents24h.
     - Status: down if uptime24h < 95% or errorRate24h > 10%; degraded if uptime24h ≤ 99%; otherwise operational.
     - Trend: up/down/stable by comparing last value to the 3h average.
     - Primary endpoint URL: first enabled one, or first in list.
   - Returns an array of dashboard row objects (providerId, slug, name, status, trend, latencies, uptimes, incidents24h, etc.).

3. **Response**  
   The route returns that array as JSON. There’s no caching; every request hits the DB.

---

## 3. Incident management (detection, closure, display)

1. **Detection and closure**  
   Done in the worker during the same tick as the checks (see “Check lifecycle” above). `evaluateProviderIncident` opens and closes incidents; there’s no separate incident service in the worker.

2. **Storage**  
   Incidents are stored as `IncidentEvent` (providerId, startAt, endAt, type, message). Open incidents have `endAt = null`.

3. **API**  
   - `GET /incidents` — returns all incident events (e.g. for the incident history page), with provider included.
   - `GET /incidents/:providerId` — returns incidents for one provider (e.g. for the dashboard expandable row or provider page).

4. **Display**  
   - **Dashboard** — expandable rows load recent incidents for a provider and show a short list.
   - **Incident history page** — lists all incidents with filters (type, ongoing/resolved) and URL sync.
   - **Provider detail page** — shows a timeline of incidents for that provider.

The flow is one-way: the worker writes incidents; the API and dashboard only read them (no user-triggered creation or closure in the current design).

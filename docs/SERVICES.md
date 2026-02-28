# Services

This doc describes the backend and frontend services: what they do, what they take in and return, and what they depend on.

---

## Backend (apps/api)

### DashboardService

Builds dashboard rows (one per provider with aggregated metrics) and latency history buckets.

- **Main methods**: `fetchProviderRows()` returns the list of provider rows (status, trend, lastLatency, avgLatency3h, errorRate24h, uptime24h, incidents24h, primaryEndpointUrl, etc.). `getProviderLatencyHistory(slug, windowMinutes, stepMinutes)` returns time-bucketed latency points or null.
- **Inputs**: Reads from Prisma (Provider, Endpoint, CheckResult, IncidentEvent). Status is down if uptime24h < 95% or errorRate24h > 10%; degraded if uptime24h ≤ 99%; otherwise operational.
- **Dependencies**: prisma (utils/prisma), dashboard.types.

### IncidentService

Exposes incidents for listing (all or per provider).

- **Methods**: `getAll()` — all IncidentEvent with provider, ordered by startAt desc. `fetchByProviderId(providerId)` — incidents for one provider.
- **Dependencies**: prisma.

### ProviderService

Handles provider CRUD (legacy) and status for a slug.

- **Methods**: getStatus(slug), getAll(), getBySlug, create, etc. Status is derived from the last check and recent incidents for the provider.
- **Dependencies**: prisma.

### EndpointService

Lists and creates endpoints (legacy route).

- **Dependencies**: prisma.

### CheckService

Serves the timeline of check results for a provider (by slug).

- **Methods**: getTimeline(slug, limit) — CheckResult for that provider’s endpoints, ordered by checkedAt.
- **Dependencies**: prisma.

### ApiManagementService

Full CRUD for providers and endpoints, plus validation (slug, name, url, method, etc.), slug uniqueness, and audit log.

- **Methods**: validateCreateProvider, validateCreateEndpoint, validateUpdateEndpoint; createProvider, updateProvider, deleteProvider; createEndpoint, updateEndpoint, deleteEndpoint; getProviders, getProviderById.
- **Inputs/Outputs**: DTOs (CreateProviderDto, UpdateProviderDto, CreateEndpointDto, UpdateEndpointDto); returns data or an error body (code, message, details).
- **Dependencies**: prisma, api-management.types. Logs to console: `[api-management:audit]` with action, resource, id, etc.

---

## Worker (apps/worker)

### performHttpCheck (lib/httpCheck.ts)

Makes one HTTP request and returns status (UP/TIMEOUT/ERROR), httpStatus, latencyMs, responseSizeBytes, and an optional error message. Timeout 7s; validateStatus: () => true so any HTTP status is accepted.

- **Dependencies**: axios.

### evaluateProviderIncident (lib/incidentDetector.ts)

Uses the latest check per endpoint to decide if the provider is down or degraded, then opens or closes an IncidentEvent for that provider. Degraded latency threshold: 2001 ms.

- **Dependencies**: @tower/db, Prisma CheckStatus.

### runMonitoringTickOnce (runtime/tick.ts)

Loads enabled endpoints; for each one calls performHttpCheck and persists a CheckResult; then for each distinct providerId calls evaluateProviderIncident.

- **Dependencies**: infra/db, httpCheck, incidentDetector.

---

## Frontend (apps/dashboard)

### DashboardService (Angular)

HTTP client for dashboard data, provider by slug, latency history, and incidents.

- **Methods**: getDashboard(), getProvider(slug), getLatencyHistory(slug, window, step), getIncidents(), etc. Base URL is configurable (e.g. http://localhost:3000).
- **Dependencies**: HttpClient. Exposes interfaces: ProviderDashboardRow, Incident, LatencyPoint.

### ApiManagementService (Angular)

HTTP client for API Management (providers and endpoints CRUD).

- **Methods**: getProviders(), createProvider(payload), getProviderById(id), updateProvider(id, payload), deleteProvider(id), createEndpoint(providerId, payload), updateEndpoint(id, payload), deleteEndpoint(id). Base URL: http://localhost:3000/api-management.
- **Dependencies**: HttpClient. Exposes: Provider, Endpoint, CreateProviderPayload, UpdateEndpointPayload, ApiError.

The dashboard, incidents, provider, and api-management components use these services and optionally Router/ActivatedRoute for navigation and query params.

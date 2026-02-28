# Security

Short summary of the security audit and what’s in place. Full details are in docs/SECURITY-AUDIT.md.

**What we have today:** No raw SQL (Prisma only). 500 responses don’t expose stack traces. Body limit 1MB. CORS restricted to localhost in dev. Audit log for CRUD. Slug uniqueness enforced (409 on conflict).

**Recommended next steps:** Add auth for CRUD, rate limiting, run `pnpm audit` regularly, add request ID in logs, and use an explicit CORS allowlist in production.

**Good practices:** Use HTTPS in production, keep secrets in env vars, and don’t log request bodies.

## Audit status

**Open:** Auth, rate limiting, npm CVE follow-up, request ID, WAF/proxy. **Mitigated:** CORS, error format, body limit, x-powered-by, audit log, slug conflict. **Accepted (for now):** Single-tenant, no auth yet.

# Conventions

## Language

Code and UI are in English only: user-facing labels, comments, log messages, API error messages, and config descriptions. Variables and function names are in English (no mixing with other languages).

## Naming

| Element | Rule |
|--------|--------|
| **Files** | kebab-case for Angular components (e.g. `dashboard.component.ts`); camelCase or kebab for routes. |
| **Classes / interfaces** | PascalCase. |
| **Functions / variables** | camelCase. |
| **Constants** | UPPER_SNAKE_CASE or camelCase (align with existing project usage). |
| **Enums** | PascalCase; values UPPER_SNAKE or PascalCase (consistent with Prisma). |
| **API routes** | kebab-case or camelCase (e.g. `/api-management`, `/latency-history`). |

## Folder structure

- **apps/api/src**: routes/, services/, types/, utils/; app.ts, main.ts.
- **apps/worker/src**: lib/ (httpCheck, incidentDetector), runtime/ (tick, runner), infra/ (db).
- **apps/dashboard/dashboard/src/app**: pages/, components/, layout/, services/; app.routes.ts.
- **libs/db/src**: Prisma client. **libs/contracts/src**: shared types.
- **prisma**: schema.prisma, seed.ts, migrations/.

## Code style

Use TypeScript strict where it’s enabled and prefer interfaces for DTOs and API shapes. In Angular, one logical component per file and services in their own files. Prefer async/await and use centralized error handling (e.g. asyncHandler) in API routes.

## Scope

These conventions apply to all source and templates (`.ts`, `.html`, `.css`, `.scss`), config files, and the `docs/` folder.

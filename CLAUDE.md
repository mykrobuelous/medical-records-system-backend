# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Backend API for a medical records system (patients + consultations), with JWT-based authentication gating all resource routes. Express 5 + TypeScript, running as native ESM, with Drizzle ORM over PostgreSQL. `patients` and `consultations` both have full CRUD routes/controllers; there is no frontend in this repo.

## Commands

```bash
npm run dev      # start with nodemon + tsx, watches src/**/*.ts
npm run build    # tsc compile to dist/
npm start        # run compiled dist/index.js
npm run lint     # eslint src
npm run migrate  # drizzle-kit migrate — apply committed migrations from drizzle/ to DATABASE_URL
```

There is no test runner configured in this repo yet.

### Database (Drizzle)

`drizzle.config.ts` points at `src/db/schema.ts` and outputs migrations to `drizzle/`. `npm run migrate` wraps `drizzle-kit migrate`; generate/push have no npm script and are run directly:

```bash
npx drizzle-kit generate   # generate a new SQL migration from schema.ts changes
npx drizzle-kit push       # push schema changes directly to the DB (dev convenience)
npm run migrate            # apply committed migrations (what Railway runs on deploy)
```

Requires `DATABASE_URL` in `.env` (postgresql connection string). `.env` also defines `PORT`, `JWT_SECRET`, `JWT_EXPIRY`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `NODE_ENV` — see `.env.example` for the full list of required variables.

Seed the database via the running API (not a script): `POST /api/seed` (requires auth — see below) — deletes and re-inserts all patients/consultations from `src/data/seedData.ts` inside a single transaction.

## Architecture

- **Module system**: `"type": "module"` + `moduleResolution: "NodeNext"`. All relative imports must use explicit `.js` extensions even though source files are `.ts` (e.g. `import { db } from '../../db/index.js'`). This is required for the TS compiler/tsx to resolve ESM correctly — don't drop the extension.
- **Entry point** ([src/index.ts](src/index.ts)): builds the Express app, applies `cors`, `morgan('dev')`, `express.json()`, then mounts routers under `/api`. `authenticateUser` middleware is applied per-router (not globally) to every mount except `/api/login`.
- **Auth**: [src/middleware/auth/](src/middleware/auth/) implements a single hardcoded-admin login flow, not a users table. `POST /api/login` validates `{ username, password }` (via `auth.schema.ts`) against `ADMIN_USERNAME`/`ADMIN_PASSWORD` env vars (`checkUser` in `auth.utils.ts`) and returns a JWT signed with `JWT_SECRET`/`JWT_EXPIRY`. `authenticateUser` (in `auth.controller.ts`) reads the `Authorization: Bearer <token>` header, verifies it, and attaches the decoded payload to `req.user` (typed via the `AuthRequest` interface) — apply it as route/router middleware for any endpoint that needs protecting, following how it's wired in `index.ts`.
- **Routing pattern**: each resource lives under `src/routes/<resource>/` with three files — `<resource>.routes.ts` (Router + path wiring), `<resource>.controller.ts` (handler logic, talks to `db` directly), and `<resource>.schema.ts` (zod request-body schemas). Follow this split for new resources rather than inlining logic in the router. The `auth` module mirrors this same split under `src/middleware/auth/` instead of `src/routes/`.
- **Validation**: controllers parse `req.body` with a zod schema from the sibling `.schema.ts` file via `.safeParse()`. On failure, respond `400` with `{ status: 'error', message, errors: flattenError(parsed.error) }`. Update schemas define the same fields as create schemas but wrapped in `.partial()`, and controllers reject empty-object updates (no fields provided) with a `400` before hitting the DB.
- **Database layer** ([src/db/index.ts](src/db/index.ts)): a single `pg.Pool` wrapped by `drizzle()`, exported as `db`. Controllers import `db` and the relevant table(s) from [src/db/schema.ts](src/db/schema.ts) and query directly — there is no repository/service abstraction layer.
- **Schema** ([src/db/schema.ts](src/db/schema.ts)): `patients` and `consultations` tables with a `references(() => patients.id, { onDelete: 'cascade' })` FK, plus Drizzle `relations()` for `db.query` style joins. Deleting a patient cascades to their consultations at the DB level — controllers don't need to delete consultations manually. `consultations.vitals` is stored as a single `jsonb` column (typed via `$type<...>`) rather than flattened into columns — mirrors the shape of `ConsultationType.vitals` in `data.types.ts`; keep those two in sync if either changes. SOAP note fields (`subjective`/`objective`/`assessment`/`plan`) are individual `text` columns. When inserting a consultation with an invalid `patientId`, Postgres raises FK violation `23503`; `createConsultation` catches that specific code and returns a `400` "Patient not found" instead of a `500`.
- **Types vs schema duplication**: `src/data/data.types.ts` defines `PatientType`/`ConsultationType` independently from the Drizzle schema (not inferred via `typeof patients.$inferSelect`). These are used by the hand-written seed data in `src/data/seedData.ts`. When changing a table shape, update the Drizzle schema, these hand-rolled types, and the corresponding zod schema in the resource's `.schema.ts` together.
- **Branded IDs**: [src/utils/idUtils.ts](src/utils/idUtils.ts) defines an `IDBrand` (a branded `string`) and `generateID()` (uuid v4). Seed data casts raw UUID strings to `IDBrand` via a local `asId` helper in `seedData.ts` rather than calling `generateID()`, since the IDs are fixed fixtures cross-referenced between patients and consultations.
- **Response shape convention**: JSON handlers return `{ status: 'ok' | 'error', data?, message?, errors? }`. Follow this shape for new endpoints. Errors are logged with `console.error` and mapped to appropriate HTTP status codes (400 for validation/FK failures, 401/403 for auth failures, 404 for not found, 500 for unexpected failures).

## Deployment (Railway)

`railway.json` configures Nixpacks to run `npm run build` at build time and `npm run migrate && npm start` on deploy, so every deploy applies any pending Drizzle migrations before the server starts. Set all vars from `.env.example` in the Railway service (`DATABASE_URL` normally comes from a linked Railway Postgres plugin) — `PORT` is injected by Railway itself and doesn't need to be set manually. `package-lock.json` is gitignored in this repo, so Railway's install step resolves dependencies fresh each build rather than from a committed lockfile.

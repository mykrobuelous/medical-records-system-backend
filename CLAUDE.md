# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Backend API for a medical records system (patients + consultations). Express 5 + TypeScript, running as native ESM, with Drizzle ORM over PostgreSQL. The project is early-stage: only `patients` (read) and `seed` routes currently exist; `consultations` has a schema and seed data but no routes/controller yet.

## Commands

```bash
npm run dev      # start with nodemon + tsx, watches src/**/*.ts
npm run build    # tsc compile to dist/
npm start        # run compiled dist/index.js
npm run lint     # eslint src
```

There is no test runner configured in this repo yet.

### Database (Drizzle)

`drizzle.config.ts` points at `src/db/schema.ts` and outputs migrations to `drizzle/`. Use `npx drizzle-kit <command>` directly (no npm scripts wrap these):

```bash
npx drizzle-kit generate   # generate a new SQL migration from schema.ts changes
npx drizzle-kit push       # push schema changes directly to the DB (dev convenience)
npx drizzle-kit migrate    # apply pending migrations
```

Requires `DATABASE_URL` in `.env` (postgresql connection string). `.env` also defines `PORT`, `JWT_SECRET`, `JWT_EXPIRY`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `NODE_ENV` — note auth/JWT usage is not yet wired into any route despite these existing.

Seed the database via the running API (not a script): `POST /api/seed` — deletes and re-inserts all patients/consultations from `src/data/seedData.ts` inside a single transaction.

## Architecture

- **Module system**: `"type": "module"` + `moduleResolution: "NodeNext"`. All relative imports must use explicit `.js` extensions even though source files are `.ts` (e.g. `import { db } from '../../db/index.js'`). This is required for the TS compiler/tsx to resolve ESM correctly — don't drop the extension.
- **Entry point** ([src/index.ts](src/index.ts)): builds the Express app, applies `cors`, `morgan('dev')`, `express.json()`, then mounts routers under `/api`.
- **Routing pattern**: each resource lives under `src/routes/<resource>/` with a `<resource>.routes.ts` (Router + path wiring) and `<resource>.controller.ts` (handler logic, talks to `db` directly). Follow this split for new resources rather than inlining logic in the router.
- **Database layer** ([src/db/index.ts](src/db/index.ts)): a single `pg.Pool` wrapped by `drizzle()`, exported as `db`. Controllers import `db` and the relevant table(s) from [src/db/schema.ts](src/db/schema.ts) and query directly — there is no repository/service abstraction layer.
- **Schema** ([src/db/schema.ts](src/db/schema.ts)): `patients` and `consultations` tables with a `references(() => patients.id, { onDelete: 'cascade' })` FK, plus Drizzle `relations()` for `db.query` style joins. `consultations.vitals` is stored as a single `jsonb` column (typed via `$type<...>`) rather than flattened into columns — mirrors the shape of `ConsultationType.vitals` in `data.types.ts`; keep those two in sync if either changes. SOAP note fields (`subjective`/`objective`/`assessment`/`plan`) are individual `text` columns.
- **Types vs schema duplication**: `src/data/data.types.ts` defines `PatientType`/`ConsultationType` independently from the Drizzle schema (not inferred via `typeof patients.$inferSelect`). These are used by the hand-written seed data in `src/data/seedData.ts`. When changing a table shape, update both the Drizzle schema and these hand-rolled types.
- **Branded IDs**: [src/utils/idUtils.ts](src/utils/idUtils.ts) defines an `IDBrand` (a branded `string`) and `generateID()` (uuid v4). Seed data casts raw UUID strings to `IDBrand` via a local `asId` helper in `seedData.ts` rather than calling `generateID()`, since the IDs are fixed fixtures cross-referenced between patients and consultations.
- **Response shape convention**: JSON handlers return `{ status: 'ok' | 'error', data?, message? }`. Follow this shape for new endpoints. Errors are logged with `console.error` and mapped to appropriate HTTP status codes (404 for not found, 500 for unexpected failures).

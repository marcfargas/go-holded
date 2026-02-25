# go-holded — Project Instructions

## What This Is

TypeScript library + gateway CLI for the Holded API (https://developers.holded.com/).
Designed for AI agent consumption with structured JSON output and safety guards.
Also usable as a regular TypeScript library.

## Architecture

- **Library** (`@marcfargas/go-holded`): Importable TypeScript modules per domain
- **Gateway CLI** (`npx go-holded`): Always JSON output, `--confirm` for destructive ops
- **Skills** (`skills/holded/`): Pi-compatible skill docs for AI agents

## Key Design Decisions

1. **Domain organization differs from Holded API** — we reorganize into user-sensical
   domains (see DEVELOPMENT.md for the full mapping). The HTTP layer maps transparently.
2. **CRUD factory pattern** — most resources share `list/get/create/update/delete`.
   Domain-specific resources extend the factory with extra methods.
3. **Multi-tenant via env vars** — `HOLDED_API_KEY` (default) or
   `HOLDED_API_KEY_<PROFILE>` (per-tenant). No file-based key storage.
4. **Safety model** — READ (no gate), WRITE (no gate), DESTRUCTIVE (`--confirm` required).

## Conventions

- All source in `src/`, tests in `tests/` (mirroring `src/` structure)
- One file per resource (e.g., `src/contacts/contacts.ts`)
- Barrel exports via `index.ts` in each domain directory
- Types co-located with their resource file or in a shared `types.ts`

## Testing

- Unit tests mock the HTTP layer (never hit real Holded API in CI)
- Test files: `tests/<domain>/<resource>.test.ts`
- `vitest` with v8 coverage, 50% minimum threshold

## Git

- `develop` — working branch
- `main` — release branch (PR from develop)
- Conventional commits: `feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`

# @marcfargas/go-holded

## 0.2.0

### Minor Changes

- [`75c6a37`](https://github.com/marcfargas/go-holded/commit/75c6a378ab01eb2ed33077ebff658cbb10e5f641) Thanks [@marcfargas](https://github.com/marcfargas)! - Initial release of `@marcfargas/go-holded` and `go-holded`.

  - **9 domains**: contacts, accounting, taxes, cash, invoicing, stock, team, CRM, projects
  - **Multi-tenant**: per-client API keys via `HOLDED_API_KEY_<PROFILE>` env vars
  - **Gateway CLI** (`npx go-holded`): structured JSON output, `--confirm` gate on destructive ops
  - **TypeScript library**: full types, ESM, zero runtime dependencies
  - **Documents duplicate**: `invoicing documents duplicate <docType> <id> --date YYYY-MM-DD` — copies a document to a new date, remapping API field inconsistencies transparently
  - **approveDoc safety gate**: `create` and `duplicate` always inject `approveDoc: false`; explicit `--approve --confirm` required to approve immediately (irreversible)
  - **Pi skill** included: `skills/holded/` with per-domain markdown docs for AI agents

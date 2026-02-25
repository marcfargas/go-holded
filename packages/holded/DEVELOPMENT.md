# Development Guide

## Setup

```bash
git clone https://github.com/marcfargas/go-holded.git
cd go-holded
npm install
npm run build
npm run test
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Compile TypeScript |
| `npm run dev` | Watch mode |
| `npm run test` | Run tests |
| `npm run test:watch` | Tests in watch mode |
| `npm run test:coverage` | Tests with coverage |
| `npm run lint` | ESLint check |
| `npm run lint:fix` | ESLint auto-fix |
| `npm run format` | Prettier format |
| `npm run format:check` | Prettier check |
| `npm run check` | Full check (lint + format + build + test) |

## Domain Mapping: go-holded → Holded API

We reorganize the Holded API into user-sensical domains. The Holded API has some
counterintuitive naming — for example, "Expenses Accounts" (expense accounting
accounts 6xxx) and "Sales Channels" (income accounting accounts 7xxx) live under
the Invoice API, but logically belong in accounting.

Our domain layout maps to the underlying API paths as follows:

| go-holded domain | Resource | Holded API path |
|--|--|--|
| **contacts** | Contacts | `GET\|POST /api/invoicing/v1/contacts` |
| | Contact Groups | `GET\|POST /api/invoicing/v1/contactgroups` |
| | Contact Attachments | `GET /api/invoicing/v1/contacts/{id}/attachments` |
| **accounting** | Expense Accounts (6xxx) | `GET\|POST /api/invoicing/v1/expensesaccounts` |
| | Income Accounts (7xxx) | `GET\|POST /api/invoicing/v1/saleschannels` |
| | Chart of Accounts | `GET\|POST /api/accounting/v1/accounts` |
| | Daily Ledger | `GET\|POST /api/accounting/v1/dailyledger` |
| **taxes** | Taxes | `GET /api/invoicing/v1/taxes` |
| **cash** | Treasuries | `GET\|POST /api/invoicing/v1/treasury` |
| | Payments | `GET\|POST /api/invoicing/v1/payments` |
| | Remittances | `GET /api/invoicing/v1/remittances` |
| **invoicing** | Documents | `GET\|POST /api/invoicing/v1/documents/{docType}` |
| | Numbering Series | `GET\|POST /api/invoicing/v1/numberingseries/{docType}` |
| | Services | `GET\|POST /api/invoicing/v1/services` |
| | Payment Methods | `GET /api/invoicing/v1/paymentmethods` |
| **stock** | Products | `GET\|POST /api/invoicing/v1/products` |
| | Product Images | `GET /api/invoicing/v1/products/{id}/image` |
| | Warehouses | `GET\|POST /api/invoicing/v1/warehouses` |
| | Warehouse Stock | `GET /api/invoicing/v1/warehouses/{id}/stock` |
| **team** | Employees | `GET\|POST /api/team/v1/employees` |
| | Employee Time Tracking | `GET\|POST /api/team/v1/times` |
| | Clock In/Out | `POST /api/team/v1/employees/{id}/clockin\|clockout` |
| | Pause/Unpause | `POST /api/team/v1/employees/{id}/pause\|unpause` |
| **crm** | Funnels | `GET\|POST /api/crm/v1/funnels` |
| | Leads | `GET\|POST /api/crm/v1/leads` |
| | Lead Notes | `POST\|PUT /api/crm/v1/leads/{id}/notes` |
| | Lead Tasks | `POST\|PUT\|DELETE /api/crm/v1/leads/{id}/tasks` |
| | Lead Stages | `PUT /api/crm/v1/leads/{id}/stages` |
| | Events | `GET\|POST /api/crm/v1/events` |
| | Bookings | `GET\|POST /api/crm/v1/bookings` |
| | Booking Locations | `GET /api/crm/v1/bookings/locations` |
| **projects** | Projects | `GET\|POST /api/projects/v1/projects` |
| | Project Summary | `GET /api/projects/v1/projects/{id}/summary` |
| | Tasks | `GET\|POST /api/projects/v1/tasks` |
| | Time Tracking | `GET\|POST /api/projects/v1/projects/{id}/times` |
| | All Times | `GET /api/projects/v1/projects/times` |

### Document Types (`docType`)

The invoicing domain handles all document types via a single resource with a `docType`
discriminator:

| docType | Description |
|---------|-------------|
| `invoice` | Sales invoice |
| `salesreceipt` | Sales receipt / ticket |
| `creditnote` | Credit note |
| `salesorder` | Sales order |
| `proforma` | Proforma invoice |
| `waybill` | Delivery note / waybill |
| `estimate` | Estimate / quote |
| `purchase` | Purchase invoice |
| `purchaseorder` | Purchase order |
| `purchaserefund` | Purchase refund |

## Authentication

All requests go to `https://api.holded.com` over HTTPS with:
- Header: `key: <api-key>`
- Content-Type: `application/json`

API key resolves from (in order):
1. Explicit `apiKey` option in `createClient()`
2. `HOLDED_API_KEY_<PROFILE>` env var (when `profile` option is set)
3. `HOLDED_API_KEY` env var (default)

## Safety Model

| Level | Operations | CLI gate |
|-------|-----------|----------|
| READ | list, get, pdf, summary | None |
| WRITE | create, update, add-note, add-task | None |
| DESTRUCTIVE | delete, send, pay, ship, clock-in/out | `--confirm` |

## Project Structure

```
src/
├── index.ts              # Library entry: createClient + re-exports
├── client.ts             # HoldedClient class, profile resolution
├── http.ts               # HTTP transport (fetch, key header, errors)
├── errors.ts             # Error types
├── types.ts              # Shared types
├── crud.ts               # CRUD resource factory
├── bin/
│   └── holded.ts         # CLI entry point
├── contacts/             # contacts + contact-groups
├── accounting/           # expense-accounts + income-accounts + chart + ledger
├── taxes/                # taxes (read-only)
├── cash/                 # treasuries + payments + remittances
├── invoicing/            # documents + numbering-series + services
├── stock/                # products + warehouses
├── team/                 # employees + time-tracking
├── crm/                  # funnels + leads + events + bookings
└── projects/             # projects + tasks + time-tracking

tests/                    # Mirrors src/ structure
skills/holded/            # Pi skill documentation
```

## Adding a New Resource

1. Create `src/<domain>/<resource>.ts`
2. Use `createCrudResource()` from `crud.ts` for standard CRUD
3. Add domain-specific methods as needed
4. Export from `src/<domain>/index.ts`
5. Wire into `HoldedClient` in `src/client.ts`
6. Add tests in `tests/<domain>/<resource>.test.ts`
7. Update the domain's skill doc in `skills/holded/<domain>.md`

## Releases

Uses [changesets](https://github.com/changesets/changesets):

```bash
npx changeset          # create a changeset
npx changeset version  # bump versions
# Push to main via PR → GitHub Action publishes to npm
```

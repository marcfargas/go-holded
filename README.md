# go-holded

**Holded API made easy** — invoicing, CRM, accounting, projects, team.
TypeScript library + gateway CLI for AI agents and humans.

[![npm](https://img.shields.io/npm/v/@marcfargas/go-holded)](https://www.npmjs.com/package/@marcfargas/go-holded)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

## Features

- **9 domains**: contacts, accounting, taxes, cash, invoicing, stock, team, CRM, projects
- **Multi-tenant**: different API key per client via profiles
- **AI-agent ready**: JSON CLI output, safety gates on destructive ops, pi skill included
- **TypeScript-first**: full types, ESM, zero runtime dependencies

## Install

```bash
npm install @marcfargas/go-holded
```

## Quick Start (Library)

```typescript
import { createClient } from '@marcfargas/go-holded';

// Reads HOLDED_API_KEY env var
const client = createClient();

// Or use a profile for multi-tenant
const client = createClient({ profile: 'acme' }); // reads HOLDED_API_KEY_ACME

// Contacts
const contacts = await client.contacts.list();

// Invoicing
const invoices = await client.invoicing.documents.list('invoice');
const pdf = await client.invoicing.documents.pdf('invoice', 'abc123');

// CRM
const leads = await client.crm.leads.list();
await client.crm.leads.addNote('lead123', { note: 'Called client' });

// Accounting
const ledger = await client.accounting.dailyLedger.list();

// Team
await client.team.employees.clockIn('emp123');
```

## Quick Start (CLI)

```bash
# Set your API key
export HOLDED_API_KEY=your-key-here

# Or per-profile
export HOLDED_API_KEY_ACME=acme-key-here

# List contacts
npx go-holded contacts list
npx go-holded --profile acme contacts list

# Invoicing
npx go-holded invoicing documents list invoice
npx go-holded invoicing documents get invoice abc123
npx go-holded invoicing documents pdf invoice abc123

# CRM
npx go-holded crm leads list
npx go-holded crm leads add-note lead123 --json '{"note":"Called"}'

# Destructive operations require --confirm
npx go-holded contacts delete abc123 --confirm
npx go-holded invoicing documents send invoice abc123 --confirm
npx go-holded team employees clock-in emp123 --confirm
```

## Multi-Tenant

Each Holded API key maps to one tenant/company. Use profiles to manage multiple:

```bash
# Environment variables
export HOLDED_API_KEY=default-key          # default
export HOLDED_API_KEY_ACME=acme-key        # profile: acme
export HOLDED_API_KEY_STARTUP_X=startup-key # profile: startup-x
```

```typescript
const acme = createClient({ profile: 'acme' });
const startup = createClient({ profile: 'startup-x' });
```

## Domains

| Domain | Description | CLI prefix |
|--------|-------------|------------|
| `contacts` | Contacts + groups | `contacts` |
| `accounting` | Expense accounts (6xxx), income accounts (7xxx), chart, ledger | `accounting` |
| `taxes` | Tax configuration | `taxes` |
| `cash` | Treasuries, payments, remittances | `cash` |
| `invoicing` | Documents (10 types), numbering series, services | `invoicing` |
| `stock` | Products, warehouses | `stock` |
| `team` | Employees, time tracking, clock in/out | `team` |
| `crm` | Funnels, leads, events, bookings | `crm` |
| `projects` | Projects, tasks, time tracking | `projects` |

> **Note**: Our domain organization differs from Holded's API layout to be more intuitive.
> See [DEVELOPMENT.md](./DEVELOPMENT.md) for the full mapping.

## Safety Model

| Level | Operations | CLI gate |
|-------|-----------|----------|
| **READ** | list, get, pdf | None |
| **WRITE** | create, update | None |
| **DESTRUCTIVE** | delete, send, pay, ship, clock-in/out | `--confirm` required |

Without `--confirm`, destructive CLI commands preview what would happen and exit with code 2.

## For AI Agents

This package ships as a [pi package](https://pi.dev/packages) with built-in skill documentation:

```bash
pi install npm:@marcfargas/go-holded
```

## License

**Code**: [MIT](./LICENSE)
**Skills** (`skills/`): [CC0 1.0 Universal](./skills/LICENSE) — public domain, no attribution required.

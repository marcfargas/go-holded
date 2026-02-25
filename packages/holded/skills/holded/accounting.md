<!-- SPDX-License-Identifier: CC0-1.0 -->
# Accounting, Taxes & Cash

## Accounting

### Expense Accounts (6xxx)

These are expense accounting accounts (plan general 6xxx). In Holded's API they're
misleadingly called "Expenses Accounts" under the Invoice API.

```bash
npx go-holded accounting expense-accounts list
npx go-holded accounting expense-accounts get <id>
npx go-holded accounting expense-accounts create --json '{"name":"Office Supplies"}'
npx go-holded accounting expense-accounts update <id> --json '{"name":"Office Materials"}'
npx go-holded accounting expense-accounts delete <id> --confirm
```

### Income Accounts (7xxx)

These are income accounting accounts (plan general 7xxx). In Holded's API they're
misleadingly called "Sales Channels" under the Invoice API.

```bash
npx go-holded accounting income-accounts list
npx go-holded accounting income-accounts get <id>
npx go-holded accounting income-accounts create --json '{"name":"Consulting Revenue"}'
npx go-holded accounting income-accounts update <id> --json '{"name":"Advisory Revenue"}'
npx go-holded accounting income-accounts delete <id> --confirm
```

### Chart of Accounts

Full chart of accounts from the Accounting module. List and create only.

```bash
npx go-holded accounting chart list
npx go-holded accounting chart create --json '{"name":"New Account","code":"4100"}'
```

### Daily Ledger

Accounting journal entries. List and create only.

```bash
npx go-holded accounting ledger list
npx go-holded accounting ledger create --json '{
  "date": 1700000000,
  "items": [
    {"account": "6200", "debit": 100},
    {"account": "4100", "credit": 100}
  ]
}'
```

## Taxes

Read-only tax configuration.

```bash
npx go-holded taxes list
```

## Cash

### Treasuries

Bank accounts and cash registers.

```bash
npx go-holded cash treasuries list
npx go-holded cash treasuries get <id>
npx go-holded cash treasuries create --json '{"name":"Main Bank Account"}'
```

### Payments

```bash
npx go-holded cash payments list
npx go-holded cash payments get <id>
npx go-holded cash payments create --json '{"amount":100,"treasuryId":"<id>"}'
npx go-holded cash payments update <id> --json '{"amount":150}'
npx go-holded cash payments delete <id> --confirm
```

### Remittances

Read-only.

```bash
npx go-holded cash remittances list
npx go-holded cash remittances get <id>
```

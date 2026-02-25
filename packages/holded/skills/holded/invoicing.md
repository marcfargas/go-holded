<!-- SPDX-License-Identifier: CC0-1.0 -->
# Invoicing, Contacts & Stock

## Contacts

Contacts are shared across all Holded modules.

```bash
npx go-holded contacts list
npx go-holded contacts get <id>
npx go-holded contacts create --json '{"name":"Acme Corp","email":"info@acme.com","vatnumber":"B12345678"}'
npx go-holded contacts update <id> --json '{"email":"new@acme.com"}'
npx go-holded contacts delete <id> --confirm
npx go-holded contacts attachments <id>          # list attachments

# Contact Groups
npx go-holded contacts groups list
npx go-holded contacts groups get <id>
npx go-holded contacts groups create --json '{"name":"VIP Clients"}'
npx go-holded contacts groups update <id> --json '{"name":"Premium Clients"}'
npx go-holded contacts groups delete <id> --confirm
```

## ⚠️ approveDoc is irreversible

**Never set `approveDoc: true` unless the user has explicitly asked to approve the document.**
Approved documents cannot be edited or deleted in Holded.

The CLI enforces this automatically:
- `create` and `duplicate` always inject `approveDoc: false` by default.
- Any `approveDoc: true` in a `--json` payload is silently stripped and a warning is emitted.
- To approve immediately, pass **both** `--approve` and `--confirm`. This is a deliberate
  two-flag requirement to prevent accidental approval.

```bash
# Safe — creates a draft (approveDoc: false injected automatically)
npx go-holded invoicing documents create invoice --json '{...}'

# Approve immediately — IRREVERSIBLE, requires both flags
npx go-holded invoicing documents create invoice --json '{...}' --approve --confirm
```

## Documents (Invoicing)

Documents cover all commercial document types. The `docType` parameter is required:

| docType | Description |
|---------|-------------|
| `invoice` | Sales invoice |
| `salesreceipt` | Sales receipt / ticket |
| `creditnote` | Credit note |
| `salesorder` | Sales order |
| `proforma` | Proforma invoice |
| `waybill` | Delivery note |
| `estimate` | Estimate / quote |
| `purchase` | Purchase invoice |
| `purchaseorder` | Purchase order |
| `purchaserefund` | Purchase refund |

```bash
# List & get
npx go-holded invoicing documents list invoice
npx go-holded invoicing documents get invoice <id>

# Create
npx go-holded invoicing documents create invoice --json '{
  "contactId": "<contactId>",
  "items": [{"name": "Service", "units": 1, "subtotal": 100}]
}'

# Update
npx go-holded invoicing documents update invoice <id> --json '{"notes":"Updated"}'

# Duplicate — copy a document to a new date (creates a draft)
npx go-holded invoicing documents duplicate invoice <source-id> --date 2026-02-28
# With field overrides on top:
npx go-holded invoicing documents duplicate invoice <source-id> --date 2026-02-28 --json '{"notes":"Feb copy"}'
# Approve immediately (IRREVERSIBLE):
npx go-holded invoicing documents duplicate invoice <source-id> --date 2026-02-28 --approve --confirm

# Delete (destructive)
npx go-holded invoicing documents delete invoice <id> --confirm

# Download PDF
npx go-holded invoicing documents pdf invoice <id>
# → { "pdf": "<base64>", "encoding": "base64" }

# Send by email (destructive)
npx go-holded invoicing documents send invoice <id> --confirm

# Register payment (destructive)
npx go-holded invoicing documents pay invoice <id> --json '{"amount":100}' --confirm

# Ship all items (destructive)
npx go-holded invoicing documents ship-all salesorder <id> --confirm
```

## Numbering Series

```bash
npx go-holded invoicing numbering-series list invoice
npx go-holded invoicing numbering-series create --json '{"name":"2026","prefix":"INV-2026-"}'
npx go-holded invoicing numbering-series update <id> --json '{"prefix":"INV-26-"}'
npx go-holded invoicing numbering-series delete <id> --confirm
```

## Services

```bash
npx go-holded invoicing services list
npx go-holded invoicing services get <id>
npx go-holded invoicing services create --json '{"name":"Consulting"}'
npx go-holded invoicing services update <id> --json '{"name":"Advisory"}'
npx go-holded invoicing services delete <id> --confirm
```

## Payment Methods

```bash
npx go-holded invoicing payment-methods    # list only
```

## Stock — Products

```bash
npx go-holded stock products list
npx go-holded stock products get <id>
npx go-holded stock products create --json '{"name":"Widget","sku":"W-001","price":10}'
npx go-holded stock products update <id> --json '{"price":12}'
npx go-holded stock products delete <id> --confirm
npx go-holded stock products update-stock <id> --json '{"warehouseId":"<whId>","units":50}'
```

## Stock — Warehouses

```bash
npx go-holded stock warehouses list
npx go-holded stock warehouses get <id>
npx go-holded stock warehouses create --json '{"name":"Main Warehouse"}'
npx go-holded stock warehouses update <id> --json '{"name":"Central"}'
npx go-holded stock warehouses delete <id> --confirm
npx go-holded stock warehouses stock <id>          # list products stock in warehouse
```

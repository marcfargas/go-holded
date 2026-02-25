<!-- SPDX-License-Identifier: CC0-1.0 -->
# CRM

## Funnels

Sales funnels (pipelines) that contain stages.

```bash
npx go-holded crm funnels list
npx go-holded crm funnels get <id>
npx go-holded crm funnels create --json '{"name":"Sales Pipeline"}'
npx go-holded crm funnels update <id> --json '{"name":"Main Pipeline"}'
npx go-holded crm funnels delete <id> --confirm
```

## Leads

```bash
# CRUD
npx go-holded crm leads list
npx go-holded crm leads get <id>
npx go-holded crm leads create --json '{"name":"New Opportunity","contactId":"<cid>"}'
npx go-holded crm leads update <id> --json '{"name":"Updated Name"}'
npx go-holded crm leads delete <id> --confirm

# Notes
npx go-holded crm leads add-note <leadId> --json '{"note":"Called the client, interested"}'
npx go-holded crm leads update-note <leadId> --json '{"noteId":"<nid>","note":"Updated note"}'

# Tasks
npx go-holded crm leads add-task <leadId> --json '{"name":"Follow up call","date":1700000000}'

# Stage management
npx go-holded crm leads update-stage <leadId> --json '{"stageId":"<stageId>"}'
```

## Events

```bash
npx go-holded crm events list
npx go-holded crm events get <id>
npx go-holded crm events create --json '{"name":"Client Meeting","date":1700000000}'
npx go-holded crm events update <id> --json '{"name":"Updated Meeting"}'
npx go-holded crm events delete <id> --confirm
```

## Bookings

```bash
npx go-holded crm bookings list
npx go-holded crm bookings get <id>
npx go-holded crm bookings create --json '{"locationId":"<locId>","date":1700000000}'
npx go-holded crm bookings update <id> --json '{"notes":"Rescheduled"}'
npx go-holded crm bookings delete <id> --confirm

# Locations & available slots
npx go-holded crm bookings locations
npx go-holded crm bookings slots <locationId>
```

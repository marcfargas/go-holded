<!-- SPDX-License-Identifier: CC0-1.0 -->
# Team

## Employees

```bash
# CRUD
npx go-holded team employees list
npx go-holded team employees get <id>
npx go-holded team employees create --json '{"name":"John Doe","email":"john@example.com"}'
npx go-holded team employees update <id> --json '{"email":"new@example.com"}'
npx go-holded team employees delete <id> --confirm

# Clock in/out (destructive — requires --confirm)
npx go-holded team employees clock-in <id> --confirm
npx go-holded team employees clock-out <id> --confirm
npx go-holded team employees pause <id> --confirm
npx go-holded team employees unpause <id> --confirm
```

## Time Tracking

```bash
# All employees
npx go-holded team time-tracking list
npx go-holded team time-tracking get <timeId>
npx go-holded team time-tracking update <timeId> --json '{"duration":3600}'
npx go-holded team time-tracking delete <timeId> --confirm

# By employee
npx go-holded team time-tracking by-employee <employeeId>
```

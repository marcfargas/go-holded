<!-- SPDX-License-Identifier: CC0-1.0 -->
# Projects

## Projects

```bash
npx go-holded projects list
npx go-holded projects get <id>
npx go-holded projects create --json '{"name":"Website Redesign"}'
npx go-holded projects update <id> --json '{"name":"Website v2"}'
npx go-holded projects delete <id> --confirm
npx go-holded projects summary <id>               # project financial summary
```

## Tasks

```bash
npx go-holded projects tasks list
npx go-holded projects tasks get <taskId>
npx go-holded projects tasks create --json '{"name":"Design mockups","projectId":"<pid>"}'
npx go-holded projects tasks delete <taskId> --confirm
```

## Time Tracking

```bash
# All times across projects
npx go-holded projects times list

# Times for a specific project
npx go-holded projects times by-project <projectId>
```

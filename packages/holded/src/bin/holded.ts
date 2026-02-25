#!/usr/bin/env node

/**
 * go-holded CLI — Gateway CLI for Holded API.
 *
 * Usage: go-holded [--profile NAME] <domain> <resource> <action> [args...] [--confirm]
 *
 * All output is JSON. Destructive operations require --confirm.
 */

import { createClient } from '../client.js';
import type { HoldedClient } from '../client.js';
import type { DocType } from '../types.js';
import { DOC_TYPES } from '../types.js';
import { HoldedError, HoldedConfigError } from '../errors.js';
import { parseDateArg, applyApproveDocGate } from './doc-helpers.js';

interface ParsedArgs {
  profile?: string;
  confirm: boolean;
  approve: boolean;
  date?: string;
  positional: string[];
  json?: string;
}

function parseArgs(argv: string[]): ParsedArgs {
  const result: ParsedArgs = { confirm: false, approve: false, positional: [] };

  let i = 0;
  while (i < argv.length) {
    const arg = argv[i]!;
    if (arg === '--profile' && i + 1 < argv.length) {
      result.profile = argv[i + 1];
      i += 2;
    } else if (arg === '--confirm') {
      result.confirm = true;
      i++;
    } else if (arg === '--approve') {
      result.approve = true;
      i++;
    } else if (arg === '--date' && i + 1 < argv.length) {
      result.date = argv[i + 1];
      i += 2;
    } else if (arg === '--json' && i + 1 < argv.length) {
      result.json = argv[i + 1];
      i += 2;
    } else if (arg.startsWith('-')) {
      error(`Unknown flag: ${arg}`);
    } else {
      result.positional.push(arg);
      i++;
    }
  }

  return result;
}

function output(data: unknown): void {
  console.log(JSON.stringify(data, null, 2));
}

function error(message: string, exitCode = 1): never {
  console.error(JSON.stringify({ error: message }));
  process.exit(exitCode);
}

function previewDestructive(action: string, details: Record<string, unknown>): never {
  console.log(
    JSON.stringify(
      {
        preview: true,
        action,
        ...details,
        message: 'Pass --confirm to execute this action.',
      },
      null,
      2,
    ),
  );
  process.exit(2);
}

function parseJsonArg(json: string | undefined): Record<string, unknown> {
  if (!json) error('Missing --json argument with data');
  try {
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    error('Invalid JSON in --json argument');
  }
}

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
type DestructiveAction = 'delete' | 'send' | 'pay' | 'ship-all' | 'clock-in' | 'clock-out' | string;

function requireConfirm(
  confirm: boolean,
  action: DestructiveAction,
  details: Record<string, unknown>,
): void {
  if (!confirm) {
    previewDestructive(action, details);
  }
}

async function run(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const { positional, confirm } = args;

  if (positional.length === 0) {
    error(
      "Usage: go-holded [--profile NAME] <domain> <action> [args...] [--confirm] [--json '...']",
    );
  }

  let client: HoldedClient;
  try {
    client = createClient({ profile: args.profile });
  } catch (e) {
    if (e instanceof HoldedConfigError) {
      error(e.message);
    }
    throw e;
  }

  const domain = positional[0]!;
  const action = positional[1];

  try {
    switch (domain) {
      // --- contacts ---
      case 'contacts': {
        if (action === 'groups') {
          const subAction = positional[2];
          switch (subAction) {
            case 'list':
              output(await client.contacts.groups.list());
              break;
            case 'get':
              output(await client.contacts.groups.get(positional[3] ?? error('Missing group ID')));
              break;
            case 'create':
              output(await client.contacts.groups.create(parseJsonArg(args.json)));
              break;
            case 'update':
              output(
                await client.contacts.groups.update(
                  positional[3] ?? error('Missing group ID'),
                  parseJsonArg(args.json),
                ),
              );
              break;
            case 'delete':
              requireConfirm(confirm, 'delete', { resource: 'contact-group', id: positional[3] });
              output(
                await client.contacts.groups.delete(positional[3] ?? error('Missing group ID')),
              );
              break;
            default:
              error(`Unknown contacts groups action: ${subAction ?? '(none)'}`);
          }
        } else {
          switch (action) {
            case 'list':
              output(await client.contacts.list());
              break;
            case 'get':
              output(await client.contacts.get(positional[2] ?? error('Missing contact ID')));
              break;
            case 'create':
              output(await client.contacts.create(parseJsonArg(args.json)));
              break;
            case 'update':
              output(
                await client.contacts.update(
                  positional[2] ?? error('Missing contact ID'),
                  parseJsonArg(args.json),
                ),
              );
              break;
            case 'delete':
              requireConfirm(confirm, 'delete', { resource: 'contact', id: positional[2] });
              output(await client.contacts.delete(positional[2] ?? error('Missing contact ID')));
              break;
            case 'attachments':
              output(
                await client.contacts.listAttachments(positional[2] ?? error('Missing contact ID')),
              );
              break;
            default:
              error(`Unknown contacts action: ${action ?? '(none)'}`);
          }
        }
        break;
      }

      // --- accounting ---
      case 'accounting': {
        const sub = action;
        const subAction = positional[2];
        switch (sub) {
          case 'expense-accounts':
            switch (subAction) {
              case 'list':
                output(await client.accounting.expenseAccounts.list());
                break;
              case 'get':
                output(
                  await client.accounting.expenseAccounts.get(positional[3] ?? error('Missing ID')),
                );
                break;
              case 'create':
                output(await client.accounting.expenseAccounts.create(parseJsonArg(args.json)));
                break;
              case 'update':
                output(
                  await client.accounting.expenseAccounts.update(
                    positional[3] ?? error('Missing ID'),
                    parseJsonArg(args.json),
                  ),
                );
                break;
              case 'delete':
                requireConfirm(confirm, 'delete', {
                  resource: 'expense-account',
                  id: positional[3],
                });
                output(
                  await client.accounting.expenseAccounts.delete(
                    positional[3] ?? error('Missing ID'),
                  ),
                );
                break;
              default:
                error(`Unknown expense-accounts action: ${subAction ?? '(none)'}`);
            }
            break;
          case 'income-accounts':
            switch (subAction) {
              case 'list':
                output(await client.accounting.incomeAccounts.list());
                break;
              case 'get':
                output(
                  await client.accounting.incomeAccounts.get(positional[3] ?? error('Missing ID')),
                );
                break;
              case 'create':
                output(await client.accounting.incomeAccounts.create(parseJsonArg(args.json)));
                break;
              case 'update':
                output(
                  await client.accounting.incomeAccounts.update(
                    positional[3] ?? error('Missing ID'),
                    parseJsonArg(args.json),
                  ),
                );
                break;
              case 'delete':
                requireConfirm(confirm, 'delete', {
                  resource: 'income-account',
                  id: positional[3],
                });
                output(
                  await client.accounting.incomeAccounts.delete(
                    positional[3] ?? error('Missing ID'),
                  ),
                );
                break;
              default:
                error(`Unknown income-accounts action: ${subAction ?? '(none)'}`);
            }
            break;
          case 'chart':
            switch (subAction) {
              case 'list':
                output(await client.accounting.chartOfAccounts.list());
                break;
              case 'create':
                output(await client.accounting.chartOfAccounts.create(parseJsonArg(args.json)));
                break;
              default:
                error(`Unknown chart action: ${subAction ?? '(none)'}`);
            }
            break;
          case 'ledger':
            switch (subAction) {
              case 'list':
                output(await client.accounting.dailyLedger.list());
                break;
              case 'create':
                output(await client.accounting.dailyLedger.create(parseJsonArg(args.json)));
                break;
              default:
                error(`Unknown ledger action: ${subAction ?? '(none)'}`);
            }
            break;
          default:
            error(
              `Unknown accounting sub-resource: ${sub ?? '(none)'}. ` +
                'Use: expense-accounts, income-accounts, chart, ledger',
            );
        }
        break;
      }

      // --- taxes ---
      case 'taxes': {
        switch (action) {
          case 'list':
            output(await client.taxes.list());
            break;
          default:
            error(`Unknown taxes action: ${action ?? '(none)'}. Taxes is read-only (list).`);
        }
        break;
      }

      // --- cash ---
      case 'cash': {
        const sub = action;
        const subAction = positional[2];
        switch (sub) {
          case 'treasuries':
            switch (subAction) {
              case 'list':
                output(await client.cash.treasuries.list());
                break;
              case 'get':
                output(await client.cash.treasuries.get(positional[3] ?? error('Missing ID')));
                break;
              case 'create':
                output(await client.cash.treasuries.create(parseJsonArg(args.json)));
                break;
              default:
                error(`Unknown treasuries action: ${subAction ?? '(none)'}`);
            }
            break;
          case 'payments':
            switch (subAction) {
              case 'list':
                output(await client.cash.payments.list());
                break;
              case 'get':
                output(await client.cash.payments.get(positional[3] ?? error('Missing ID')));
                break;
              case 'create':
                output(await client.cash.payments.create(parseJsonArg(args.json)));
                break;
              case 'update':
                output(
                  await client.cash.payments.update(
                    positional[3] ?? error('Missing ID'),
                    parseJsonArg(args.json),
                  ),
                );
                break;
              case 'delete':
                requireConfirm(confirm, 'delete', { resource: 'payment', id: positional[3] });
                output(await client.cash.payments.delete(positional[3] ?? error('Missing ID')));
                break;
              default:
                error(`Unknown payments action: ${subAction ?? '(none)'}`);
            }
            break;
          case 'remittances':
            switch (subAction) {
              case 'list':
                output(await client.cash.remittances.list());
                break;
              case 'get':
                output(await client.cash.remittances.get(positional[3] ?? error('Missing ID')));
                break;
              default:
                error(
                  `Unknown remittances action: ${subAction ?? '(none)'}. Remittances are read-only.`,
                );
            }
            break;
          default:
            error(
              `Unknown cash sub-resource: ${sub ?? '(none)'}. Use: treasuries, payments, remittances`,
            );
        }
        break;
      }

      // --- invoicing ---
      case 'invoicing': {
        const sub = action;
        switch (sub) {
          case 'documents': {
            const subAction = positional[2];
            const docType = positional[3] as DocType | undefined;
            switch (subAction) {
              case 'list':
                if (!docType || !DOC_TYPES.has(docType))
                  error(`Missing or invalid docType. Use: ${[...DOC_TYPES].join(', ')}`);
                output(await client.invoicing.documents.list(docType));
                break;
              case 'get':
                if (!docType || !DOC_TYPES.has(docType))
                  error(`Missing or invalid docType. Use: ${[...DOC_TYPES].join(', ')}`);
                output(
                  await client.invoicing.documents.get(
                    docType,
                    positional[4] ?? error('Missing document ID'),
                  ),
                );
                break;
              case 'create': {
                if (!docType || !DOC_TYPES.has(docType))
                  error(`Missing or invalid docType. Use: ${[...DOC_TYPES].join(', ')}`);
                const createData = parseJsonArg(args.json);
                applyApproveDocGate(createData, args.approve, args.confirm, (msg) => {
                  process.stderr.write(JSON.stringify({ warning: msg }) + '\n');
                });
                output(await client.invoicing.documents.create(docType, createData));
                break;
              }
              case 'update':
                if (!docType || !DOC_TYPES.has(docType))
                  error(`Missing or invalid docType. Use: ${[...DOC_TYPES].join(', ')}`);
                output(
                  await client.invoicing.documents.update(
                    docType,
                    positional[4] ?? error('Missing document ID'),
                    parseJsonArg(args.json),
                  ),
                );
                break;
              case 'delete':
                if (!docType || !DOC_TYPES.has(docType))
                  error(`Missing or invalid docType. Use: ${[...DOC_TYPES].join(', ')}`);
                requireConfirm(confirm, 'delete', {
                  resource: 'document',
                  docType,
                  id: positional[4],
                });
                output(
                  await client.invoicing.documents.delete(
                    docType,
                    positional[4] ?? error('Missing document ID'),
                  ),
                );
                break;
              case 'pdf':
                if (!docType || !DOC_TYPES.has(docType))
                  error(`Missing or invalid docType. Use: ${[...DOC_TYPES].join(', ')}`);
                {
                  const buf = await client.invoicing.documents.pdf(
                    docType,
                    positional[4] ?? error('Missing document ID'),
                  );
                  const b64 = Buffer.from(buf).toString('base64');
                  output({ pdf: b64, encoding: 'base64' });
                }
                break;
              case 'send':
                if (!docType || !DOC_TYPES.has(docType))
                  error(`Missing or invalid docType. Use: ${[...DOC_TYPES].join(', ')}`);
                requireConfirm(confirm, 'send', {
                  resource: 'document',
                  docType,
                  id: positional[4],
                });
                output(
                  await client.invoicing.documents.send(
                    docType,
                    positional[4] ?? error('Missing document ID'),
                    args.json ? parseJsonArg(args.json) : undefined,
                  ),
                );
                break;
              case 'pay':
                if (!docType || !DOC_TYPES.has(docType))
                  error(`Missing or invalid docType. Use: ${[...DOC_TYPES].join(', ')}`);
                requireConfirm(confirm, 'pay', {
                  resource: 'document',
                  docType,
                  id: positional[4],
                });
                output(
                  await client.invoicing.documents.pay(
                    docType,
                    positional[4] ?? error('Missing document ID'),
                    parseJsonArg(args.json),
                  ),
                );
                break;
              case 'ship-all':
                if (!docType || !DOC_TYPES.has(docType))
                  error(`Missing or invalid docType. Use: ${[...DOC_TYPES].join(', ')}`);
                requireConfirm(confirm, 'ship-all', {
                  resource: 'document',
                  docType,
                  id: positional[4],
                });
                output(
                  await client.invoicing.documents.shipAll(
                    docType,
                    positional[4] ?? error('Missing document ID'),
                  ),
                );
                break;
              case 'duplicate': {
                if (!docType || !DOC_TYPES.has(docType))
                  error(`Missing or invalid docType. Use: ${[...DOC_TYPES].join(', ')}`);
                const sourceId = positional[4] ?? error('Missing source document ID');
                const dateStr = args.date ?? error('--date YYYY-MM-DD is required for duplicate');
                let dateTs: number;
                try {
                  dateTs = parseDateArg(dateStr);
                } catch (e) {
                  error(String(e));
                }

                // Warn if approveDoc sneaked into --json overrides
                const overrides = args.json ? parseJsonArg(args.json) : undefined;
                if (overrides?.['approveDoc'] === true) {
                  process.stderr.write(
                    JSON.stringify({
                      warning:
                        'approveDoc: true in --json was ignored. ' +
                        'Pass --approve --confirm to approve immediately (irreversible).',
                    }) + '\n',
                  );
                  delete overrides['approveDoc'];
                }

                output(
                  await client.invoicing.documents.duplicate(docType, sourceId, {
                    date: dateTs,
                    overrides,
                    approve: args.approve && args.confirm,
                  }),
                );
                break;
              }
              default:
                error(
                  `Unknown documents action: ${subAction ?? '(none)'}. ` +
                    'Use: list, get, create, update, delete, pdf, send, pay, ship-all, duplicate',
                );
            }
            break;
          }
          case 'numbering-series': {
            const subAction = positional[2];
            switch (subAction) {
              case 'list': {
                const docType = positional[3] as DocType | undefined;
                if (!docType || !DOC_TYPES.has(docType))
                  error(`Missing or invalid docType. Use: ${[...DOC_TYPES].join(', ')}`);
                output(await client.invoicing.numberingSeries.list(docType));
                break;
              }
              case 'create':
                output(await client.invoicing.numberingSeries.create(parseJsonArg(args.json)));
                break;
              case 'update':
                output(
                  await client.invoicing.numberingSeries.update(
                    positional[3] ?? error('Missing ID'),
                    parseJsonArg(args.json),
                  ),
                );
                break;
              case 'delete':
                requireConfirm(confirm, 'delete', {
                  resource: 'numbering-serie',
                  id: positional[3],
                });
                output(
                  await client.invoicing.numberingSeries.delete(
                    positional[3] ?? error('Missing ID'),
                  ),
                );
                break;
              default:
                error(`Unknown numbering-series action: ${subAction ?? '(none)'}`);
            }
            break;
          }
          case 'services': {
            const subAction = positional[2];
            switch (subAction) {
              case 'list':
                output(await client.invoicing.services.list());
                break;
              case 'get':
                output(await client.invoicing.services.get(positional[3] ?? error('Missing ID')));
                break;
              case 'create':
                output(await client.invoicing.services.create(parseJsonArg(args.json)));
                break;
              case 'update':
                output(
                  await client.invoicing.services.update(
                    positional[3] ?? error('Missing ID'),
                    parseJsonArg(args.json),
                  ),
                );
                break;
              case 'delete':
                requireConfirm(confirm, 'delete', { resource: 'service', id: positional[3] });
                output(
                  await client.invoicing.services.delete(positional[3] ?? error('Missing ID')),
                );
                break;
              default:
                error(`Unknown services action: ${subAction ?? '(none)'}`);
            }
            break;
          }
          case 'payment-methods':
            output(await client.invoicing.paymentMethods.list());
            break;
          default:
            error(
              `Unknown invoicing sub-resource: ${sub ?? '(none)'}. ` +
                'Use: documents, numbering-series, services, payment-methods',
            );
        }
        break;
      }

      // --- stock ---
      case 'stock': {
        const sub = action;
        const subAction = positional[2];
        switch (sub) {
          case 'products':
            switch (subAction) {
              case 'list':
                output(await client.stock.products.list());
                break;
              case 'get':
                output(await client.stock.products.get(positional[3] ?? error('Missing ID')));
                break;
              case 'create':
                output(await client.stock.products.create(parseJsonArg(args.json)));
                break;
              case 'update':
                output(
                  await client.stock.products.update(
                    positional[3] ?? error('Missing ID'),
                    parseJsonArg(args.json),
                  ),
                );
                break;
              case 'delete':
                requireConfirm(confirm, 'delete', { resource: 'product', id: positional[3] });
                output(await client.stock.products.delete(positional[3] ?? error('Missing ID')));
                break;
              case 'update-stock':
                output(
                  await client.stock.products.updateStock(
                    positional[3] ?? error('Missing ID'),
                    parseJsonArg(args.json),
                  ),
                );
                break;
              default:
                error(`Unknown products action: ${subAction ?? '(none)'}`);
            }
            break;
          case 'warehouses':
            switch (subAction) {
              case 'list':
                output(await client.stock.warehouses.list());
                break;
              case 'get':
                output(await client.stock.warehouses.get(positional[3] ?? error('Missing ID')));
                break;
              case 'create':
                output(await client.stock.warehouses.create(parseJsonArg(args.json)));
                break;
              case 'update':
                output(
                  await client.stock.warehouses.update(
                    positional[3] ?? error('Missing ID'),
                    parseJsonArg(args.json),
                  ),
                );
                break;
              case 'delete':
                requireConfirm(confirm, 'delete', { resource: 'warehouse', id: positional[3] });
                output(await client.stock.warehouses.delete(positional[3] ?? error('Missing ID')));
                break;
              case 'stock':
                output(
                  await client.stock.warehouses.listStock(positional[3] ?? error('Missing ID')),
                );
                break;
              default:
                error(`Unknown warehouses action: ${subAction ?? '(none)'}`);
            }
            break;
          default:
            error(`Unknown stock sub-resource: ${sub ?? '(none)'}. Use: products, warehouses`);
        }
        break;
      }

      // --- team ---
      case 'team': {
        const sub = action;
        const subAction = positional[2];
        switch (sub) {
          case 'employees':
            switch (subAction) {
              case 'list':
                output(await client.team.employees.list());
                break;
              case 'get':
                output(await client.team.employees.get(positional[3] ?? error('Missing ID')));
                break;
              case 'create':
                output(await client.team.employees.create(parseJsonArg(args.json)));
                break;
              case 'update':
                output(
                  await client.team.employees.update(
                    positional[3] ?? error('Missing ID'),
                    parseJsonArg(args.json),
                  ),
                );
                break;
              case 'delete':
                requireConfirm(confirm, 'delete', { resource: 'employee', id: positional[3] });
                output(await client.team.employees.delete(positional[3] ?? error('Missing ID')));
                break;
              case 'clock-in':
                requireConfirm(confirm, 'clock-in', { employeeId: positional[3] });
                output(await client.team.employees.clockIn(positional[3] ?? error('Missing ID')));
                break;
              case 'clock-out':
                requireConfirm(confirm, 'clock-out', { employeeId: positional[3] });
                output(await client.team.employees.clockOut(positional[3] ?? error('Missing ID')));
                break;
              case 'pause':
                requireConfirm(confirm, 'pause', { employeeId: positional[3] });
                output(await client.team.employees.pause(positional[3] ?? error('Missing ID')));
                break;
              case 'unpause':
                requireConfirm(confirm, 'unpause', { employeeId: positional[3] });
                output(await client.team.employees.unpause(positional[3] ?? error('Missing ID')));
                break;
              default:
                error(`Unknown employees action: ${subAction ?? '(none)'}`);
            }
            break;
          case 'time-tracking': {
            switch (subAction) {
              case 'list':
                output(await client.team.timeTracking.list());
                break;
              case 'get':
                output(await client.team.timeTracking.get(positional[3] ?? error('Missing ID')));
                break;
              case 'update':
                output(
                  await client.team.timeTracking.update(
                    positional[3] ?? error('Missing ID'),
                    parseJsonArg(args.json),
                  ),
                );
                break;
              case 'delete':
                requireConfirm(confirm, 'delete', { resource: 'time-tracking', id: positional[3] });
                output(await client.team.timeTracking.delete(positional[3] ?? error('Missing ID')));
                break;
              case 'by-employee':
                output(
                  await client.team.timeTracking.listByEmployee(
                    positional[3] ?? error('Missing employee ID'),
                  ),
                );
                break;
              default:
                error(`Unknown time-tracking action: ${subAction ?? '(none)'}`);
            }
            break;
          }
          default:
            error(`Unknown team sub-resource: ${sub ?? '(none)'}. Use: employees, time-tracking`);
        }
        break;
      }

      // --- crm ---
      case 'crm': {
        const sub = action;
        const subAction = positional[2];
        switch (sub) {
          case 'funnels':
            switch (subAction) {
              case 'list':
                output(await client.crm.funnels.list());
                break;
              case 'get':
                output(await client.crm.funnels.get(positional[3] ?? error('Missing ID')));
                break;
              case 'create':
                output(await client.crm.funnels.create(parseJsonArg(args.json)));
                break;
              case 'update':
                output(
                  await client.crm.funnels.update(
                    positional[3] ?? error('Missing ID'),
                    parseJsonArg(args.json),
                  ),
                );
                break;
              case 'delete':
                requireConfirm(confirm, 'delete', { resource: 'funnel', id: positional[3] });
                output(await client.crm.funnels.delete(positional[3] ?? error('Missing ID')));
                break;
              default:
                error(`Unknown funnels action: ${subAction ?? '(none)'}`);
            }
            break;
          case 'leads':
            switch (subAction) {
              case 'list':
                output(await client.crm.leads.list());
                break;
              case 'get':
                output(await client.crm.leads.get(positional[3] ?? error('Missing ID')));
                break;
              case 'create':
                output(await client.crm.leads.create(parseJsonArg(args.json)));
                break;
              case 'update':
                output(
                  await client.crm.leads.update(
                    positional[3] ?? error('Missing ID'),
                    parseJsonArg(args.json),
                  ),
                );
                break;
              case 'delete':
                requireConfirm(confirm, 'delete', { resource: 'lead', id: positional[3] });
                output(await client.crm.leads.delete(positional[3] ?? error('Missing ID')));
                break;
              case 'add-note':
                output(
                  await client.crm.leads.addNote(
                    positional[3] ?? error('Missing lead ID'),
                    parseJsonArg(args.json),
                  ),
                );
                break;
              case 'update-note':
                output(
                  await client.crm.leads.updateNote(
                    positional[3] ?? error('Missing lead ID'),
                    parseJsonArg(args.json),
                  ),
                );
                break;
              case 'add-task':
                output(
                  await client.crm.leads.addTask(
                    positional[3] ?? error('Missing lead ID'),
                    parseJsonArg(args.json),
                  ),
                );
                break;
              case 'update-stage':
                output(
                  await client.crm.leads.updateStage(
                    positional[3] ?? error('Missing lead ID'),
                    parseJsonArg(args.json),
                  ),
                );
                break;
              default:
                error(`Unknown leads action: ${subAction ?? '(none)'}`);
            }
            break;
          case 'events':
            switch (subAction) {
              case 'list':
                output(await client.crm.events.list());
                break;
              case 'get':
                output(await client.crm.events.get(positional[3] ?? error('Missing ID')));
                break;
              case 'create':
                output(await client.crm.events.create(parseJsonArg(args.json)));
                break;
              case 'update':
                output(
                  await client.crm.events.update(
                    positional[3] ?? error('Missing ID'),
                    parseJsonArg(args.json),
                  ),
                );
                break;
              case 'delete':
                requireConfirm(confirm, 'delete', { resource: 'event', id: positional[3] });
                output(await client.crm.events.delete(positional[3] ?? error('Missing ID')));
                break;
              default:
                error(`Unknown events action: ${subAction ?? '(none)'}`);
            }
            break;
          case 'bookings':
            switch (subAction) {
              case 'list':
                output(await client.crm.bookings.list());
                break;
              case 'get':
                output(await client.crm.bookings.get(positional[3] ?? error('Missing ID')));
                break;
              case 'create':
                output(await client.crm.bookings.create(parseJsonArg(args.json)));
                break;
              case 'update':
                output(
                  await client.crm.bookings.update(
                    positional[3] ?? error('Missing ID'),
                    parseJsonArg(args.json),
                  ),
                );
                break;
              case 'delete':
                requireConfirm(confirm, 'delete', { resource: 'booking', id: positional[3] });
                output(await client.crm.bookings.delete(positional[3] ?? error('Missing ID')));
                break;
              case 'locations':
                output(await client.crm.bookings.listLocations());
                break;
              case 'slots':
                output(
                  await client.crm.bookings.getAvailableSlots(
                    positional[3] ?? error('Missing location ID'),
                  ),
                );
                break;
              default:
                error(`Unknown bookings action: ${subAction ?? '(none)'}`);
            }
            break;
          default:
            error(
              `Unknown CRM sub-resource: ${sub ?? '(none)'}. Use: funnels, leads, events, bookings`,
            );
        }
        break;
      }

      // --- projects ---
      case 'projects': {
        const sub = action;
        const subAction = positional[2];
        switch (sub) {
          case 'list':
            output(await client.projects.projects.list());
            break;
          case 'get':
            output(
              await client.projects.projects.get(positional[2] ?? error('Missing project ID')),
            );
            break;
          case 'create':
            output(await client.projects.projects.create(parseJsonArg(args.json)));
            break;
          case 'update':
            output(
              await client.projects.projects.update(
                positional[2] ?? error('Missing project ID'),
                parseJsonArg(args.json),
              ),
            );
            break;
          case 'delete':
            requireConfirm(confirm, 'delete', { resource: 'project', id: positional[2] });
            output(
              await client.projects.projects.delete(positional[2] ?? error('Missing project ID')),
            );
            break;
          case 'summary':
            output(
              await client.projects.projects.getSummary(
                positional[2] ?? error('Missing project ID'),
              ),
            );
            break;
          case 'tasks':
            switch (subAction) {
              case 'list':
                output(await client.projects.tasks.list());
                break;
              case 'get':
                output(await client.projects.tasks.get(positional[3] ?? error('Missing task ID')));
                break;
              case 'create':
                output(await client.projects.tasks.create(parseJsonArg(args.json)));
                break;
              case 'delete':
                requireConfirm(confirm, 'delete', { resource: 'task', id: positional[3] });
                output(
                  await client.projects.tasks.delete(positional[3] ?? error('Missing task ID')),
                );
                break;
              default:
                error(`Unknown tasks action: ${subAction ?? '(none)'}`);
            }
            break;
          case 'times':
            switch (subAction) {
              case 'list':
                output(await client.projects.timeTracking.listAll());
                break;
              case 'by-project':
                output(
                  await client.projects.timeTracking.list(
                    positional[3] ?? error('Missing project ID'),
                  ),
                );
                break;
              default:
                error(`Unknown times action: ${subAction ?? '(none)'}`);
            }
            break;
          default:
            error(
              `Unknown projects action: ${sub ?? '(none)'}. ` +
                'Use: list, get, create, update, delete, summary, tasks, times',
            );
        }
        break;
      }

      default:
        error(
          `Unknown domain: ${domain}. ` +
            'Use: contacts, accounting, taxes, cash, invoicing, stock, team, crm, projects',
        );
    }
  } catch (e) {
    if (e instanceof HoldedError) {
      output({
        error: e.name,
        message: e.message,
        statusCode: e.statusCode,
        response: e.response,
      });
      process.exit(1);
    }
    throw e;
  }
}

run().catch((e: unknown) => {
  console.error(JSON.stringify({ error: 'UNEXPECTED', message: String(e) }));
  process.exit(1);
});

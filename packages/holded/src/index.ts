/**
 * @marcfargas/go-holded — Holded API made easy.
 *
 * Library + CLI for invoicing, CRM, accounting, projects, and team management.
 * Designed for AI agents and programmatic use.
 *
 * @example
 * ```typescript
 * import { createClient } from '@marcfargas/go-holded';
 *
 * const client = createClient({ profile: 'acme' });
 * const contacts = await client.contacts.list();
 * const invoices = await client.invoicing.documents.list('invoice');
 * ```
 */

// Client
export { createClient, resolveApiKey } from './client.js';
export type { HoldedClient } from './client.js';

// Types
export type {
  ClientOptions,
  ListParams,
  CrudResource,
  ReadOnlyResource,
  ListOnlyResource,
  DocType,
} from './types.js';
export { DOC_TYPES } from './types.js';

// Errors
export {
  HoldedError,
  HoldedAuthError,
  HoldedNotFoundError,
  HoldedRateLimitError,
  HoldedConfigError,
} from './errors.js';

// Domain types (re-export for convenience)
export type { Contact, ContactAttachment, ContactGroup, ContactsDomain } from './contacts/index.js';
export type {
  ExpenseAccount,
  IncomeAccount,
  AccountingAccount,
  LedgerEntry,
  AccountingDomain,
} from './accounting/index.js';
export type { Tax, TaxesDomain } from './taxes/index.js';
export type { Treasury, Payment, Remittance, CashDomain } from './cash/index.js';
export type {
  Document,
  NumberingSerie,
  Service,
  PaymentMethod,
  InvoicingDomain,
} from './invoicing/index.js';
export type {
  Product,
  ProductImage,
  Warehouse,
  WarehouseStock,
  StockDomain,
} from './stock/index.js';
export type { Employee, EmployeeTime, TeamDomain } from './team/index.js';
export type {
  Funnel,
  Lead,
  CrmEvent,
  Booking,
  BookingLocation,
  BookingSlot,
  CrmDomain,
} from './crm/index.js';
export type {
  Project,
  ProjectSummary,
  ProjectTask,
  ProjectTime,
  ProjectsDomain,
} from './projects/index.js';

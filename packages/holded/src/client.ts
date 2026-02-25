/**
 * HoldedClient — main entry point for the library.
 *
 * Creates a configured client with all domain accessors.
 * Supports multi-tenant via profiles (env var naming convention).
 */

import { HttpClient } from './http.js';
import { HoldedConfigError } from './errors.js';
import type { ClientOptions } from './types.js';
import { createContactsDomain } from './contacts/index.js';
import type { ContactsDomain } from './contacts/index.js';
import { createAccountingDomain } from './accounting/index.js';
import type { AccountingDomain } from './accounting/index.js';
import { createTaxesDomain } from './taxes/index.js';
import type { TaxesDomain } from './taxes/index.js';
import { createCashDomain } from './cash/index.js';
import type { CashDomain } from './cash/index.js';
import { createInvoicingDomain } from './invoicing/index.js';
import type { InvoicingDomain } from './invoicing/index.js';
import { createStockDomain } from './stock/index.js';
import type { StockDomain } from './stock/index.js';
import { createTeamDomain } from './team/index.js';
import type { TeamDomain } from './team/index.js';
import { createCrmDomain } from './crm/index.js';
import type { CrmDomain } from './crm/index.js';
import { createProjectsDomain } from './projects/index.js';
import type { ProjectsDomain } from './projects/index.js';

export interface HoldedClient {
  /** Contacts and contact groups. */
  contacts: ContactsDomain;
  /** Accounting: expense accounts (6xxx), income accounts (7xxx), chart of accounts, daily ledger. */
  accounting: AccountingDomain;
  /** Tax configuration. */
  taxes: TaxesDomain;
  /** Cash management: treasuries, payments, remittances. */
  cash: CashDomain;
  /** Invoicing: documents, numbering series, services, payment methods. */
  invoicing: InvoicingDomain;
  /** Stock: products and warehouses. */
  stock: StockDomain;
  /** Team: employees and time tracking. */
  team: TeamDomain;
  /** CRM: funnels, leads, events, bookings. */
  crm: CrmDomain;
  /** Projects: projects, tasks, time tracking. */
  projects: ProjectsDomain;
}

/**
 * Resolve the API key from options or environment.
 *
 * Priority:
 * 1. Explicit `apiKey` option
 * 2. `HOLDED_API_KEY_<PROFILE>` env var (when profile is set)
 * 3. `HOLDED_API_KEY` env var
 */
export function resolveApiKey(options: ClientOptions = {}): string {
  if (options.apiKey) {
    return options.apiKey;
  }

  if (options.profile) {
    const profileKey = `HOLDED_API_KEY_${options.profile.toUpperCase().replace(/-/g, '_')}`;
    const value = process.env[profileKey];
    if (!value) {
      throw new HoldedConfigError(
        `No API key found for profile "${options.profile}". ` +
          `Set the ${profileKey} environment variable.`,
      );
    }
    return value;
  }

  const defaultKey = process.env['HOLDED_API_KEY'];
  if (!defaultKey) {
    throw new HoldedConfigError(
      'No API key found. Set HOLDED_API_KEY environment variable, ' +
        'pass apiKey option, or use a profile.',
    );
  }
  return defaultKey;
}

/**
 * Create a Holded API client.
 *
 * @example
 * ```typescript
 * // Default — reads HOLDED_API_KEY env var
 * const client = createClient();
 *
 * // With profile — reads HOLDED_API_KEY_ACME env var
 * const client = createClient({ profile: 'acme' });
 *
 * // Explicit key (for testing)
 * const client = createClient({ apiKey: 'xxx' });
 * ```
 */
export function createClient(options: ClientOptions = {}): HoldedClient {
  const apiKey = resolveApiKey(options);
  const baseUrl = options.baseUrl ?? process.env['HOLDED_API_URL'];
  const http = new HttpClient({ apiKey, baseUrl });

  return {
    contacts: createContactsDomain(http),
    accounting: createAccountingDomain(http),
    taxes: createTaxesDomain(http),
    cash: createCashDomain(http),
    invoicing: createInvoicingDomain(http),
    stock: createStockDomain(http),
    team: createTeamDomain(http),
    crm: createCrmDomain(http),
    projects: createProjectsDomain(http),
  };
}

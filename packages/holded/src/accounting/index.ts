import type { HttpClient } from '../http.js';
import type { CrudResource } from '../types.js';
import { createExpenseAccountsResource } from './expense-accounts.js';
import type { ExpenseAccount } from './expense-accounts.js';
import { createIncomeAccountsResource } from './income-accounts.js';
import type { IncomeAccount } from './income-accounts.js';
import { createChartOfAccountsResource } from './chart-of-accounts.js';
import type { ChartOfAccountsResource } from './chart-of-accounts.js';
import { createDailyLedgerResource } from './daily-ledger.js';
import type { DailyLedgerResource } from './daily-ledger.js';

export type { ExpenseAccount } from './expense-accounts.js';
export type { IncomeAccount } from './income-accounts.js';
export type { AccountingAccount, ChartOfAccountsResource } from './chart-of-accounts.js';
export type { LedgerEntry, DailyLedgerResource } from './daily-ledger.js';

export interface AccountingDomain {
  /** Expense accounting accounts (6xxx). Holded API: "Expenses Accounts". */
  expenseAccounts: CrudResource<ExpenseAccount>;
  /** Income accounting accounts (7xxx). Holded API: "Sales Channels". */
  incomeAccounts: CrudResource<IncomeAccount>;
  /** Chart of accounts from the Accounting API. */
  chartOfAccounts: ChartOfAccountsResource;
  /** Daily ledger entries from the Accounting API. */
  dailyLedger: DailyLedgerResource;
}

export function createAccountingDomain(http: HttpClient): AccountingDomain {
  return {
    expenseAccounts: createExpenseAccountsResource(http),
    incomeAccounts: createIncomeAccountsResource(http),
    chartOfAccounts: createChartOfAccountsResource(http),
    dailyLedger: createDailyLedgerResource(http),
  };
}

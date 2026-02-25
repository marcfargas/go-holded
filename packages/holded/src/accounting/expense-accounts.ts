import type { HttpClient } from '../http.js';
import type { CrudResource } from '../types.js';
import { createCrudResource } from '../crud.js';

/** Holded API path: "Expenses Accounts" — really expense accounting accounts (6xxx). */
const BASE_PATH = '/invoicing/v1/expensesaccounts';

export interface ExpenseAccount {
  id: string;
  name: string;
  [key: string]: unknown;
}

export function createExpenseAccountsResource(http: HttpClient): CrudResource<ExpenseAccount> {
  return createCrudResource<ExpenseAccount>(http, BASE_PATH);
}

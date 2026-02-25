import type { HttpClient } from '../http.js';
import type { CrudResource } from '../types.js';
import { createCrudResource } from '../crud.js';

/** Holded API path: "Sales Channels" — really income accounting accounts (7xxx). */
const BASE_PATH = '/invoicing/v1/saleschannels';

export interface IncomeAccount {
  id: string;
  name: string;
  [key: string]: unknown;
}

export function createIncomeAccountsResource(http: HttpClient): CrudResource<IncomeAccount> {
  return createCrudResource<IncomeAccount>(http, BASE_PATH);
}

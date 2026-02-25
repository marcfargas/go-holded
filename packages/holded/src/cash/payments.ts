import type { HttpClient } from '../http.js';
import type { CrudResource } from '../types.js';
import { createCrudResource } from '../crud.js';

const BASE_PATH = '/invoicing/v1/payments';

export interface Payment {
  id: string;
  [key: string]: unknown;
}

export function createPaymentsResource(http: HttpClient): CrudResource<Payment> {
  return createCrudResource<Payment>(http, BASE_PATH);
}

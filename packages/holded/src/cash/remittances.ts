import type { HttpClient } from '../http.js';
import type { ReadOnlyResource } from '../types.js';
import { createReadOnlyResource } from '../crud.js';

const BASE_PATH = '/invoicing/v1/remittances';

export interface Remittance {
  id: string;
  [key: string]: unknown;
}

export function createRemittancesResource(http: HttpClient): ReadOnlyResource<Remittance> {
  return createReadOnlyResource<Remittance>(http, BASE_PATH);
}

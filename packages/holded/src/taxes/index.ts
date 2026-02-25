import type { HttpClient } from '../http.js';
import type { ListOnlyResource } from '../types.js';
import { createListOnlyResource } from '../crud.js';

const BASE_PATH = '/invoicing/v1/taxes';

export interface Tax {
  id: string;
  name: string;
  percentage?: number;
  [key: string]: unknown;
}

export type TaxesDomain = ListOnlyResource<Tax>;

export function createTaxesDomain(http: HttpClient): TaxesDomain {
  return createListOnlyResource<Tax>(http, BASE_PATH);
}

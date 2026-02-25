import type { HttpClient } from '../http.js';
import type { CrudResource } from '../types.js';
import { createCrudResource } from '../crud.js';

const BASE_PATH = '/crm/v1/funnels';

export interface Funnel {
  id: string;
  name: string;
  [key: string]: unknown;
}

export function createFunnelsResource(http: HttpClient): CrudResource<Funnel> {
  return createCrudResource<Funnel>(http, BASE_PATH);
}

import type { HttpClient } from '../http.js';
import type { CrudResource } from '../types.js';
import { createCrudResource } from '../crud.js';

const BASE_PATH = '/invoicing/v1/services';

export interface Service {
  id: string;
  name: string;
  [key: string]: unknown;
}

export function createServicesResource(http: HttpClient): CrudResource<Service> {
  return createCrudResource<Service>(http, BASE_PATH);
}

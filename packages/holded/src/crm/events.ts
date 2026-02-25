import type { HttpClient } from '../http.js';
import type { CrudResource } from '../types.js';
import { createCrudResource } from '../crud.js';

const BASE_PATH = '/crm/v1/events';

export interface CrmEvent {
  id: string;
  name: string;
  [key: string]: unknown;
}

export function createEventsResource(http: HttpClient): CrudResource<CrmEvent> {
  return createCrudResource<CrmEvent>(http, BASE_PATH);
}

import type { HttpClient } from '../http.js';
import type { CrudResource } from '../types.js';
import { createCrudResource } from '../crud.js';

const BASE_PATH = '/invoicing/v1/contactgroups';

export interface ContactGroup {
  id: string;
  name: string;
  [key: string]: unknown;
}

export function createContactGroupsResource(http: HttpClient): CrudResource<ContactGroup> {
  return createCrudResource<ContactGroup>(http, BASE_PATH);
}

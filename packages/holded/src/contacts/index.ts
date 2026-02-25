import type { HttpClient } from '../http.js';
import type { CrudResource } from '../types.js';
import { createContactsResource } from './contacts.js';
import type { ContactsResource } from './contacts.js';
import { createContactGroupsResource } from './contact-groups.js';
import type { ContactGroup } from './contact-groups.js';

export type { Contact, ContactAttachment, ContactsResource } from './contacts.js';
export type { ContactGroup } from './contact-groups.js';

export interface ContactsDomain extends ContactsResource {
  groups: CrudResource<ContactGroup>;
}

export function createContactsDomain(http: HttpClient): ContactsDomain {
  const contacts = createContactsResource(http);
  const groups = createContactGroupsResource(http);

  return {
    ...contacts,
    groups,
  };
}

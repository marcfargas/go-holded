import type { HttpClient } from '../http.js';
import type { CrudResource } from '../types.js';
import { createCrudResource } from '../crud.js';

const BASE_PATH = '/invoicing/v1/contacts';

export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  vatnumber?: string;
  type?: string;
  [key: string]: unknown;
}

export interface ContactAttachment {
  id: string;
  name: string;
  [key: string]: unknown;
}

export interface ContactsResource extends CrudResource<Contact> {
  listAttachments(contactId: string): Promise<ContactAttachment[]>;
  getAttachment(contactId: string, attachmentId: string): Promise<ContactAttachment>;
}

export function createContactsResource(http: HttpClient): ContactsResource {
  const crud = createCrudResource<Contact>(http, BASE_PATH);

  return {
    ...crud,

    async listAttachments(contactId: string): Promise<ContactAttachment[]> {
      return http.get<ContactAttachment[]>(`${BASE_PATH}/${contactId}/attachments`);
    },

    async getAttachment(contactId: string, attachmentId: string): Promise<ContactAttachment> {
      return http.get<ContactAttachment>(`${BASE_PATH}/${contactId}/attachments/${attachmentId}`);
    },
  };
}

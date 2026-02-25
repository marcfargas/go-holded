import type { HttpClient } from '../http.js';
import type { CrudResource } from '../types.js';
import { createCrudResource } from '../crud.js';

const BASE_PATH = '/crm/v1/leads';

export interface Lead {
  id: string;
  name: string;
  contactId?: string;
  funnelId?: string;
  stageId?: string;
  [key: string]: unknown;
}

export interface LeadsResource extends CrudResource<Lead> {
  addNote(leadId: string, data: Record<string, unknown>): Promise<unknown>;
  updateNote(leadId: string, data: Record<string, unknown>): Promise<unknown>;
  addTask(leadId: string, data: Record<string, unknown>): Promise<unknown>;
  updateTask(leadId: string, data: Record<string, unknown>): Promise<unknown>;
  deleteTask(leadId: string, data: Record<string, unknown>): Promise<unknown>;
  updateStage(leadId: string, data: Record<string, unknown>): Promise<unknown>;
  updateCreationDate(leadId: string, data: Record<string, unknown>): Promise<unknown>;
}

export function createLeadsResource(http: HttpClient): LeadsResource {
  const crud = createCrudResource<Lead>(http, BASE_PATH);

  return {
    ...crud,

    async addNote(leadId: string, data: Record<string, unknown>): Promise<unknown> {
      return http.post(`${BASE_PATH}/${leadId}/notes`, data);
    },

    async updateNote(leadId: string, data: Record<string, unknown>): Promise<unknown> {
      return http.put(`${BASE_PATH}/${leadId}/notes`, data);
    },

    async addTask(leadId: string, data: Record<string, unknown>): Promise<unknown> {
      return http.post(`${BASE_PATH}/${leadId}/tasks`, data);
    },

    async updateTask(leadId: string, data: Record<string, unknown>): Promise<unknown> {
      return http.put(`${BASE_PATH}/${leadId}/tasks`, data);
    },

    async deleteTask(leadId: string, _data: Record<string, unknown>): Promise<unknown> {
      return http.del(`${BASE_PATH}/${leadId}/tasks`);
    },

    async updateStage(leadId: string, data: Record<string, unknown>): Promise<unknown> {
      return http.put(`${BASE_PATH}/${leadId}/stages`, data);
    },

    async updateCreationDate(leadId: string, data: Record<string, unknown>): Promise<unknown> {
      return http.put(`${BASE_PATH}/${leadId}/dates`, data);
    },
  };
}

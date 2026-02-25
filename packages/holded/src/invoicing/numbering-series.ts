import type { HttpClient } from '../http.js';
import type { DocType } from '../types.js';
import { DOC_TYPES } from '../types.js';
import { HoldedError } from '../errors.js';

const BASE_PATH = '/invoicing/v1/numberingseries';

export interface NumberingSerie {
  id: string;
  name: string;
  prefix?: string;
  [key: string]: unknown;
}

export interface NumberingSeriesResource {
  list(docType: DocType): Promise<NumberingSerie[]>;
  create(data: Record<string, unknown>): Promise<NumberingSerie>;
  update(id: string, data: Record<string, unknown>): Promise<NumberingSerie>;
  delete(id: string): Promise<unknown>;
}

export function createNumberingSeriesResource(http: HttpClient): NumberingSeriesResource {
  return {
    async list(docType: DocType): Promise<NumberingSerie[]> {
      if (!DOC_TYPES.has(docType)) {
        throw new HoldedError(
          `Invalid docType "${docType}". Must be one of: ${[...DOC_TYPES].join(', ')}`,
        );
      }
      return http.get<NumberingSerie[]>(`${BASE_PATH}/${docType}`);
    },

    async create(data: Record<string, unknown>): Promise<NumberingSerie> {
      return http.post<NumberingSerie>(BASE_PATH, data);
    },

    async update(id: string, data: Record<string, unknown>): Promise<NumberingSerie> {
      return http.put<NumberingSerie>(`${BASE_PATH}/${id}`, data);
    },

    async delete(id: string): Promise<unknown> {
      return http.del(`${BASE_PATH}/${id}`);
    },
  };
}

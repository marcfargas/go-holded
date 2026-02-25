import type { HttpClient } from '../http.js';
import type { ListParams } from '../types.js';

const BASE_PATH = '/invoicing/v1/treasury';

export interface Treasury {
  id: string;
  name: string;
  [key: string]: unknown;
}

export interface TreasuriesResource {
  list(params?: ListParams): Promise<Treasury[]>;
  create(data: Record<string, unknown>): Promise<Treasury>;
  get(id: string): Promise<Treasury>;
}

export function createTreasuriesResource(http: HttpClient): TreasuriesResource {
  return {
    async list(params?: ListParams): Promise<Treasury[]> {
      return http.get<Treasury[]>(BASE_PATH, params as Record<string, string | number | undefined>);
    },
    async create(data: Record<string, unknown>): Promise<Treasury> {
      return http.post<Treasury>(BASE_PATH, data);
    },
    async get(id: string): Promise<Treasury> {
      return http.get<Treasury>(`${BASE_PATH}/${id}`);
    },
  };
}

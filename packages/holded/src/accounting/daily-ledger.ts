import type { HttpClient } from '../http.js';
import type { ListParams } from '../types.js';

const BASE_PATH = '/accounting/v1/dailyledger';

export interface LedgerEntry {
  id: string;
  [key: string]: unknown;
}

export interface DailyLedgerResource {
  list(params?: ListParams): Promise<LedgerEntry[]>;
  create(data: Record<string, unknown>): Promise<LedgerEntry>;
}

export function createDailyLedgerResource(http: HttpClient): DailyLedgerResource {
  return {
    async list(params?: ListParams): Promise<LedgerEntry[]> {
      return http.get<LedgerEntry[]>(
        BASE_PATH,
        params as Record<string, string | number | undefined>,
      );
    },
    async create(data: Record<string, unknown>): Promise<LedgerEntry> {
      return http.post<LedgerEntry>(BASE_PATH, data);
    },
  };
}

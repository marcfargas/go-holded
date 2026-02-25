import type { HttpClient } from '../http.js';
import type { ListParams } from '../types.js';

const BASE_PATH = '/accounting/v1/accounts';

export interface AccountingAccount {
  id: string;
  name: string;
  code?: string;
  [key: string]: unknown;
}

export interface ChartOfAccountsResource {
  list(params?: ListParams): Promise<AccountingAccount[]>;
  create(data: Record<string, unknown>): Promise<AccountingAccount>;
}

export function createChartOfAccountsResource(http: HttpClient): ChartOfAccountsResource {
  return {
    async list(params?: ListParams): Promise<AccountingAccount[]> {
      return http.get<AccountingAccount[]>(
        BASE_PATH,
        params as Record<string, string | number | undefined>,
      );
    },
    async create(data: Record<string, unknown>): Promise<AccountingAccount> {
      return http.post<AccountingAccount>(BASE_PATH, data);
    },
  };
}

import type { HttpClient } from '../http.js';
import type { CrudResource, ReadOnlyResource } from '../types.js';
import { createTreasuriesResource } from './treasuries.js';
import type { TreasuriesResource } from './treasuries.js';
import { createPaymentsResource } from './payments.js';
import type { Payment } from './payments.js';
import { createRemittancesResource } from './remittances.js';
import type { Remittance } from './remittances.js';

export type { Treasury, TreasuriesResource } from './treasuries.js';
export type { Payment } from './payments.js';
export type { Remittance } from './remittances.js';

export interface CashDomain {
  treasuries: TreasuriesResource;
  payments: CrudResource<Payment>;
  remittances: ReadOnlyResource<Remittance>;
}

export function createCashDomain(http: HttpClient): CashDomain {
  return {
    treasuries: createTreasuriesResource(http),
    payments: createPaymentsResource(http),
    remittances: createRemittancesResource(http),
  };
}

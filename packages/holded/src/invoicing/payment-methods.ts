import type { HttpClient } from '../http.js';
import type { ListOnlyResource } from '../types.js';
import { createListOnlyResource } from '../crud.js';

const BASE_PATH = '/invoicing/v1/paymentmethods';

export interface PaymentMethod {
  id: string;
  name: string;
  [key: string]: unknown;
}

export function createPaymentMethodsResource(http: HttpClient): ListOnlyResource<PaymentMethod> {
  return createListOnlyResource<PaymentMethod>(http, BASE_PATH);
}

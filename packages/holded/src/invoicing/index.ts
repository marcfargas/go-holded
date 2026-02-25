import type { HttpClient } from '../http.js';
import type { CrudResource, ListOnlyResource } from '../types.js';
import { createDocumentsResource } from './documents.js';
import type { DocumentsResource } from './documents.js';
import { createNumberingSeriesResource } from './numbering-series.js';
import type { NumberingSeriesResource } from './numbering-series.js';
import { createServicesResource } from './services.js';
import type { Service } from './services.js';
import { createPaymentMethodsResource } from './payment-methods.js';
import type { PaymentMethod } from './payment-methods.js';

export type { Document, DocumentsResource } from './documents.js';
export type { NumberingSerie, NumberingSeriesResource } from './numbering-series.js';
export type { Service } from './services.js';
export type { PaymentMethod } from './payment-methods.js';

export interface InvoicingDomain {
  documents: DocumentsResource;
  numberingSeries: NumberingSeriesResource;
  services: CrudResource<Service>;
  paymentMethods: ListOnlyResource<PaymentMethod>;
}

export function createInvoicingDomain(http: HttpClient): InvoicingDomain {
  return {
    documents: createDocumentsResource(http),
    numberingSeries: createNumberingSeriesResource(http),
    services: createServicesResource(http),
    paymentMethods: createPaymentMethodsResource(http),
  };
}

/**
 * Shared types for the Holded API client.
 */

/** Options for creating a HoldedClient. */
export interface ClientOptions {
  /** Explicit API key. Takes priority over profile/env var. */
  apiKey?: string;
  /** Profile name. Resolves to HOLDED_API_KEY_<PROFILE> env var. */
  profile?: string;
  /** Base URL override (for testing). Default: https://api.holded.com */
  baseUrl?: string;
}

/** Pagination parameters supported by list endpoints. */
export interface ListParams {
  /** Page number (1-indexed). */
  page?: number;
  /** Items per page. */
  limit?: number;
}

/** Standard CRUD resource interface. */
export interface CrudResource<T> {
  list(params?: ListParams): Promise<T[]>;
  get(id: string): Promise<T>;
  create(data: Record<string, unknown>): Promise<T>;
  update(id: string, data: Record<string, unknown>): Promise<T>;
  delete(id: string): Promise<unknown>;
}

/** Read-only resource (list + get only). */
export interface ReadOnlyResource<T> {
  list(params?: ListParams): Promise<T[]>;
  get(id: string): Promise<T>;
}

/** List-only resource (no individual get). */
export interface ListOnlyResource<T> {
  list(params?: ListParams): Promise<T[]>;
}

/** Document types supported by the invoicing API. */
export type DocType =
  | 'invoice'
  | 'salesreceipt'
  | 'creditnote'
  | 'salesorder'
  | 'proforma'
  | 'waybill'
  | 'estimate'
  | 'purchase'
  | 'purchaseorder'
  | 'purchaserefund';

/** Valid document types as a set for runtime validation. */
export const DOC_TYPES: ReadonlySet<string> = new Set<DocType>([
  'invoice',
  'salesreceipt',
  'creditnote',
  'salesorder',
  'proforma',
  'waybill',
  'estimate',
  'purchase',
  'purchaseorder',
  'purchaserefund',
]);

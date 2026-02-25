import type { HttpClient } from '../http.js';
import type { DocType, ListParams } from '../types.js';
import { DOC_TYPES } from '../types.js';
import { HoldedError } from '../errors.js';
import { buildDuplicatePayload } from './duplicate-helpers.js';

const BASE_PATH = '/invoicing/v1/documents';

export interface Document {
  id: string;
  contactId?: string;
  contactName?: string;
  docNumber?: string;
  date?: number;
  dueDate?: number;
  currency?: string;
  total?: number;
  subtotal?: number;
  [key: string]: unknown;
}

/**
 * Options for duplicating a document.
 *
 * The Holded API uses different field names between GET (products/price)
 * and POST (items/subtotal). duplicate() handles this remapping automatically.
 *
 * approveDoc is always false by default — set approve: true only when
 * the user explicitly wants to approve immediately (irreversible).
 */
export interface DocumentDuplicateOptions {
  /** New date as Unix timestamp (UTC seconds). Defaults to today at UTC midnight. */
  date?: number;
  /** Extra fields to merge into the payload after remapping (e.g. notes, desc). */
  overrides?: Record<string, unknown>;
  /**
   * Set approveDoc: true on the new document (IRREVERSIBLE).
   * Approved documents cannot be edited or deleted.
   * Defaults to false.
   */
  approve?: boolean;
}

export interface DocumentsResource {
  list(docType: DocType, params?: ListParams): Promise<Document[]>;
  get(docType: DocType, id: string): Promise<Document>;
  create(docType: DocType, data: Record<string, unknown>): Promise<Document>;
  update(docType: DocType, id: string, data: Record<string, unknown>): Promise<Document>;
  delete(docType: DocType, id: string): Promise<unknown>;
  /**
   * Duplicate a document to a new date.
   *
   * Fetches the source, strips server-managed fields, remaps the
   * Holded GET→POST field name inconsistencies (products→items,
   * price→subtotal, contact→contactId), applies the new date,
   * merges any overrides, and creates the new document as a draft
   * (approveDoc: false) unless options.approve is explicitly true.
   */
  duplicate(docType: DocType, id: string, options?: DocumentDuplicateOptions): Promise<Document>;
  pdf(docType: DocType, id: string): Promise<ArrayBuffer>;
  pay(docType: DocType, id: string, data: Record<string, unknown>): Promise<unknown>;
  send(docType: DocType, id: string, data?: Record<string, unknown>): Promise<unknown>;
  shipAll(docType: DocType, id: string): Promise<unknown>;
  shipByLine(docType: DocType, id: string, data: Record<string, unknown>): Promise<unknown>;
  shippedUnits(docType: DocType, id: string): Promise<unknown>;
  attach(docType: DocType, id: string, data: Record<string, unknown>): Promise<unknown>;
  updateTracking(docType: DocType, id: string, data: Record<string, unknown>): Promise<unknown>;
  updatePipeline(docType: DocType, id: string, data: Record<string, unknown>): Promise<unknown>;
}

function validateDocType(docType: string): asserts docType is DocType {
  if (!DOC_TYPES.has(docType)) {
    throw new HoldedError(
      `Invalid docType "${docType}". Must be one of: ${[...DOC_TYPES].join(', ')}`,
    );
  }
}

export function createDocumentsResource(http: HttpClient): DocumentsResource {
  function docPath(docType: DocType, id?: string): string {
    validateDocType(docType);
    return id ? `${BASE_PATH}/${docType}/${id}` : `${BASE_PATH}/${docType}`;
  }

  return {
    async list(docType: DocType, params?: ListParams): Promise<Document[]> {
      return http.get<Document[]>(
        docPath(docType),
        params as Record<string, string | number | undefined>,
      );
    },

    async get(docType: DocType, id: string): Promise<Document> {
      return http.get<Document>(docPath(docType, id));
    },

    async create(docType: DocType, data: Record<string, unknown>): Promise<Document> {
      return http.post<Document>(docPath(docType), data);
    },

    async duplicate(
      docType: DocType,
      id: string,
      options: DocumentDuplicateOptions = {},
    ): Promise<Document> {
      const source = await this.get(docType, id);
      // Default date: today at UTC midnight
      const dateTs = options.date ?? Math.floor(Date.now() / 86400000) * 86400;
      const payload = buildDuplicatePayload(
        source as Record<string, unknown>,
        dateTs,
        options.overrides,
      );
      // Always explicit — false by default (draft), true only on caller opt-in
      payload['approveDoc'] = options.approve === true;
      return http.post<Document>(docPath(docType), payload);
    },

    async update(docType: DocType, id: string, data: Record<string, unknown>): Promise<Document> {
      return http.put<Document>(docPath(docType, id), data);
    },

    async delete(docType: DocType, id: string): Promise<unknown> {
      return http.del(docPath(docType, id));
    },

    async pdf(docType: DocType, id: string): Promise<ArrayBuffer> {
      validateDocType(docType);
      return http.getRaw(`${BASE_PATH}/${docType}/${id}/pdf`);
    },

    async pay(docType: DocType, id: string, data: Record<string, unknown>): Promise<unknown> {
      return http.post(docPath(docType, id) + '/pay', data);
    },

    async send(docType: DocType, id: string, data?: Record<string, unknown>): Promise<unknown> {
      return http.post(docPath(docType, id) + '/send', data);
    },

    async shipAll(docType: DocType, id: string): Promise<unknown> {
      return http.post(docPath(docType, id) + '/ship');
    },

    async shipByLine(
      docType: DocType,
      id: string,
      data: Record<string, unknown>,
    ): Promise<unknown> {
      return http.post(docPath(docType, id) + '/ship', data);
    },

    async shippedUnits(docType: DocType, id: string): Promise<unknown> {
      return http.get(docPath(docType, id) + '/ship');
    },

    async attach(docType: DocType, id: string, data: Record<string, unknown>): Promise<unknown> {
      return http.post(docPath(docType, id) + '/attach', data);
    },

    async updateTracking(
      docType: DocType,
      id: string,
      data: Record<string, unknown>,
    ): Promise<unknown> {
      return http.post(docPath(docType, id) + '/tracking', data);
    },

    async updatePipeline(
      docType: DocType,
      id: string,
      data: Record<string, unknown>,
    ): Promise<unknown> {
      return http.post(docPath(docType, id) + '/pipeline', data);
    },
  };
}

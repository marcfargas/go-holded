/**
 * Shared helpers for duplicating invoicing documents.
 *
 * These functions are used by both the library (DocumentsResource.duplicate)
 * and the CLI command (invoicing documents duplicate).
 *
 * Background: the Holded API has an inconsistency between GET and POST
 * field names for document line items:
 *
 *   GET  /documents/{docType}/{id}  → products[].price
 *   POST /documents/{docType}       → items[].subtotal
 *
 * Also: GET returns `contact`, POST expects `contactId`.
 *
 * buildDuplicatePayload handles all remapping transparently.
 */

/** Fields returned by the Holded GET API that must not be sent on create. */
export const DOCUMENT_SERVER_FIELDS = new Set([
  'id',
  'docNumber',
  'status',
  'approvedAt',
  'paymentsTotal',
  'paymentsPending',
  'paymentsRefunds',
  'draft',
  'tax',
  'subtotal',
  'total',
  'contactName',
]);

/**
 * Build a duplicate payload from a source document GET response.
 *
 * Strips server-managed fields, remaps:
 *   - contact  → contactId
 *   - products → items  (with price → subtotal in each item)
 *
 * Applies the given date, then merges any caller-supplied overrides.
 *
 * NOTE: approveDoc is NOT set here — callers must set it explicitly.
 * Use applyApproveDocGate (CLI) or set payload.approveDoc = false directly.
 */
export function buildDuplicatePayload(
  source: Record<string, unknown>,
  dateTs: number,
  overrides?: Record<string, unknown>,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  for (const [key, val] of Object.entries(source)) {
    if (!DOCUMENT_SERVER_FIELDS.has(key)) {
      payload[key] = val;
    }
  }

  // Holded GET returns "contact", POST expects "contactId"
  if ('contact' in payload) {
    payload['contactId'] = payload['contact'];
    delete payload['contact'];
  }

  // Holded GET returns "products[].price", POST expects "items[].subtotal"
  if (Array.isArray(payload['products'])) {
    payload['items'] = (payload['products'] as Record<string, unknown>[]).map((p) => {
      const item: Record<string, unknown> = { ...p };
      if ('price' in item) {
        item['subtotal'] = item['price'];
        delete item['price'];
      }
      return item;
    });
    delete payload['products'];
  }

  payload['date'] = dateTs;

  if (overrides) {
    Object.assign(payload, overrides);
  }

  return payload;
}

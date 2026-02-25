import { describe, it, expect, vi } from 'vitest';
import {
  parseDateArg,
  applyApproveDocGate,
  buildDuplicatePayload,
  DOCUMENT_SERVER_FIELDS,
} from '../../src/bin/doc-helpers.js';

// ---------------------------------------------------------------------------
// parseDateArg
// ---------------------------------------------------------------------------

describe('parseDateArg', () => {
  it('parses YYYY-MM-DD as UTC midnight Unix timestamp', () => {
    // 2026-02-28T00:00:00Z — verified against Date.parse
    expect(parseDateArg('2026-02-28')).toBe(1772236800);
  });

  it('passes through a raw integer timestamp unchanged', () => {
    expect(parseDateArg('1769554800')).toBe(1769554800);
  });

  it('throws on an invalid format', () => {
    expect(() => parseDateArg('28-02-2026')).toThrow(/Invalid --date/);
    expect(() => parseDateArg('not-a-date')).toThrow(/Invalid --date/);
    expect(() => parseDateArg('2026/02/28')).toThrow(/Invalid --date/);
  });
});

// ---------------------------------------------------------------------------
// applyApproveDocGate
// ---------------------------------------------------------------------------

describe('applyApproveDocGate', () => {
  it('sets approveDoc: false when neither flag is set', () => {
    const data: Record<string, unknown> = {};
    applyApproveDocGate(data, false, false);
    expect(data['approveDoc']).toBe(false);
  });

  it('sets approveDoc: false when only --approve is set (missing --confirm)', () => {
    const data: Record<string, unknown> = {};
    applyApproveDocGate(data, true, false);
    expect(data['approveDoc']).toBe(false);
  });

  it('sets approveDoc: false when only --confirm is set (missing --approve)', () => {
    const data: Record<string, unknown> = {};
    applyApproveDocGate(data, false, true);
    expect(data['approveDoc']).toBe(false);
  });

  it('sets approveDoc: true only when both --approve and --confirm are set', () => {
    const data: Record<string, unknown> = {};
    applyApproveDocGate(data, true, true);
    expect(data['approveDoc']).toBe(true);
  });

  it('strips approveDoc: true from payload and calls onWarn', () => {
    const data: Record<string, unknown> = { approveDoc: true };
    const onWarn = vi.fn();
    applyApproveDocGate(data, false, false, onWarn);
    expect(data['approveDoc']).toBe(false);
    expect(onWarn).toHaveBeenCalledOnce();
    expect(onWarn.mock.calls[0]![0]).toMatch(/ignored/);
  });

  it('does not call onWarn when approveDoc is not in payload', () => {
    const data: Record<string, unknown> = { contactId: 'c1' };
    const onWarn = vi.fn();
    applyApproveDocGate(data, false, false, onWarn);
    expect(onWarn).not.toHaveBeenCalled();
  });

  it('overrides approveDoc: false in payload with true when both flags present', () => {
    const data: Record<string, unknown> = { approveDoc: false };
    applyApproveDocGate(data, true, true);
    expect(data['approveDoc']).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// buildDuplicatePayload
// ---------------------------------------------------------------------------

const SAMPLE_INVOICE: Record<string, unknown> = {
  id: 'abc123',
  contact: 'contact-id-1',
  contactName: 'Acme Corp',
  docNumber: 'F260001',
  date: 1769554800,
  dueDate: null,
  notes: 'Original notes',
  products: [{ name: 'Service', price: 100, units: 1 }],
  status: 0,
  approvedAt: 1769606024,
  draft: null,
  tax: 21,
  subtotal: 100,
  total: 121,
  paymentsTotal: 0,
  paymentsPending: 121,
  paymentsRefunds: 0,
  currency: 'eur',
  paymentMethodId: 'pm-id',
};

describe('buildDuplicatePayload', () => {
  it('strips all server-managed fields', () => {
    const payload = buildDuplicatePayload(SAMPLE_INVOICE, 1772233200);
    for (const field of DOCUMENT_SERVER_FIELDS) {
      expect(payload).not.toHaveProperty(field);
    }
  });

  it('remaps contact → contactId', () => {
    const payload = buildDuplicatePayload(SAMPLE_INVOICE, 1772233200);
    expect(payload['contactId']).toBe('contact-id-1');
    expect(payload).not.toHaveProperty('contact');
  });

  it('applies the new date', () => {
    const payload = buildDuplicatePayload(SAMPLE_INVOICE, 1772233200);
    expect(payload['date']).toBe(1772233200);
  });

  it('keeps non-server fields intact', () => {
    const payload = buildDuplicatePayload(SAMPLE_INVOICE, 1772233200);
    expect(payload['notes']).toBe('Original notes');
    expect(payload['currency']).toBe('eur');
    expect(payload['paymentMethodId']).toBe('pm-id');
    // products is remapped to items with price→subtotal
    expect(payload['items']).toEqual([{ name: 'Service', subtotal: 100, units: 1 }]);
  });

  it('merges overrides, overriding date if provided', () => {
    const payload = buildDuplicatePayload(SAMPLE_INVOICE, 1772233200, {
      notes: 'Feb copy',
      date: 9999999999,
    });
    expect(payload['notes']).toBe('Feb copy');
    expect(payload['date']).toBe(9999999999);
  });

  it('does not include approveDoc (caller must call applyApproveDocGate)', () => {
    const payload = buildDuplicatePayload(SAMPLE_INVOICE, 1772236800);
    expect(payload).not.toHaveProperty('approveDoc');
  });

  it('remaps products → items and price → subtotal in each item', () => {
    const payload = buildDuplicatePayload(SAMPLE_INVOICE, 1772236800);
    expect(payload).not.toHaveProperty('products');
    const items = payload['items'] as Record<string, unknown>[];
    expect(items).toHaveLength(1);
    expect(items[0]!['name']).toBe('Service');
    expect(items[0]!['subtotal']).toBe(100);
    expect(items[0]!).not.toHaveProperty('price');
  });
});

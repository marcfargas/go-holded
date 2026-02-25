import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createDocumentsResource } from '../../src/invoicing/documents.js';
import type { HttpClient } from '../../src/http.js';
import { HoldedError } from '../../src/errors.js';

function createMockHttp(): HttpClient {
  return {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    del: vi.fn(),
    getRaw: vi.fn(),
  } as unknown as HttpClient;
}

describe('DocumentsResource', () => {
  let http: HttpClient;

  beforeEach(() => {
    http = createMockHttp();
  });

  describe('list', () => {
    it('calls correct path with docType', async () => {
      vi.mocked(http.get).mockResolvedValueOnce([]);

      const docs = createDocumentsResource(http);
      await docs.list('invoice');

      expect(http.get).toHaveBeenCalledWith('/invoicing/v1/documents/invoice', undefined);
    });

    it('rejects invalid docType', async () => {
      const docs = createDocumentsResource(http);

      await expect(docs.list('invalid' as never)).rejects.toThrow(HoldedError);
      await expect(docs.list('invalid' as never)).rejects.toThrow(/Invalid docType/);
    });
  });

  describe('get', () => {
    it('calls correct path with docType and id', async () => {
      vi.mocked(http.get).mockResolvedValueOnce({ id: '123' });

      const docs = createDocumentsResource(http);
      await docs.get('purchase', '123');

      expect(http.get).toHaveBeenCalledWith('/invoicing/v1/documents/purchase/123');
    });
  });

  describe('create', () => {
    it('calls POST with docType and data', async () => {
      vi.mocked(http.post).mockResolvedValueOnce({ id: 'new' });

      const docs = createDocumentsResource(http);
      await docs.create('invoice', { contactId: 'c1' });

      expect(http.post).toHaveBeenCalledWith('/invoicing/v1/documents/invoice', {
        contactId: 'c1',
      });
    });
  });

  describe('pdf', () => {
    it('calls getRaw for PDF download', async () => {
      vi.mocked(http.getRaw).mockResolvedValueOnce(new ArrayBuffer(10));

      const docs = createDocumentsResource(http);
      const result = await docs.pdf('invoice', '123');

      expect(http.getRaw).toHaveBeenCalledWith('/invoicing/v1/documents/invoice/123/pdf');
      expect(result).toBeInstanceOf(ArrayBuffer);
    });
  });

  describe('send', () => {
    it('calls POST on send path', async () => {
      vi.mocked(http.post).mockResolvedValueOnce({ status: 1 });

      const docs = createDocumentsResource(http);
      await docs.send('invoice', '123', { emails: ['a@b.com'] });

      expect(http.post).toHaveBeenCalledWith('/invoicing/v1/documents/invoice/123/send', {
        emails: ['a@b.com'],
      });
    });
  });

  describe('pay', () => {
    it('calls POST on pay path', async () => {
      vi.mocked(http.post).mockResolvedValueOnce({ status: 1 });

      const docs = createDocumentsResource(http);
      await docs.pay('invoice', '123', { amount: 100 });

      expect(http.post).toHaveBeenCalledWith('/invoicing/v1/documents/invoice/123/pay', {
        amount: 100,
      });
    });
  });

  describe('all docTypes are valid', () => {
    const validTypes = [
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
    ] as const;

    it.each(validTypes)('accepts docType "%s"', async (docType) => {
      vi.mocked(http.get).mockResolvedValueOnce([]);

      const docs = createDocumentsResource(http);
      await docs.list(docType);

      expect(http.get).toHaveBeenCalledWith(`/invoicing/v1/documents/${docType}`, undefined);
    });
  });
});

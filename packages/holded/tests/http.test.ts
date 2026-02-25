import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HttpClient } from '../src/http.js';
import {
  HoldedAuthError,
  HoldedNotFoundError,
  HoldedRateLimitError,
  HoldedError,
} from '../src/errors.js';

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('HttpClient', () => {
  let http: HttpClient;

  beforeEach(() => {
    mockFetch.mockReset();
    http = new HttpClient({ apiKey: 'test-key', baseUrl: 'https://api.test.com/api' });
  });

  describe('GET', () => {
    it('sends GET request with key header', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse([{ id: '1', name: 'Test' }]));

      const result = await http.get('/v1/contacts');

      expect(mockFetch).toHaveBeenCalledOnce();
      const [url, init] = mockFetch.mock.calls[0]!;
      expect(url).toBe('https://api.test.com/api/v1/contacts');
      expect((init as RequestInit).method).toBe('GET');
      expect((init as RequestInit).headers).toMatchObject({ key: 'test-key' });
      expect(result).toEqual([{ id: '1', name: 'Test' }]);
    });

    it('appends query parameters', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse([]));

      await http.get('/v1/contacts', { page: 1, limit: 10 });

      const [url] = mockFetch.mock.calls[0]!;
      expect(url).toContain('page=1');
      expect(url).toContain('limit=10');
    });

    it('skips undefined query parameters', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse([]));

      await http.get('/v1/contacts', { page: 1, limit: undefined });

      const [url] = mockFetch.mock.calls[0]!;
      expect(url).toContain('page=1');
      expect(url).not.toContain('limit');
    });
  });

  describe('POST', () => {
    it('sends POST request with JSON body', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ id: 'new' }));

      const result = await http.post('/v1/contacts', { name: 'Test' });

      const [, init] = mockFetch.mock.calls[0]!;
      expect((init as RequestInit).method).toBe('POST');
      expect((init as RequestInit).body).toBe('{"name":"Test"}');
      expect((init as RequestInit).headers).toMatchObject({
        key: 'test-key',
        'Content-Type': 'application/json',
      });
      expect(result).toEqual({ id: 'new' });
    });
  });

  describe('PUT', () => {
    it('sends PUT request with JSON body', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ id: '1', name: 'Updated' }));

      await http.put('/v1/contacts/1', { name: 'Updated' });

      const [url, init] = mockFetch.mock.calls[0]!;
      expect(url).toBe('https://api.test.com/api/v1/contacts/1');
      expect((init as RequestInit).method).toBe('PUT');
    });
  });

  describe('DELETE', () => {
    it('sends DELETE request', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ status: 1 }));

      await http.del('/v1/contacts/1');

      const [, init] = mockFetch.mock.calls[0]!;
      expect((init as RequestInit).method).toBe('DELETE');
    });
  });

  describe('error handling', () => {
    it('throws HoldedAuthError on 401', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ message: 'Unauthorized' }, 401));

      await expect(http.get('/v1/contacts')).rejects.toThrow(HoldedAuthError);
    });

    it('throws HoldedNotFoundError on 404', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ message: 'Not found' }, 404));

      await expect(http.get('/v1/contacts/xxx')).rejects.toThrow(HoldedNotFoundError);
    });

    it('throws HoldedError on other status codes', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ message: 'Server error' }, 500));

      await expect(http.get('/v1/contacts')).rejects.toThrow(HoldedError);
    });
  });

  describe('rate limit retry', () => {
    it('retries on 429 with delay', async () => {
      mockFetch
        .mockResolvedValueOnce(new Response('{}', { status: 429, headers: { 'Retry-After': '1' } }))
        .mockResolvedValueOnce(jsonResponse([{ id: '1' }]));

      const result = await http.get('/v1/contacts');

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result).toEqual([{ id: '1' }]);
    });

    it('throws after max retries on persistent 429', async () => {
      const rateLimitResponse = () =>
        new Response('{"error":"rate_limit"}', {
          status: 429,
          headers: { 'Retry-After': '0' },
        });
      mockFetch
        .mockResolvedValueOnce(rateLimitResponse())
        .mockResolvedValueOnce(rateLimitResponse())
        .mockResolvedValueOnce(rateLimitResponse());

      await expect(http.get('/v1/contacts')).rejects.toThrow(HoldedRateLimitError);
      // Initial + 2 retries = 3 calls
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });
  });
});

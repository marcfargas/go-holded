/**
 * HTTP transport layer for the Holded API.
 *
 * Handles authentication (key header), JSON serialization,
 * error mapping, and rate limit retries.
 */

import {
  HoldedError,
  HoldedAuthError,
  HoldedNotFoundError,
  HoldedRateLimitError,
} from './errors.js';

const DEFAULT_BASE_URL = 'https://api.holded.com/api';
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

export interface HttpClientOptions {
  apiKey: string;
  baseUrl?: string;
}

export class HttpClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(options: HttpClientOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, '');
  }

  async get<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T> {
    const url = this.buildUrl(path, params);
    return this.request<T>(url, { method: 'GET' });
  }

  async post<T>(path: string, body?: Record<string, unknown>): Promise<T> {
    const url = this.buildUrl(path);
    return this.request<T>(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(path: string, body?: Record<string, unknown>): Promise<T> {
    const url = this.buildUrl(path);
    return this.request<T>(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async del<T>(path: string): Promise<T> {
    const url = this.buildUrl(path);
    return this.request<T>(url, { method: 'DELETE' });
  }

  /** Raw request with binary response (for PDF downloads, etc.). */
  async getRaw(path: string): Promise<ArrayBuffer> {
    const url = this.buildUrl(path);
    const response = await this.fetchWithRetry(url, {
      method: 'GET',
      headers: { key: this.apiKey },
    });

    if (!response.ok) {
      await this.handleErrorResponse(response);
    }

    return response.arrayBuffer();
  }

  private buildUrl(path: string, params?: Record<string, string | number | undefined>): string {
    const url = new URL(`${this.baseUrl}${path}`);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      }
    }
    return url.toString();
  }

  private async request<T>(url: string, init: RequestInit): Promise<T> {
    const headers: Record<string, string> = {
      key: this.apiKey,
      ...(init.headers as Record<string, string> | undefined),
    };

    const response = await this.fetchWithRetry(url, { ...init, headers });

    if (!response.ok) {
      await this.handleErrorResponse(response);
    }

    const text = await response.text();
    if (!text) {
      return undefined as T;
    }

    try {
      return JSON.parse(text) as T;
    } catch {
      // Some endpoints return plain text
      return text as T;
    }
  }

  private async fetchWithRetry(url: string, init: RequestInit, attempt = 0): Promise<Response> {
    const response = await fetch(url, init);

    if (response.status === 429 && attempt < MAX_RETRIES) {
      const retryAfter = response.headers.get('Retry-After');
      const delayMs = retryAfter ? parseInt(retryAfter, 10) * 1000 : RETRY_DELAY_MS * (attempt + 1);
      await sleep(delayMs);
      return this.fetchWithRetry(url, init, attempt + 1);
    }

    return response;
  }

  private async handleErrorResponse(response: Response): Promise<never> {
    let body: unknown;
    try {
      body = await response.json();
    } catch {
      body = await response.text().catch(() => undefined);
    }

    switch (response.status) {
      case 401:
        throw new HoldedAuthError('Invalid or missing API key', body);
      case 404:
        throw new HoldedNotFoundError('Resource not found', body);
      case 429:
        throw new HoldedRateLimitError('Rate limit exceeded', undefined, body);
      default:
        throw new HoldedError(
          `Holded API error: ${response.status} ${response.statusText}`,
          response.status,
          body,
        );
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

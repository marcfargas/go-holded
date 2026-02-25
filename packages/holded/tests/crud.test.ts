import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createCrudResource, createReadOnlyResource, createListOnlyResource } from '../src/crud.js';
import type { HttpClient } from '../src/http.js';

function createMockHttp(): HttpClient {
  return {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    del: vi.fn(),
    getRaw: vi.fn(),
  } as unknown as HttpClient;
}

interface TestEntity {
  id: string;
  name: string;
}

describe('createCrudResource', () => {
  let http: HttpClient;

  beforeEach(() => {
    http = createMockHttp();
  });

  it('list calls GET on base path', async () => {
    vi.mocked(http.get).mockResolvedValueOnce([{ id: '1', name: 'Test' }]);

    const resource = createCrudResource<TestEntity>(http, '/v1/things');
    const result = await resource.list();

    expect(http.get).toHaveBeenCalledWith('/v1/things', undefined);
    expect(result).toEqual([{ id: '1', name: 'Test' }]);
  });

  it('list passes pagination params', async () => {
    vi.mocked(http.get).mockResolvedValueOnce([]);

    const resource = createCrudResource<TestEntity>(http, '/v1/things');
    await resource.list({ page: 2, limit: 5 });

    expect(http.get).toHaveBeenCalledWith('/v1/things', { page: 2, limit: 5 });
  });

  it('get calls GET with id', async () => {
    vi.mocked(http.get).mockResolvedValueOnce({ id: '1', name: 'Test' });

    const resource = createCrudResource<TestEntity>(http, '/v1/things');
    const result = await resource.get('1');

    expect(http.get).toHaveBeenCalledWith('/v1/things/1');
    expect(result).toEqual({ id: '1', name: 'Test' });
  });

  it('create calls POST on base path', async () => {
    vi.mocked(http.post).mockResolvedValueOnce({ id: 'new', name: 'Created' });

    const resource = createCrudResource<TestEntity>(http, '/v1/things');
    const result = await resource.create({ name: 'Created' });

    expect(http.post).toHaveBeenCalledWith('/v1/things', { name: 'Created' });
    expect(result).toEqual({ id: 'new', name: 'Created' });
  });

  it('update calls PUT with id', async () => {
    vi.mocked(http.put).mockResolvedValueOnce({ id: '1', name: 'Updated' });

    const resource = createCrudResource<TestEntity>(http, '/v1/things');
    const result = await resource.update('1', { name: 'Updated' });

    expect(http.put).toHaveBeenCalledWith('/v1/things/1', { name: 'Updated' });
    expect(result).toEqual({ id: '1', name: 'Updated' });
  });

  it('delete calls DELETE with id', async () => {
    vi.mocked(http.del).mockResolvedValueOnce({ status: 1 });

    const resource = createCrudResource<TestEntity>(http, '/v1/things');
    await resource.delete('1');

    expect(http.del).toHaveBeenCalledWith('/v1/things/1');
  });
});

describe('createReadOnlyResource', () => {
  it('only exposes list and get', () => {
    const http = createMockHttp();
    const resource = createReadOnlyResource<TestEntity>(http, '/v1/things');

    expect(resource).toHaveProperty('list');
    expect(resource).toHaveProperty('get');
    expect(resource).not.toHaveProperty('create');
    expect(resource).not.toHaveProperty('update');
    expect(resource).not.toHaveProperty('delete');
  });
});

describe('createListOnlyResource', () => {
  it('only exposes list', () => {
    const http = createMockHttp();
    const resource = createListOnlyResource<TestEntity>(http, '/v1/things');

    expect(resource).toHaveProperty('list');
    expect(resource).not.toHaveProperty('get');
    expect(resource).not.toHaveProperty('create');
  });
});

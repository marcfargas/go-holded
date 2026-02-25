/**
 * CRUD resource factory.
 *
 * Most Holded API resources follow the same pattern:
 *   GET    /resource         → list
 *   GET    /resource/:id     → get
 *   POST   /resource         → create
 *   PUT    /resource/:id     → update
 *   DELETE /resource/:id     → delete
 *
 * This factory creates a typed resource object with these methods.
 * Domain-specific resources extend the result with extra methods.
 */

import type { HttpClient } from './http.js';
import type { CrudResource, ListParams, ReadOnlyResource, ListOnlyResource } from './types.js';

/** Create a full CRUD resource (list, get, create, update, delete). */
export function createCrudResource<T>(http: HttpClient, basePath: string): CrudResource<T> {
  return {
    async list(params?: ListParams): Promise<T[]> {
      return http.get<T[]>(basePath, params as Record<string, string | number | undefined>);
    },
    async get(id: string): Promise<T> {
      return http.get<T>(`${basePath}/${id}`);
    },
    async create(data: Record<string, unknown>): Promise<T> {
      return http.post<T>(basePath, data);
    },
    async update(id: string, data: Record<string, unknown>): Promise<T> {
      return http.put<T>(`${basePath}/${id}`, data);
    },
    async delete(id: string): Promise<unknown> {
      return http.del(`${basePath}/${id}`);
    },
  };
}

/** Create a read-only resource (list + get only). */
export function createReadOnlyResource<T>(http: HttpClient, basePath: string): ReadOnlyResource<T> {
  return {
    async list(params?: ListParams): Promise<T[]> {
      return http.get<T[]>(basePath, params as Record<string, string | number | undefined>);
    },
    async get(id: string): Promise<T> {
      return http.get<T>(`${basePath}/${id}`);
    },
  };
}

/** Create a list-only resource (list, no individual get). */
export function createListOnlyResource<T>(http: HttpClient, basePath: string): ListOnlyResource<T> {
  return {
    async list(params?: ListParams): Promise<T[]> {
      return http.get<T[]>(basePath, params as Record<string, string | number | undefined>);
    },
  };
}

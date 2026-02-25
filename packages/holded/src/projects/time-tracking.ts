import type { HttpClient } from '../http.js';
import type { ListParams } from '../types.js';

const BASE_PATH = '/projects/v1/projects';

export interface ProjectTime {
  id: string;
  projectId?: string;
  [key: string]: unknown;
}

export interface ProjectTimeTrackingResource {
  /** List time entries for a specific project. */
  list(projectId: string, params?: ListParams): Promise<ProjectTime[]>;
  /** Create a time entry for a project. */
  create(projectId: string, data: Record<string, unknown>): Promise<ProjectTime>;
  /** Get a specific time entry. */
  get(projectId: string, timeId: string): Promise<ProjectTime>;
  /** Update a specific time entry. */
  update(projectId: string, timeId: string, data: Record<string, unknown>): Promise<ProjectTime>;
  /** Delete a specific time entry. */
  delete(projectId: string, timeId: string): Promise<unknown>;
  /** List all time entries across all projects. */
  listAll(params?: ListParams): Promise<ProjectTime[]>;
}

export function createProjectTimeTrackingResource(http: HttpClient): ProjectTimeTrackingResource {
  return {
    async list(projectId: string, params?: ListParams): Promise<ProjectTime[]> {
      return http.get<ProjectTime[]>(
        `${BASE_PATH}/${projectId}/times`,
        params as Record<string, string | number | undefined>,
      );
    },

    async create(projectId: string, data: Record<string, unknown>): Promise<ProjectTime> {
      return http.post<ProjectTime>(`${BASE_PATH}/${projectId}/times`, data);
    },

    async get(projectId: string, timeId: string): Promise<ProjectTime> {
      return http.get<ProjectTime>(`${BASE_PATH}/${projectId}/times/${timeId}`);
    },

    async update(
      projectId: string,
      timeId: string,
      data: Record<string, unknown>,
    ): Promise<ProjectTime> {
      return http.put<ProjectTime>(`${BASE_PATH}/${projectId}/times/${timeId}`, data);
    },

    async delete(projectId: string, timeId: string): Promise<unknown> {
      return http.del(`${BASE_PATH}/${projectId}/times/${timeId}`);
    },

    async listAll(params?: ListParams): Promise<ProjectTime[]> {
      return http.get<ProjectTime[]>(
        `${BASE_PATH}/times`,
        params as Record<string, string | number | undefined>,
      );
    },
  };
}

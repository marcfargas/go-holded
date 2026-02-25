import type { HttpClient } from '../http.js';
import type { ListParams } from '../types.js';

const BASE_PATH = '/projects/v1/tasks';

export interface ProjectTask {
  id: string;
  name: string;
  projectId?: string;
  [key: string]: unknown;
}

export interface ProjectTasksResource {
  list(params?: ListParams): Promise<ProjectTask[]>;
  create(data: Record<string, unknown>): Promise<ProjectTask>;
  get(taskId: string): Promise<ProjectTask>;
  delete(taskId: string): Promise<unknown>;
}

export function createProjectTasksResource(http: HttpClient): ProjectTasksResource {
  return {
    async list(params?: ListParams): Promise<ProjectTask[]> {
      return http.get<ProjectTask[]>(
        BASE_PATH,
        params as Record<string, string | number | undefined>,
      );
    },
    async create(data: Record<string, unknown>): Promise<ProjectTask> {
      return http.post<ProjectTask>(BASE_PATH, data);
    },
    async get(taskId: string): Promise<ProjectTask> {
      return http.get<ProjectTask>(`${BASE_PATH}/${taskId}`);
    },
    async delete(taskId: string): Promise<unknown> {
      return http.del(`${BASE_PATH}/${taskId}`);
    },
  };
}

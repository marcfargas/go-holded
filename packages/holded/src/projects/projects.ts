import type { HttpClient } from '../http.js';
import type { CrudResource } from '../types.js';
import { createCrudResource } from '../crud.js';

const BASE_PATH = '/projects/v1/projects';

export interface Project {
  id: string;
  name: string;
  [key: string]: unknown;
}

export interface ProjectSummary {
  [key: string]: unknown;
}

export interface ProjectsResource extends CrudResource<Project> {
  getSummary(projectId: string): Promise<ProjectSummary>;
}

export function createProjectsResource(http: HttpClient): ProjectsResource {
  const crud = createCrudResource<Project>(http, BASE_PATH);

  return {
    ...crud,

    async getSummary(projectId: string): Promise<ProjectSummary> {
      return http.get<ProjectSummary>(`${BASE_PATH}/${projectId}/summary`);
    },
  };
}

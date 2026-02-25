import type { HttpClient } from '../http.js';
import { createProjectsResource } from './projects.js';
import type { ProjectsResource } from './projects.js';
import { createProjectTasksResource } from './tasks.js';
import type { ProjectTasksResource } from './tasks.js';
import { createProjectTimeTrackingResource } from './time-tracking.js';
import type { ProjectTimeTrackingResource } from './time-tracking.js';

export type { Project, ProjectSummary, ProjectsResource } from './projects.js';
export type { ProjectTask, ProjectTasksResource } from './tasks.js';
export type { ProjectTime, ProjectTimeTrackingResource } from './time-tracking.js';

export interface ProjectsDomain {
  projects: ProjectsResource;
  tasks: ProjectTasksResource;
  timeTracking: ProjectTimeTrackingResource;
}

export function createProjectsDomain(http: HttpClient): ProjectsDomain {
  return {
    projects: createProjectsResource(http),
    tasks: createProjectTasksResource(http),
    timeTracking: createProjectTimeTrackingResource(http),
  };
}

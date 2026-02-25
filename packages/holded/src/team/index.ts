import type { HttpClient } from '../http.js';
import { createEmployeesResource } from './employees.js';
import type { EmployeesResource } from './employees.js';
import { createTeamTimeTrackingResource } from './time-tracking.js';
import type { TeamTimeTrackingResource } from './time-tracking.js';

export type { Employee, EmployeesResource } from './employees.js';
export type { EmployeeTime, TeamTimeTrackingResource } from './time-tracking.js';

export interface TeamDomain {
  employees: EmployeesResource;
  timeTracking: TeamTimeTrackingResource;
}

export function createTeamDomain(http: HttpClient): TeamDomain {
  return {
    employees: createEmployeesResource(http),
    timeTracking: createTeamTimeTrackingResource(http),
  };
}

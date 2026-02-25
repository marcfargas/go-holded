import type { HttpClient } from '../http.js';
import type { ListParams } from '../types.js';

const BASE_PATH = '/team/v1/times';
const EMPLOYEES_PATH = '/api/team/v1/employees';

export interface EmployeeTime {
  id: string;
  employeeId?: string;
  [key: string]: unknown;
}

export interface TeamTimeTrackingResource {
  /** List all time-trackings of all employees. */
  list(params?: ListParams): Promise<EmployeeTime[]>;
  /** Get a specific time-tracking. */
  get(timeId: string): Promise<EmployeeTime>;
  /** Update a time-tracking. */
  update(timeId: string, data: Record<string, unknown>): Promise<EmployeeTime>;
  /** Delete a time-tracking. */
  delete(timeId: string): Promise<unknown>;
  /** List time-trackings of a single employee. */
  listByEmployee(employeeId: string, params?: ListParams): Promise<EmployeeTime[]>;
  /** Create a time-tracking for a specific employee. */
  createForEmployee(employeeId: string, data: Record<string, unknown>): Promise<EmployeeTime>;
}

export function createTeamTimeTrackingResource(http: HttpClient): TeamTimeTrackingResource {
  return {
    async list(params?: ListParams): Promise<EmployeeTime[]> {
      return http.get<EmployeeTime[]>(
        BASE_PATH,
        params as Record<string, string | number | undefined>,
      );
    },

    async get(timeId: string): Promise<EmployeeTime> {
      return http.get<EmployeeTime>(`${BASE_PATH}/${timeId}`);
    },

    async update(timeId: string, data: Record<string, unknown>): Promise<EmployeeTime> {
      return http.put<EmployeeTime>(`${BASE_PATH}/${timeId}`, data);
    },

    async delete(timeId: string): Promise<unknown> {
      return http.del(`${BASE_PATH}/${timeId}`);
    },

    async listByEmployee(employeeId: string, params?: ListParams): Promise<EmployeeTime[]> {
      return http.get<EmployeeTime[]>(
        `${EMPLOYEES_PATH}/${employeeId}/times`,
        params as Record<string, string | number | undefined>,
      );
    },

    async createForEmployee(
      employeeId: string,
      data: Record<string, unknown>,
    ): Promise<EmployeeTime> {
      return http.post<EmployeeTime>(`${EMPLOYEES_PATH}/${employeeId}/times`, data);
    },
  };
}

import type { HttpClient } from '../http.js';
import type { CrudResource } from '../types.js';
import { createCrudResource } from '../crud.js';

const BASE_PATH = '/team/v1/employees';

export interface Employee {
  id: string;
  name: string;
  email?: string;
  [key: string]: unknown;
}

export interface EmployeesResource extends CrudResource<Employee> {
  clockIn(employeeId: string): Promise<unknown>;
  clockOut(employeeId: string): Promise<unknown>;
  pause(employeeId: string): Promise<unknown>;
  unpause(employeeId: string): Promise<unknown>;
}

export function createEmployeesResource(http: HttpClient): EmployeesResource {
  const crud = createCrudResource<Employee>(http, BASE_PATH);

  return {
    ...crud,

    async clockIn(employeeId: string): Promise<unknown> {
      return http.post(`${BASE_PATH}/${employeeId}/clockin`);
    },

    async clockOut(employeeId: string): Promise<unknown> {
      return http.post(`${BASE_PATH}/${employeeId}/clockout`);
    },

    async pause(employeeId: string): Promise<unknown> {
      return http.post(`${BASE_PATH}/${employeeId}/pause`);
    },

    async unpause(employeeId: string): Promise<unknown> {
      return http.post(`${BASE_PATH}/${employeeId}/unpause`);
    },
  };
}

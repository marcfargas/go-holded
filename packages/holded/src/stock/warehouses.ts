import type { HttpClient } from '../http.js';
import type { CrudResource } from '../types.js';
import { createCrudResource } from '../crud.js';

const BASE_PATH = '/invoicing/v1/warehouses';

export interface Warehouse {
  id: string;
  name: string;
  [key: string]: unknown;
}

export interface WarehouseStock {
  [key: string]: unknown;
}

export interface WarehousesResource extends CrudResource<Warehouse> {
  listStock(warehouseId: string): Promise<WarehouseStock[]>;
}

export function createWarehousesResource(http: HttpClient): WarehousesResource {
  const crud = createCrudResource<Warehouse>(http, BASE_PATH);

  return {
    ...crud,

    async listStock(warehouseId: string): Promise<WarehouseStock[]> {
      return http.get<WarehouseStock[]>(`${BASE_PATH}/${warehouseId}/stock`);
    },
  };
}

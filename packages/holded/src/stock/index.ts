import type { HttpClient } from '../http.js';
import { createProductsResource } from './products.js';
import type { ProductsResource } from './products.js';
import { createWarehousesResource } from './warehouses.js';
import type { WarehousesResource } from './warehouses.js';

export type { Product, ProductImage, ProductsResource } from './products.js';
export type { Warehouse, WarehouseStock, WarehousesResource } from './warehouses.js';

export interface StockDomain {
  products: ProductsResource;
  warehouses: WarehousesResource;
}

export function createStockDomain(http: HttpClient): StockDomain {
  return {
    products: createProductsResource(http),
    warehouses: createWarehousesResource(http),
  };
}

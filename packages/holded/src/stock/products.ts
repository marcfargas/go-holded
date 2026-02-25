import type { HttpClient } from '../http.js';
import type { CrudResource } from '../types.js';
import { createCrudResource } from '../crud.js';

const BASE_PATH = '/invoicing/v1/products';

export interface Product {
  id: string;
  name: string;
  sku?: string;
  price?: number;
  [key: string]: unknown;
}

export interface ProductImage {
  filename: string;
  [key: string]: unknown;
}

export interface ProductsResource extends CrudResource<Product> {
  getImage(productId: string): Promise<ArrayBuffer>;
  listImages(productId: string): Promise<ProductImage[]>;
  getSecondaryImage(productId: string, imageFilename: string): Promise<ArrayBuffer>;
  updateStock(productId: string, data: Record<string, unknown>): Promise<unknown>;
}

export function createProductsResource(http: HttpClient): ProductsResource {
  const crud = createCrudResource<Product>(http, BASE_PATH);

  return {
    ...crud,

    async getImage(productId: string): Promise<ArrayBuffer> {
      return http.getRaw(`${BASE_PATH}/${productId}/image`);
    },

    async listImages(productId: string): Promise<ProductImage[]> {
      return http.get<ProductImage[]>(`${BASE_PATH}/${productId}/images`);
    },

    async getSecondaryImage(productId: string, imageFilename: string): Promise<ArrayBuffer> {
      return http.getRaw(`${BASE_PATH}/${productId}/image/${imageFilename}`);
    },

    async updateStock(productId: string, data: Record<string, unknown>): Promise<unknown> {
      return http.put(`${BASE_PATH}/${productId}/stock`, data);
    },
  };
}

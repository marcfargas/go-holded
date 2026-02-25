import type { HttpClient } from '../http.js';
import type { CrudResource, ListParams } from '../types.js';
import { createCrudResource } from '../crud.js';

const BASE_PATH = '/crm/v1/bookings';

export interface Booking {
  id: string;
  [key: string]: unknown;
}

export interface BookingLocation {
  id: string;
  name: string;
  [key: string]: unknown;
}

export interface BookingSlot {
  [key: string]: unknown;
}

export interface BookingsResource extends CrudResource<Booking> {
  listLocations(params?: ListParams): Promise<BookingLocation[]>;
  getAvailableSlots(locationId: string, params?: ListParams): Promise<BookingSlot[]>;
}

export function createBookingsResource(http: HttpClient): BookingsResource {
  const crud = createCrudResource<Booking>(http, BASE_PATH);

  return {
    ...crud,

    async listLocations(params?: ListParams): Promise<BookingLocation[]> {
      return http.get<BookingLocation[]>(
        `${BASE_PATH}/locations`,
        params as Record<string, string | number | undefined>,
      );
    },

    async getAvailableSlots(locationId: string, params?: ListParams): Promise<BookingSlot[]> {
      return http.get<BookingSlot[]>(
        `${BASE_PATH}/locations/${locationId}/slots`,
        params as Record<string, string | number | undefined>,
      );
    },
  };
}

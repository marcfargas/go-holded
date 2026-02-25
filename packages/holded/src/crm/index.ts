import type { HttpClient } from '../http.js';
import type { CrudResource } from '../types.js';
import { createFunnelsResource } from './funnels.js';
import type { Funnel } from './funnels.js';
import { createLeadsResource } from './leads.js';
import type { LeadsResource } from './leads.js';
import { createEventsResource } from './events.js';
import type { CrmEvent } from './events.js';
import { createBookingsResource } from './bookings.js';
import type { BookingsResource } from './bookings.js';

export type { Funnel } from './funnels.js';
export type { Lead, LeadsResource } from './leads.js';
export type { CrmEvent } from './events.js';
export type { Booking, BookingLocation, BookingSlot, BookingsResource } from './bookings.js';

export interface CrmDomain {
  funnels: CrudResource<Funnel>;
  leads: LeadsResource;
  events: CrudResource<CrmEvent>;
  bookings: BookingsResource;
}

export function createCrmDomain(http: HttpClient): CrmDomain {
  return {
    funnels: createFunnelsResource(http),
    leads: createLeadsResource(http),
    events: createEventsResource(http),
    bookings: createBookingsResource(http),
  };
}

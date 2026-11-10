/**
 * Trips API Service
 * Handles all trip-related API calls
 */

import { apiClient } from "@/lib/api-client";
import { uniqueBusTypes } from "@/lib/bus-types";
import { imageForRoute } from "@/lib/public-images";

export interface TripResponse {
  id: string;
  origin: string;
  destination: string;
  bus_name: string;
  bus_type: string;
  bus_type_display?: string;
  bus_plate?: string;
  bus_capacity?: number;
  seat_layout?: string;
  departure_time: string;
  arrival_time: string;
  duration: string | null;
  regular_price: number;
  vip_price: number | null;
  cargo_price_per_kg: number | null;
  currency: string;
  status: string;
  available_seats: number;
}

export interface SeatMapSeat {
  id: number;
  seat_number: string;
  row: number;
  column: string;
  position: "WINDOW" | "AISLE" | "MIDDLE";
  seat_type: "VIP" | "REGULAR";
  status: "AVAILABLE" | "BOOKED" | "LOCKED" | "UNAVAILABLE";
}

export interface SeatMapResponse {
  trip_id: string;
  bus: string;
  bus_type?: string;
  bus_type_display?: string;
  bus_name?: string;
  layout: string;
  columns_left: number;
  columns_right: number;
  total_rows: number;
  vip_seats?: number;
  regular_seats?: number;
  seats: SeatMapSeat[];
}

export interface TripSearchParams {
  origin_name?: string;
  destination_name?: string;
  departure_date?: string;
  status?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

/** Django DecimalField returns strings like "3500.00" — parse to numbers */
function normalizeTrip(trip: any): TripResponse {
  return {
    ...trip,
    regular_price: parseFloat(trip.regular_price) || 0,
    vip_price: trip.vip_price != null ? parseFloat(trip.vip_price) : null,
    cargo_price_per_kg: trip.cargo_price_per_kg != null ? parseFloat(trip.cargo_price_per_kg) : null,
  };
}

function busTypesFromRoute(route: any): string[] {
  const allowed = Array.isArray(route.allowed_bus_types) ? route.allowed_bus_types : [];
  const assigned = Array.isArray(route.assigned_buses)
    ? route.assigned_buses.map((bus: { bus_type?: string }) => bus.bus_type)
    : [];
  return uniqueBusTypes([...allowed, ...assigned]);
}

export const tripsService = {
  /**
   * Fetch all trips with optional filters
   */
  async getTripsList(params?: TripSearchParams) {
    try {
      const response = await apiClient.get<any>("/trips/", {
        params: (params || {}) as any,
      });
      const raw = Array.isArray(response)
        ? response
        : response?.results ?? [];
      const trips: TripResponse[] = raw.map(normalizeTrip);
      return { data: trips, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: error.message || "Failed to fetch trips",
      };
    }
  },

  /**
   * Fetch a single trip by ID
   */
  async getTripById(tripId: string) {
    try {
      const trip = await apiClient.get<TripResponse>(`/trips/${tripId}/`);
      return { data: trip, error: null };
      // Note: detail endpoint uses TripSerializer (nested), not TripListSerializer
    } catch (error: any) {
      return {
        data: null,
        error: error.message || "Failed to fetch trip",
      };
    }
  },

  /**
   * Get seat map for a specific trip
   */
  async getSeatMap(tripId: string) {
    try {
      const seatMap = await apiClient.get<SeatMapResponse>(
        `/trips/${tripId}/seat-map/`
      );
      return { data: seatMap, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: error.message || "Failed to fetch seat map",
      };
    }
  },

  /**
   * Search trips with comprehensive filters
   * Commonly used for the booking modal
   */
  async searchTrips(
    origin: string,
    destination: string,
    departureDate: string
  ) {
    try {
      const response = await apiClient.get<any>("/trips/", {
        params: {
          origin_name: origin,
          destination_name: destination,
          departure_date: departureDate,
          status: "SCHEDULED",
        },
      });
      const raw = Array.isArray(response)
        ? response
        : response?.results ?? [];
      const trips: TripResponse[] = raw.map(normalizeTrip);
      return { data: trips, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: error.message || "Failed to search trips",
      };
    }
  },

  /**
   * Get available routes from the routes catalog, enriched with scheduled trip times.
   */
  async getAvailableRoutes() {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const [routesRes, tripsRes] = await Promise.all([
        apiClient.get<any>("/routes/", { params: { is_active: "true", page_size: 100 } }),
        apiClient.get<any>("/trips/", {
          params: {
            status: "SCHEDULED",
            departure_from: today,
            ordering: "departure_time",
            page_size: 200,
          },
        }),
      ]);

      const routeRows = Array.isArray(routesRes) ? routesRes : routesRes?.results ?? [];
      const tripRowsRaw = Array.isArray(tripsRes) ? tripsRes : tripsRes?.results ?? [];
      const trips: TripResponse[] = tripRowsRaw.map(normalizeTrip);

      const timesByKey = new Map<string, string[]>();
      for (const trip of trips) {
        const key = `${trip.origin}-${trip.destination}`;
        const list = timesByKey.get(key) || [];
        if (trip.departure_time && !list.includes(trip.departure_time)) {
          list.push(trip.departure_time);
        }
        timesByKey.set(key, list);
      }

      if (routeRows.length > 0) {
        const mapped = routeRows.map((route: any) => {
          const from = route.origin_name || route.origin?.name || "Unknown";
          const to = route.destination_name || route.destination?.name || "Unknown";
          const key = `${from}-${to}`;
          const hours = route.estimated_duration
            ? `${route.estimated_duration}`.replace(":", "h ").replace(/:00$/, "") + (String(route.estimated_duration).includes(":") ? "m" : "")
            : "N/A";
          return {
            id: String(route.id),
            from,
            to,
            via: null,
            duration: hours,
            distance: route.distance_km ? `${route.distance_km} km` : "N/A",
            regularPrice: Number.parseFloat(route.base_price || "0"),
            vipPrice: Number.parseFloat(route.vip_price || route.base_price || "0"),
            currency: route.currency || "SSP",
            image: imageForRoute(from, to),
            departureTimes: timesByKey.get(key) || [],
            allowedBusTypes: Array.isArray(route.allowed_bus_types) ? route.allowed_bus_types : [],
            busTypes: busTypesFromRoute(route),
          };
        });
        return { data: mapped, error: null };
      }

      // Fallback: derive corridors from scheduled trips only
      const routesMap = new Map();
      trips.forEach((trip) => {
        const key = `${trip.origin}-${trip.destination}`;
        if (!routesMap.has(key)) {
          routesMap.set(key, {
            id: key,
            from: trip.origin,
            to: trip.destination,
            via: null,
            duration: trip.duration || "N/A",
            distance: "N/A",
            regularPrice: trip.regular_price,
            vipPrice: trip.vip_price ?? trip.regular_price,
            currency: trip.currency || "SSP",
            image: imageForRoute(trip.origin, trip.destination),
            departureTimes: [trip.departure_time],
            busTypes: uniqueBusTypes([trip.bus_type]),
            allowedBusTypes: uniqueBusTypes([trip.bus_type]),
          });
        } else {
          const route = routesMap.get(key);
          if (!route.departureTimes.includes(trip.departure_time)) {
            route.departureTimes.push(trip.departure_time);
          }
          route.busTypes = uniqueBusTypes([...(route.busTypes || []), trip.bus_type]);
          if (trip.regular_price < route.regularPrice) {
            route.regularPrice = trip.regular_price;
          }
          if (trip.vip_price != null && trip.vip_price < route.vipPrice) {
            route.vipPrice = trip.vip_price;
          }
        }
      });

      return {
        data: Array.from(routesMap.values()),
        error: null,
      };
    } catch (error: any) {
      return {
        data: null,
        error: error.message || "Failed to fetch routes",
      };
    }
  },

  /**
   * Lock seats temporarily while customer completes booking
   */
  async lockSeats(tripId: string, seatIds: number[], sessionKey?: string) {
    try {
      const payload: { seat_ids: number[]; session_key?: string } = {
        seat_ids: seatIds,
      };
      if (sessionKey) {
        payload.session_key = sessionKey;
      }
      const response = await apiClient.post<{
        locked_seats: number[];
        session_key: string;
        expires_at: string;
      }>(`/trips/${tripId}/lock-seats/`, payload);
      return { data: response, error: null };
    } catch (error: unknown) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Failed to lock seats",
      };
    }
  },

  /**
   * Release seat locks for a session
   */
  async unlockSeats(tripId: string, sessionKey: string) {
    try {
      await apiClient.post(`/trips/${tripId}/unlock-seats/`, {
        session_key: sessionKey,
      });
      return { error: null };
    } catch (error: unknown) {
      return {
        error: error instanceof Error ? error.message : "Failed to unlock seats",
      };
    }
  },
};

import { useState, useEffect } from "react";
import { tripsService, TripResponse } from "@/lib/services/trips";

interface UseTripsForRouteOptions {
  origin?: string;
  destination?: string;
  departureDate?: string;
}

export function useTripsForRoute(options?: UseTripsForRouteOptions) {
  const [trips, setTrips] = useState<TripResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!options?.origin || !options?.destination || !options?.departureDate) {
      setTrips([]);
      return;
    }

    const fetchTrips = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await tripsService.getTripsList({
        origin_name: options.origin,
        destination_name: options.destination,
        departure_date: options.departureDate,
        status: "SCHEDULED",
      });

      if (error) {
        setError(error);
        setTrips([]);
      } else {
        setTrips(data || []);
      }
      setLoading(false);
    };

    fetchTrips();
  }, [options?.origin, options?.destination, options?.departureDate]);

  return { trips, loading, error };
}

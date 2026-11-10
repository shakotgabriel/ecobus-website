/**
 * Custom hook to fetch seat map from API
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import { tripsService, type SeatMapResponse } from "@/lib/services/trips";

type UseSeatMapResult = {
  seatMap: SeatMapResponse | null;
  loading: boolean;
  error: string | null;
  refetch: (id: string) => Promise<void>;
};

export function useSeatMap(tripId?: string): UseSeatMapResult {
  const [seatMap, setSeatMap] = useState<SeatMapResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSeatMap = useCallback(
    async (id: string) => {
      if (!id) {
        setSeatMap(null);
        return;
      }

      setLoading(true);
      setError(null);

      const { data, error } = await tripsService.getSeatMap(id);

      if (error) {
        setError(error);
        setSeatMap(null);
      } else {
        setSeatMap(data || null);
      }

      setLoading(false);
    },
    []
  );

  useEffect(() => {
    if (tripId) {
      fetchSeatMap(tripId);
    } else {
      setSeatMap(null);
      setError(null);
    }
  }, [tripId, fetchSeatMap]);

  return {
    seatMap,
    loading,
    error,
    refetch: fetchSeatMap,
  };
}

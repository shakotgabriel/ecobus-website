/**
 * Custom hook to fetch available routes from API
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import { tripsService } from "@/lib/services/trips";
import { Route } from "@/lib/booking-data";
import { cachedRequest, invalidateRequest } from "@/lib/request-cache";

export function useAvailableRoutes() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoutes = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error } = await cachedRequest("available-routes", () => tripsService.getAvailableRoutes(), 2 * 60 * 1000);

    if (error) {
      setError(error);
      setRoutes([]);
    } else {
      setRoutes(data || []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  return {
    routes,
    loading,
    error,
    refetch: () => {
      invalidateRequest("available-routes");
      return fetchRoutes();
    },
  };
}

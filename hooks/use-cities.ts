/**
 * Custom hook to fetch available cities from API
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import { citiesService, type CityResponse } from "@/lib/services/cities";
import { destinations as fallbackDestinations } from "@/lib/booking-data";
import { config } from "@/lib/config";
import { cachedRequest, invalidateRequest } from "@/lib/request-cache";

export function useCities() {
  const [cities, setCities] = useState<string[]>([]);
  const [cityObjects, setCityObjects] = useState<CityResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCities = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error } = await cachedRequest("cities", () => citiesService.getCities());

    if (error) {
      setError(error);
      setCityObjects([]);
      setCities(config.useLocalData ? fallbackDestinations : []);
    } else {
      setCityObjects(data);
      const cityNames = data.map((city) => city.name);
      if (cityNames.length > 0) {
        setCities(cityNames);
      } else {
        setCities(config.useLocalData ? fallbackDestinations : []);
      }
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  return {
    cities,
    cityObjects,
    loading,
    error,
    refetch: () => {
      invalidateRequest("cities");
      return fetchCities();
    },
  };
}

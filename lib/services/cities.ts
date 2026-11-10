/**
 * Cities API Service
 * Handles fetching cities/destinations from the backend
 */

import { apiClient } from "@/lib/api-client";

export interface CityResponse {
  id: string;
  name: string;
  country: string;
  region?: string;
}

export const citiesService = {
  /**
   * Get all available cities/destinations
   */
  async getCities() {
    try {
      const response = await apiClient.get<any>("/cities/");
      const cities: CityResponse[] = Array.isArray(response)
        ? response
        : response?.results ?? [];
      return { data: cities, error: null };
    } catch (error: any) {
      return {
        data: [],
        error: error.message || "Failed to fetch cities",
      };
    }
  },

  /**
   * Get cities by country
   */
  async getCitiesByCountry(country: string) {
    try {
      const response = await apiClient.get<any>("/cities/", {
        params: { country },
      });
      const cities: CityResponse[] = Array.isArray(response)
        ? response
        : response?.results ?? [];
      return { data: cities, error: null };
    } catch (error: any) {
      return {
        data: [],
        error: error.message || "Failed to fetch cities",
      };
    }
  },
};

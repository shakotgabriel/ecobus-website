/**
 * Exchange Rates API Service
 * Fetches dynamic exchange rates managed by backend managers
 */

import { apiClient } from "@/lib/api-client";

export interface ExchangeRateResponse {
  id: number;
  from_currency: string;
  to_currency: string;
  rate: string; // Decimal from backend
  effective_date: string;
  updated_by_name: string | null;
  notes: string;
}

export type RateMap = Record<string, Record<string, number>>;

export const exchangeRatesService = {
  /**
   * Fetch the latest exchange rates (one per currency pair)
   */
  async getLatestRates(): Promise<{ data: RateMap; error: string | null }> {
    try {
      const response = await apiClient.get<any>("/exchange-rates/latest/");
      const rates: ExchangeRateResponse[] = Array.isArray(response)
        ? response
        : response?.results ?? [];

      // Build a nested map: { "SSP": { "KES": 0.39, "UGX": 11.2 }, ... }
      const rateMap: RateMap = {};
      rates.forEach((r) => {
        if (!rateMap[r.from_currency]) {
          rateMap[r.from_currency] = {};
        }
        rateMap[r.from_currency][r.to_currency] = parseFloat(r.rate);
      });

      // Add identity rates (1 SSP = 1 SSP, etc.)
      const allCurrencies = new Set([
        ...Object.keys(rateMap),
        ...rates.map((r) => r.to_currency),
      ]);
      allCurrencies.forEach((c) => {
        if (!rateMap[c]) rateMap[c] = {};
        rateMap[c][c] = 1;
      });

      return { data: rateMap, error: null };
    } catch (error: any) {
      return {
        data: {},
        error: error.message || "Failed to fetch exchange rates",
      };
    }
  },
};

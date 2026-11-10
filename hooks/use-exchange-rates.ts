/**
 * Custom hook to fetch and cache exchange rates from the API.
 * Falls back to hardcoded rates if the API fails.
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import { exchangeRatesService, type RateMap } from "@/lib/services/exchange-rates";
import { cachedRequest } from "@/lib/request-cache";

// Fallback rates used when the backend has no rates yet
const FALLBACK_RATES: RateMap = {
  SSP: { SSP: 1, KES: 0.39, UGX: 11.2 },
  KES: { KES: 1, SSP: 2.56, UGX: 28.7 },
  UGX: { UGX: 1, SSP: 0.089, KES: 0.035 },
};

export function useExchangeRates() {
  const [rates, setRates] = useState<RateMap>(FALLBACK_RATES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRates = useCallback(async () => {
    setLoading(true);
    const { data, error } = await cachedRequest("exchange-rates", () => exchangeRatesService.getLatestRates());

    if (error || Object.keys(data).length === 0) {
      setError(error);
      setRates(FALLBACK_RATES);
    } else {
      setRates(data);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  const convert = useCallback(
    (amount: number, from: string, to: string): number => {
      if (from === to || amount === 0) return amount;
      const fromRates = rates[from];
      if (!fromRates || !fromRates[to]) return amount;
      return Math.round(amount * fromRates[to]);
    },
    [rates],
  );

  return { rates, loading, error, convert, refetch: fetchRates };
}

/**
 * Environment Configuration
 */

// Must include /api/v1 to match Django URLConf
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

/** Departures are scheduled in Juba local time; always display in this zone. */
export const OPERATOR_TIMEZONE = "Africa/Juba";

export const config = {
  apiUrl: API_BASE_URL,

  // When true, UI may show local marketing fallbacks if the API is empty.
  // Default false: prefer live backend data only.
  useLocalData: process.env.NEXT_PUBLIC_USE_LOCAL_DATA === "true",
};

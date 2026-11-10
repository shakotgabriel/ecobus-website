/**
 * API Client Configuration
 * Base configuration for all API requests to the Django backend
 */

import { formatApiError } from "@/lib/api-errors"
import { API_BASE_URL } from "@/lib/config"

const DEFAULT_TIMEOUT_MS = 20_000;

export interface ApiRequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
  timeoutMs?: number;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
}

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private buildUrl(endpoint: string, params?: ApiRequestOptions["params"]): string {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const qs = searchParams.toString();
      if (qs) url.search = qs;
    }
    return url.toString();
  }

  private async request<T>(
    method: HttpMethod,
    endpoint: string,
    data?: unknown,
    options: ApiRequestOptions = {},
  ): Promise<T> {
    const { params, timeoutMs = DEFAULT_TIMEOUT_MS, headers, signal, ...rest } = options;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const onAbort = () => controller.abort();
    signal?.addEventListener("abort", onAbort);

    try {
      const response = await fetch(this.buildUrl(endpoint, params), {
        ...rest,
        method,
        headers: {
          "Content-Type": "application/json",
          ...(headers as Record<string, string> | undefined),
        },
        body: data !== undefined && method !== "GET" ? JSON.stringify(data) : undefined,
        signal: controller.signal,
      });
      return await this.handleResponse<T>(response);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError" && !signal?.aborted) {
        throw new Error("The server took too long to respond. Please try again.");
      }
      throw err;
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener("abort", onAbort);
    }
  }

  get<T = any>(endpoint: string, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>("GET", endpoint, undefined, options);
  }

  post<T = any>(endpoint: string, data?: any, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>("POST", endpoint, data, options);
  }

  put<T = any>(endpoint: string, data?: any, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>("PUT", endpoint, data, options);
  }

  patch<T = any>(endpoint: string, data?: any, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>("PATCH", endpoint, data, options);
  }

  delete<T = any>(endpoint: string, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>("DELETE", endpoint, undefined, options);
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (response.status === 204) {
      return {} as T;
    }

    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error(`Failed to parse response: ${response.statusText}`);
    }

    if (!response.ok) {
      const errorMessage = formatApiError(data, response.statusText || "Request failed")
      const error = new Error(errorMessage) as Error & { status: number; data: unknown }
      error.status = response.status
      error.data = data
      throw error
    }

    return data as T;
  }
}

export const apiClient = new ApiClient();

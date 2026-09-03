import axios, { type AxiosError } from "axios";
import { getAuthToken, setAuthToken, clearAuthToken } from "@/lib/auth/authStore";

declare module "axios" {
  export interface AxiosRequestConfig {
    /** Skip attaching the Authorization header (public/unauthenticated endpoints). */
    skipAuthHeader?: boolean;
    /** Skip the 401 sign-out redirect (e.g. a login attempt is expected to 401 on bad credentials). */
    skipAuthRedirect?: boolean;
    /** Internal: set after one refresh-and-retry attempt, to bound retries to a single attempt. */
    _retriedAfterRefresh?: boolean;
  }
}

export const API_ORIGIN =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

let isRedirectingToSignIn = false;

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

function redirectToSignIn() {
  if (typeof window === "undefined") return;
  if (isRedirectingToSignIn || window.location.pathname.startsWith("/sign-in"))
    return;
  isRedirectingToSignIn = true;
  clearAuthToken();
  localStorage.removeItem("role");
  localStorage.removeItem("userId");
  window.location.href = "/sign-in";
}

// Historical default: paths passed directly to `api` (e.g. `api.get("/suppliers/orders")`)
// are relative to /api/v1. Kept as-is for existing callers across redux/services/**.
export const api = axios.create({
  baseURL: `${API_ORIGIN}/api/v1`,
});

// Attach token from the in-memory auth store on every request. A known-expired
// (or missing) token is simply omitted rather than triggering a client-side
// redirect here — with a short-lived access token, that would fire constantly
// and would never give the response interceptor's refresh-and-retry below a
// chance to run. Letting the request go out unauthenticated means the backend
// 401s it, which IS the trigger for the refresh-and-retry flow.
api.interceptors.request.use((config) => {
  // Never force a Content-Type for FormData. Axios/browser must generate the
  // multipart boundary; sending FormData as application/json makes Spring
  // reject it with "Current request is not a multipart request".
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    config.headers.delete("Content-Type");
  }

  if (typeof window === "undefined" || config.skipAuthHeader) return config;

  const token = getAuthToken();
  if (token && !isTokenExpired(token)) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }
  return config;
});

// Single-flight refresh: if several requests 401 around the same moment
// (e.g. several widgets fetch on page load right as the access token expires),
// they must all await the SAME refresh call rather than each rotating the
// refresh-token cookie themselves — only one rotation can succeed per cookie
// (see RefreshTokenServiceImpl on the backend), so a second concurrent
// attempt would just fail against an already-rotated token.
let refreshPromise: Promise<string | null> | null = null;

function requestNewAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    // Dynamic import (not a static one) to avoid a circular import: auth.service.ts
    // imports apiPost from this file, so this file can't statically import back
    // from auth.service.ts. By the time this actually runs, both modules are
    // fully initialized, so this is safe.
    refreshPromise = import("@/lib/auth/auth.service")
      .then(({ refreshAccessToken }) => refreshAccessToken())
      .then((res) => (res.ok ? (res.data?.data?.token ?? null) : null))
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config;

    if (typeof window === "undefined" || config?.skipAuthRedirect) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !config?._retriedAfterRefresh) {
      const newToken = await requestNewAccessToken();
      if (newToken && config) {
        setAuthToken(newToken);
        return api.request({
          ...config,
          _retriedAfterRefresh: true,
          headers: { ...config.headers, Authorization: `Bearer ${newToken}` },
        });
      }
      redirectToSignIn();
      return Promise.reject(error);
    }

    if (error.response?.status === 403) {
      console.warn("Forbidden: insufficient permissions for this request.");
    }

    return Promise.reject(error);
  },
);

// ---- Shared response/error types + normalized request helper ----------------
// New code should prefer apiGet/apiPost/apiPut/apiDelete below over the raw
// `api` instance. Paths here are relative to the API origin (include /api/v1
// or /authorization yourself) so both backend path shapes work through one client.

export interface ApiError {
  status: number;
  detail?: string;
}

export interface ApiResult<T = unknown> {
  ok: boolean;
  status: number;
  data: T;
}

type QueryParams = Record<
  string,
  string | number | boolean | null | undefined
>;

export interface ApiRequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  query?: QueryParams;
  /** Defaults to true. Set false for public endpoints (register/login/OTP/etc). */
  auth?: boolean;
  /** Send/receive cookies on this request (e.g. the httpOnly refresh-token cookie). Defaults to false. */
  withCredentials?: boolean;
}

export async function apiRequest<T = unknown>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<ApiResult<T>> {
  const {
    method = "GET",
    body,
    headers = {},
    query,
    auth = true,
    withCredentials = false,
  } = options;
  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;

  try {
    const response = await api.request<T>({
      baseURL: API_ORIGIN,
      url: path,
      method,
      params: query,
      data: body,
      headers: {
        // FormData needs no explicit Content-Type — axios/the browser must set
        // "multipart/form-data; boundary=...". The request interceptor above
        // also strips this header for FormData bodies; this is just a
        // belt-and-suspenders default at the call site.
        ...(isFormData
          ? { "Content-Type": undefined }
          : { "Content-Type": "application/json" }),
        ...headers,
      },
      skipAuthHeader: !auth,
      skipAuthRedirect: !auth,
      withCredentials,
    });

    return { ok: true, status: response.status, data: response.data };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return {
        ok: false,
        status: error.response.status,
        data: error.response.data as T,
      };
    }
    return {
      ok: false,
      status: 0,
      data: {
        detail:
          error instanceof Error ? error.message : "Network request failed",
      } as T,
    };
  }
}

export function apiGet<T = unknown>(
  path: string,
  options: Omit<ApiRequestOptions, "method"> = {},
): Promise<ApiResult<T>> {
  return apiRequest<T>(path, { ...options, method: "GET" });
}

export function apiPost<T = unknown>(
  path: string,
  options: Omit<ApiRequestOptions, "method"> = {},
): Promise<ApiResult<T>> {
  return apiRequest<T>(path, { ...options, method: "POST" });
}

export function apiPut<T = unknown>(
  path: string,
  options: Omit<ApiRequestOptions, "method"> = {},
): Promise<ApiResult<T>> {
  return apiRequest<T>(path, { ...options, method: "PUT" });
}

export function apiPatch<T = unknown>(
  path: string,
  options: Omit<ApiRequestOptions, "method"> = {},
): Promise<ApiResult<T>> {
  return apiRequest<T>(path, { ...options, method: "PATCH" });
}

export function apiDelete<T = unknown>(
  path: string,
  options: Omit<ApiRequestOptions, "method"> = {},
): Promise<ApiResult<T>> {
  return apiRequest<T>(path, { ...options, method: "DELETE" });
}

import axios, { type AxiosError } from "axios";

declare module "axios" {
  export interface AxiosRequestConfig {
    /** Skip attaching the Authorization header (public/unauthenticated endpoints). */
    skipAuthHeader?: boolean;
    /** Skip the 401 sign-out redirect (e.g. a login attempt is expected to 401 on bad credentials). */
    skipAuthRedirect?: boolean;
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
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("userId");
  window.location.href = "/sign-in";
}

// Historical default: paths passed directly to `api` (e.g. `api.get("/suppliers/orders")`)
// are relative to /api/v1. Kept as-is for existing callers across redux/services/**.
export const api = axios.create({
  baseURL: `${API_ORIGIN}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token from localStorage on every request
api.interceptors.request.use((config) => {
  if (typeof window === "undefined" || config.skipAuthHeader) return config;

  const token = localStorage.getItem("token");
  if (token) {
    if (isTokenExpired(token)) {
      redirectToSignIn();
      return Promise.reject(new axios.Cancel("Token expired"));
    }
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (typeof window !== "undefined" && !error.config?.skipAuthRedirect) {
      if (error.response?.status === 401) {
        redirectToSignIn();
      } else if (error.response?.status === 403) {
        console.warn("Forbidden: insufficient permissions for this request.");
      }
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
}

export async function apiRequest<T = unknown>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<ApiResult<T>> {
  const { method = "GET", body, headers = {}, query, auth = true } = options;
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
        ...(!isFormData ? { "Content-Type": "application/json" } : {}),
        ...headers,
      },
      skipAuthHeader: !auth,
      skipAuthRedirect: !auth,
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

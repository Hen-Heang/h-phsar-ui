const DEFAULT_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

let isRedirectingToSignIn = false;

type QueryParams = Record<string, string | number | boolean | null | undefined>;

function buildUrl(path: string, query?: QueryParams): string {
  const url = path.startsWith("http")
    ? new URL(path)
    : new URL(path, DEFAULT_API_BASE_URL);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
}

async function parseResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return null;
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) return response.json();
  return response.text();
}

function getAuthHeaders(auth: boolean): Record<string, string> {
  if (!auth || typeof window === "undefined") return {};
  const token = window.localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface ApiRequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  query?: QueryParams;
  auth?: boolean;
}

export interface ApiResponse<T = unknown> {
  ok: boolean;
  status: number;
  data: T;
}

export async function apiRequest<T = unknown>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<ApiResponse<T>> {
  const { method = "GET", body, headers = {}, query, auth = true } = options;

  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;
  const requestHeaders: Record<string, string> = {
    ...getAuthHeaders(auth),
    ...(!isFormData ? { "Content-Type": "application/json" } : {}),
    ...headers,
  };

  try {
    const response = await fetch(buildUrl(path, query), {
      method,
      headers: requestHeaders,
      body:
        body === undefined
          ? undefined
          : isFormData
            ? (body as FormData)
            : JSON.stringify(body),
      credentials: "include",
    });

    if (
      response.status === 401 &&
      auth &&
      typeof window !== "undefined" &&
      !isRedirectingToSignIn &&
      !window.location.pathname.startsWith("/sign-in")
    ) {
      isRedirectingToSignIn = true;
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("userId");
      window.location.href = "/sign-in";
    }

    const data = await parseResponseBody(response);

    return { ok: response.ok, status: response.status, data: data as T };
  } catch (error) {
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
): Promise<ApiResponse<T>> {
  return apiRequest<T>(path, { ...options, method: "GET" });
}

export function apiPost<T = unknown>(
  path: string,
  options: Omit<ApiRequestOptions, "method"> = {},
): Promise<ApiResponse<T>> {
  return apiRequest<T>(path, { ...options, method: "POST" });
}

export function apiPut<T = unknown>(
  path: string,
  options: Omit<ApiRequestOptions, "method"> = {},
): Promise<ApiResponse<T>> {
  return apiRequest<T>(path, { ...options, method: "PUT" });
}

export function apiDelete<T = unknown>(
  path: string,
  options: Omit<ApiRequestOptions, "method"> = {},
): Promise<ApiResponse<T>> {
  return apiRequest<T>(path, { ...options, method: "DELETE" });
}

const DEFAULT_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8888";

function buildUrl(path, query) {
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

async function parseResponseBody(response) {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

function getAuthHeaders(auth) {
  if (!auth || typeof window === "undefined") {
    return {};
  }

  const token = window.localStorage.getItem("token");

  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiRequest(path, options = {}) {
  const {
    method = "GET",
    body,
    headers = {},
    query,
    auth = true,
  } = options;

  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const requestHeaders = {
    ...getAuthHeaders(auth),
    ...(!isFormData ? { "Content-Type": "application/json" } : {}),
    ...headers,
  };

  try {
    const response = await fetch(buildUrl(path, query), {
      method,
      headers: requestHeaders,
      body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
      credentials: "include",
    });

    const data = await parseResponseBody(response);

    return {
      ok: response.ok,
      status: response.status,
      data,
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      data: {
        detail: error instanceof Error ? error.message : "Network request failed",
      },
    };
  }
}

export function apiGet(path, options = {}) {
  return apiRequest(path, { ...options, method: "GET" });
}

export function apiPost(path, options = {}) {
  return apiRequest(path, { ...options, method: "POST" });
}

export function apiPut(path, options = {}) {
  return apiRequest(path, { ...options, method: "PUT" });
}

export function apiDelete(path, options = {}) {
  return apiRequest(path, { ...options, method: "DELETE" });
}

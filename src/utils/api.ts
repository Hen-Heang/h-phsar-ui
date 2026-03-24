import axios from "axios";

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
  if (isRedirectingToSignIn || window.location.pathname.startsWith("/sign-in"))
    return;
  isRedirectingToSignIn = true;
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("userId");
  window.location.href = "/sign-in";
}

export const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080"}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token from localStorage on every request
api.interceptors.request.use((config) => {
  if (typeof window === "undefined") return config;

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
  (error) => {
    if (
      error.response?.status === 401 &&
      !error.config?.skipAuthRedirect &&
      typeof window !== "undefined"
    ) {
      redirectToSignIn();
    }
    return Promise.reject(error);
  },
);

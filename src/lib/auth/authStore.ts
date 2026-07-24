import { useSyncExternalStore } from "react";

// In-memory access-token store. Deliberately not persisted (no localStorage/
// sessionStorage) so a page reload never leaves a bearer token sitting
// somewhere XSS can read it. Persistence instead comes from the backend's
// httpOnly refresh-token cookie (verified working end-to-end): on mount,
// AuthInitializer calls /authorization/refresh (cookie sent automatically) to
// re-hydrate the token here.
type AuthStatus = "checking" | "ready";

let token: string | null = null;
let status: AuthStatus = "checking";
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((listener) => listener());
}

export function getAuthToken(): string | null {
  return token;
}

export function setAuthToken(next: string | null): void {
  token = next;
  emit();
}

export function clearAuthToken(): void {
  token = null;
  emit();
}

export function getAuthStatus(): AuthStatus {
  return status;
}

// Called after the silent-refresh attempt settles (success or failure) so
// gated shells (useRoleGuard) know it's safe to redirect on a missing token.
export function markAuthReady(): void {
  status = "ready";
  emit();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useAuthToken(): string | null {
  return useSyncExternalStore(subscribe, getAuthToken, () => null);
}

export function useAuthStatus(): AuthStatus {
  return useSyncExternalStore(subscribe, getAuthStatus, () => "checking");
}

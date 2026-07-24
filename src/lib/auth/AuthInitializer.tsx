"use client";

import { useEffect } from "react";
import { refreshAccessToken } from "@/lib/auth/auth.service";
import { markAuthReady, setAuthToken } from "@/lib/auth/authStore";

// Runs once per app load. Attempts a silent refresh against the httpOnly
// refresh-token cookie; on any failure (network error, 401, no cookie at all)
// it just leaves the user unauthenticated — gated shells (useRoleGuard) fall
// back to redirecting to /sign-in. markAuthReady() always runs last (success
// or failure) so useAuthStatus() flips to "ready" exactly once and
// useRoleGuard is never blocked waiting on this.
export default function AuthInitializer() {
  useEffect(() => {
    let cancelled = false;

    refreshAccessToken()
      .then((res) => {
        if (cancelled || !res.ok) return;
        const token = res.data?.data?.token;
        if (token) setAuthToken(token);
      })
      .catch(() => {
        // Ignored — markAuthReady() below still runs via finally.
      })
      .finally(() => {
        if (!cancelled) markAuthReady();
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ROLES, roleIdToRole, type Role } from "@/config/roles";
import { useAuthStatus, useAuthToken } from "@/lib/auth/authStore";

// Waits for the silent-refresh attempt (AuthInitializer) to settle before
// deciding to redirect, so a valid refresh cookie isn't raced by a premature
// "no token yet" bounce to /sign-in.
export function useRoleGuard(requiredRole: Role): boolean {
  const router = useRouter();
  const status = useAuthStatus();
  const token = useAuthToken();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (status !== "ready") return;

    let role: Role | null = null;
    try {
      role = roleIdToRole(Number(localStorage.getItem("role")));
    } catch {
      role = null;
    }

    if (!token || role !== requiredRole) {
      router.replace("/sign-in");
    } else {
      setIsAuthorized(true);
    }
  }, [status, token, requiredRole, router]);

  return isAuthorized;
}

export { ROLES };

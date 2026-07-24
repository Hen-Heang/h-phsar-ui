"use client";

import type { ReactNode } from "react";
import type { Role } from "@/config/roles";
import { useRoleGuard } from "@/lib/auth/useRoleGuard";

interface RoleGuardProps {
  role: Role;
  children: ReactNode;
}

export function RoleGuard({ role, children }: RoleGuardProps) {
  const isAuthorized = useRoleGuard(role);

  if (!isAuthorized) {
    return (
      <main
        className="grid min-h-screen place-items-center bg-background px-6 text-foreground"
        aria-busy="true"
        aria-live="polite"
      >
        <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
          <span
            className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-primary motion-reduce:animate-none"
            aria-hidden="true"
          />
          Checking access…
        </div>
      </main>
    );
  }

  return children;
}

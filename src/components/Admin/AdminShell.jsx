"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ROLES, roleIdToRole } from "@/config/roles";

// No backend support for ADMIN exists yet (no roleId maps to it, no
// /api/v1/admin/** routes) — this guard will always redirect today. That's
// correct: there is no way to reach this shell with a real account until the
// backend adds admin support. See the migration audit's Admin findings.
export default function AdminShell({ children }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    let role = null;
    try {
      role = roleIdToRole(Number(localStorage.getItem("role")));
    } catch {
      role = null;
    }
    if (!token || role !== ROLES.ADMIN) {
      router.replace("/sign-in");
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  if (!isAuthorized) return null;

  return <div className="min-h-screen bg-slate-50">{children}</div>;
}

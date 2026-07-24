"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ROLES, roleIdToRole } from "@/config/roles";

// Backend has ADMIN login support (roleId 3, /api/v1/admin/** reserved in
// SecurityConfig) but no admin-only business endpoints yet — an admin account
// created via the manual DB seed (see h-phsar-api-full DatabaseInitializer)
// can log in and reach this shell; there's just nothing behind it yet.
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

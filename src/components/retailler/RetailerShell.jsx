"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NavBarRetailerComponent from "./NavBarRetailerComponent";
import FooterRetailerComponent from "./FooterRetailerComponent";
import { ROLES, roleIdToRole } from "@/config/roles";

export default function RetailerShell({ children }) {
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
    if (!token || role !== ROLES.BUYER) {
      router.replace("/sign-in");
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  if (!isAuthorized) return null;

  return (
    <div className="min-h-screen bg-slate-50  font-family-retailer">
      <NavBarRetailerComponent />
      <main className="relative">{children}</main>
      <FooterRetailerComponent />
    </div>
  );
}

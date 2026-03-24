"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NavBarRetailerComponent from "./NavBarRetailerComponent";
import FooterRetailerComponent from "./FooterRetailerComponent";

export default function RetailerShell({ children }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    console.log("[RetailerShell] token:", !!token, "| role:", role);
    if (!token || String(role) !== "2") {
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

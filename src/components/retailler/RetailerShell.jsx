"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import NavBarRetailerComponent from "./NavBarRetailerComponent";
import FooterRetailerComponent from "./FooterRetailerComponent";

export default function RetailerShell({ children }) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token || role !== "2") {
      router.replace("/sign-in");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50  font-family-retailer">
      <NavBarRetailerComponent />
      <main className="relative">{children}</main>
      <FooterRetailerComponent />
    </div>
  );
}

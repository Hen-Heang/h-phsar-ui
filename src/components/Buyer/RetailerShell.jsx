"use client";

import NavBarRetailerComponent from "./NavBarRetailerComponent";
import FooterRetailerComponent from "./FooterRetailerComponent";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { ROLES } from "@/config/roles";

export default function RetailerShell({ children }) {
  return (
    <RoleGuard role={ROLES.BUYER}>
      <div className="min-h-screen bg-background font-family-retailer">
        <NavBarRetailerComponent />
        <main className="relative">{children}</main>
        <FooterRetailerComponent />
      </div>
    </RoleGuard>
  );
}

"use client";

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { ROLES } from "@/config/roles";

export default function DistributorShell({ children }) {
  return (
    <RoleGuard role={ROLES.SUPPLIER}>
      <div className="min-h-screen bg-background transition-colors lg:flex">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Navbar />
          <main className="mx-auto w-full max-w-7xl flex-1 p-4 md:p-8">
            {children}
          </main>
        </div>
      </div>
    </RoleGuard>
  );
}

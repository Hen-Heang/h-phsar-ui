"use client";

import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { ADMIN_NAV } from "@/config/navigation";

const WIRED_HREFS = new Set(["/admin/suppliers", "/admin/buyers"]);

// Suppliers/Buyers are wired to real pages + backend endpoints; the rest of
// ADMIN_NAV (Users/Stores/Orders/Reports/Audit Logs/Settings) is still
// future scope — see navigation.ts.
export default function AdminDashboard() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-md text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
          <ShieldAlert className="h-8 w-8 text-slate-400" />
        </div>
        <h1 className="text-2xl font-black text-slate-900">Admin</h1>
        <p className="text-slate-500">
          Supplier and buyer account management is available below. The rest
          of the admin console is still under construction.
        </p>
        <ul className="text-left text-sm pt-4 space-y-1">
          {ADMIN_NAV.map((item) =>
            WIRED_HREFS.has(item.href) ? (
              <li key={item.href}>
                <Link href={item.href} className="font-bold text-blue-600 hover:underline">
                  {item.label}
                </Link>
              </li>
            ) : (
              <li key={item.href} className="text-slate-400">
                {item.label} — future scope
              </li>
            ),
          )}
        </ul>
      </div>
    </div>
  );
}

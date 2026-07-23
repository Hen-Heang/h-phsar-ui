"use client";

import { ShieldAlert } from "lucide-react";
import { ADMIN_NAV } from "@/config/navigation";

// Deliberately static — no API calls. The backend has no admin endpoints,
// no admin role id, and no way to create an admin account today (verified
// against h-phsar-api-full). This is a placeholder shell only; do not wire
// real data into it until the backend contract exists.
export default function AdminDashboard() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-md text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
          <ShieldAlert className="h-8 w-8 text-slate-400" />
        </div>
        <h1 className="text-2xl font-black text-slate-900">Admin — Coming Soon</h1>
        <p className="text-slate-500">
          The admin role isn&apos;t supported by the backend yet — no admin
          accounts, permissions, or API endpoints exist. This page is a
          placeholder for future work.
        </p>
        <ul className="text-left text-sm text-slate-400 pt-4 space-y-1">
          {ADMIN_NAV.map((item) => (
            <li key={item.href}>{item.label} — future scope</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

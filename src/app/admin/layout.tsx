"use client";

import nextDynamic from "next/dynamic";

export const dynamic = "force-dynamic";

const AdminShell = nextDynamic(() => import("@/components/Admin/AdminShell"), {
  ssr: false,
});

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}

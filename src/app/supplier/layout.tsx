"use client";

import dynamic from "next/dynamic";

const SupplierShell = dynamic(
  () => import("@/components/Distributor/DistributorShell"),
  { ssr: false },
);

export default function SupplierLayout({ children }: { children: React.ReactNode }) {
  return <SupplierShell>{children}</SupplierShell>;
}

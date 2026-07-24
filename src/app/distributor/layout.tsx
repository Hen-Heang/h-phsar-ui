"use client";

import dynamic from "next/dynamic";

const DistributorShell = dynamic(
  () => import("@/components/Supplier/DistributorShell"),
  { ssr: false },
);

export default function DistributorLayout({ children }: { children: React.ReactNode }) {
  return <DistributorShell>{children}</DistributorShell>;
}

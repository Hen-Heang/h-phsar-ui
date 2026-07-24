"use client";

import dynamic from "next/dynamic";

const RetailerShell = dynamic(
  () => import("@/components/Buyer/RetailerShell"),
  { ssr: false },
);

export default function RetailerLayout({ children }: { children: React.ReactNode }) {
  return <RetailerShell>{children}</RetailerShell>;
}

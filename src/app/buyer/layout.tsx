"use client";

import dynamic from "next/dynamic";

const BuyerShell = dynamic(
  () => import("@/components/Buyer/RetailerShell"),
  { ssr: false },
);

export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  return <BuyerShell>{children}</BuyerShell>;
}

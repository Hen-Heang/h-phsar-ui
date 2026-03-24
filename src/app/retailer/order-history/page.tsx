"use client";

import dynamic from "next/dynamic";

const OrderHistoryRetail = dynamic(
  () => import("@/components/retailler/OrderHistoryRetail"),
  { ssr: false },
);

export default function RetailerOrderHistoryPage() {
  return <OrderHistoryRetail />;
}

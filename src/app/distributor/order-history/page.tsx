"use client";
import dynamic from "next/dynamic";
const OrderHistory = dynamic(
  () => import("@/components/Distributor/OrderHistory"),
  { ssr: false },
);
export default function DistributorOrderHistoryPage() {
  return <OrderHistory />;
}
